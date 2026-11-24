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
  const respuesta = await fetch(url);
  if (!respuesta.ok) {
    throw new Error(`Georef respondio ${respuesta.status} para ${url}`);
  }
  return (await respuesta.json()) as T;
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
  for (const localidad of localidades) {
    const clave = normalizar(localidad.nombre);
    repeticiones.set(clave, (repeticiones.get(clave) ?? 0) + 1);
  }
  const nombres = new Map<string, string>();
  for (const localidad of localidades) {
    const repetido = (repeticiones.get(normalizar(localidad.nombre)) ?? 0) > 1;
    nombres.set(localidad.id, repetido && localidad.departamento.nombre ? `${localidad.nombre} (${localidad.departamento.nombre})` : localidad.nombre);
  }
  return nombres;
}

async function seedProvincia(manager: EntityManager, provinciaGeoref: GeorefProvincia) {
  const repositorioProvincias = manager.getRepository(Provincia);
  const repositorioLocalidades = manager.getRepository(Localidad);

  // 1. La provincia: por idGeoref, o por nombre si se habia cargado a mano
  let provincia =
    (await repositorioProvincias.findOne({ where: { idGeoref: provinciaGeoref.id }, withDeleted: true })) ??
    (await repositorioProvincias
      .find({ where: { idGeoref: IsNull() }, withDeleted: true })
      .then((provincias) => provincias.find((provincia) => normalizar(provincia.nombreProvincia) === normalizar(provinciaGeoref.nombre)) ?? null));

  if (provincia?.deleteAt) {
    console.log(`- ${provinciaGeoref.nombre}: dada de baja en la base, se saltea`);
    return;
  }
  if (!provincia) {
    provincia = repositorioProvincias.create({ nombreProvincia: provinciaGeoref.nombre });
  }
  provincia.idGeoref = provinciaGeoref.id;
  provincia = await repositorioProvincias.save(provincia);

  // 2. Sus localidades
  const { localidades } = await getJson<{ localidades: GeorefLocalidad[] }>(
    `${GEOREF_URL}/localidades?provincia=${provinciaGeoref.id}&campos=id,nombre,departamento.nombre&max=5000`,
  );
  const nombres = nombresVisibles(localidades);

  const existentes = await repositorioLocalidades.find({
    where: { provincia: { idProvincia: provincia.idProvincia } },
    withDeleted: true,
  });
  const porIdGeoref = new Map(existentes.filter((localidad) => localidad.idGeoref).map((localidad) => [localidad.idGeoref, localidad]));
  const porNombre = new Map(
    existentes.filter((localidad) => !localidad.idGeoref).map((localidad) => [normalizar(localidad.nombreLocalidad), localidad]),
  );

  const aGuardar: Localidad[] = [];
  let nuevas = 0;
  let salteadas = 0;
  for (const localidadGeoref of localidades) {
    const nombre = nombres.get(localidadGeoref.id)!;
    const existente = porIdGeoref.get(localidadGeoref.id) ?? porNombre.get(normalizar(nombre)) ?? porNombre.get(normalizar(localidadGeoref.nombre));

    if (existente?.deletedAt) {
      salteadas++;
      continue;
    }
    if (existente) {
      // Ya estaba: se le completa el idGeoref (y se evita volver a matchearla por nombre)
      porNombre.delete(normalizar(existente.nombreLocalidad));
      existente.idGeoref = localidadGeoref.id;
      aGuardar.push(existente);
    } else {
      nuevas++;
      aGuardar.push(
        repositorioLocalidades.create({ nombreLocalidad: nombre, codigoPostal: null, idGeoref: localidadGeoref.id, provincia }),
      );
    }
  }
  await repositorioLocalidades.save(aGuardar, { chunk: 500 });

  console.log(
    `- ${provinciaGeoref.nombre}: ${localidades.length} localidades (${nuevas} nuevas` +
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

    for (const provinciaGeoref of provincias) {
      // De a una provincia por vez, en una transaccion: si algo falla no queda a medias
      await dataSource.transaction((manager) => seedProvincia(manager, provinciaGeoref));
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
