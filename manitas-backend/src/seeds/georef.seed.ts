// Seed del catalogo de ubicaciones: carga las provincias y localidades de Argentina
// desde la API Georef del Gobierno (https://apis.datos.gob.ar/georef).
//
// Uso:  npm run seed:georef   (ver instrucciones en manitas-backend/SEED.md)
//
// - Se puede correr varias veces: usa el id oficial de Georef (columna idGeoref) para
//   no duplicar. Si ya habia provincias/localidades cargadas a mano con el mismo nombre,
//   las reutiliza (les completa el idGeoref) en vez de crear otras.
// - No toca las zonas: esas se cargan aparte.
// - Respeta lo borrado: si una provincia/localidad fue dada de baja, no la revive.
import { NestFactory } from '@nestjs/core';
import { DataSource, EntityManager, IsNull } from 'typeorm';
import { AppModule } from '../app.module';
import { Provincia } from '../provincia/entities/provincia.entity';
import { Localidad } from '../localidad/entities/localidad.entity';

const GEOREF_URL = 'https://apis.datos.gob.ar/georef/api';

interface GeorefProvincia {
  id: string;
  nombre: string;
}

interface GeorefLocalidad {
  id: string;
  nombre: string;
  departamento: { nombre: string | null };
}

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Georef respondio ${res.status} para ${url}`);
  }
  return (await res.json()) as T;
}

// Para comparar nombres sin importar mayusculas ni tildes ("Neuquén" = "neuquen")
function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();
}

// En una misma provincia hay localidades con el mismo nombre (ej: varias "San José" en
// Buenos Aires). A esas se les agrega el departamento para poder distinguirlas en la lista.
function nombresVisibles(localidades: GeorefLocalidad[]): Map<string, string> {
  const repeticiones = new Map<string, number>();
  for (const l of localidades) {
    const clave = normalizar(l.nombre);
    repeticiones.set(clave, (repeticiones.get(clave) ?? 0) + 1);
  }
  const nombres = new Map<string, string>();
  for (const l of localidades) {
    const repetido = (repeticiones.get(normalizar(l.nombre)) ?? 0) > 1;
    nombres.set(l.id, repetido && l.departamento.nombre ? `${l.nombre} (${l.departamento.nombre})` : l.nombre);
  }
  return nombres;
}

async function seedProvincia(manager: EntityManager, gp: GeorefProvincia) {
  const provinciaRepo = manager.getRepository(Provincia);
  const localidadRepo = manager.getRepository(Localidad);

  // 1. La provincia: por idGeoref, o por nombre si se habia cargado a mano
  let provincia =
    (await provinciaRepo.findOne({ where: { idGeoref: gp.id }, withDeleted: true })) ??
    (await provinciaRepo
      .find({ where: { idGeoref: IsNull() }, withDeleted: true })
      .then((ps) => ps.find((p) => normalizar(p.nombreProvincia) === normalizar(gp.nombre)) ?? null));

  if (provincia?.deleteAt) {
    console.log(`- ${gp.nombre}: dada de baja en la base, se saltea`);
    return;
  }
  if (!provincia) {
    provincia = provinciaRepo.create({ nombreProvincia: gp.nombre });
  }
  provincia.idGeoref = gp.id;
  provincia = await provinciaRepo.save(provincia);

  // 2. Sus localidades
  const { localidades } = await getJson<{ localidades: GeorefLocalidad[] }>(
    `${GEOREF_URL}/localidades?provincia=${gp.id}&campos=id,nombre,departamento.nombre&max=5000`,
  );
  const nombres = nombresVisibles(localidades);

  const existentes = await localidadRepo.find({
    where: { provincia: { idProvincia: provincia.idProvincia } },
    withDeleted: true,
  });
  const porIdGeoref = new Map(existentes.filter((l) => l.idGeoref).map((l) => [l.idGeoref, l]));
  const porNombre = new Map(
    existentes.filter((l) => !l.idGeoref).map((l) => [normalizar(l.nombreLocalidad), l]),
  );

  const aGuardar: Localidad[] = [];
  let nuevas = 0;
  let salteadas = 0;
  for (const gl of localidades) {
    const nombre = nombres.get(gl.id)!;
    const existente = porIdGeoref.get(gl.id) ?? porNombre.get(normalizar(nombre)) ?? porNombre.get(normalizar(gl.nombre));

    if (existente?.deletedAt) {
      salteadas++;
      continue;
    }
    if (existente) {
      // Ya estaba: se le completa el idGeoref (y se evita volver a matchearla por nombre)
      porNombre.delete(normalizar(existente.nombreLocalidad));
      existente.idGeoref = gl.id;
      aGuardar.push(existente);
    } else {
      nuevas++;
      aGuardar.push(
        localidadRepo.create({ nombreLocalidad: nombre, codigoPostal: null, idGeoref: gl.id, provincia }),
      );
    }
  }
  await localidadRepo.save(aGuardar, { chunk: 500 });

  console.log(
    `- ${gp.nombre}: ${localidades.length} localidades (${nuevas} nuevas` +
      (salteadas ? `, ${salteadas} dadas de baja salteadas` : '') +
      ')',
  );
}

async function main() {
  // Levanta la app sin servidor HTTP: usa la misma conexion a MySQL del .env
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn'] });
  try {
    const dataSource = app.get(DataSource);
    const { provincias } = await getJson<{ provincias: GeorefProvincia[] }>(
      `${GEOREF_URL}/provincias?campos=id,nombre&orden=nombre&max=100`,
    );
    console.log(`Georef: ${provincias.length} provincias. Cargando...`);

    for (const gp of provincias) {
      // De a una provincia por vez, en una transaccion: si algo falla no queda a medias
      await dataSource.transaction((manager) => seedProvincia(manager, gp));
    }
    console.log('Listo.');
  } finally {
    await app.close();
  }
}

main().catch((error) => {
  console.error('Error en el seed de Georef:', error);
  process.exit(1);
});
