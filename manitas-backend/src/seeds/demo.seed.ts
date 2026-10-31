// Seed de DATOS INICIALES: oficios, zonas, clientes, profesionales y solicitudes en todos los
// estados, para poder mostrar el sistema de punta a punta (pedir, aceptar, presupuestar, pagar...).
//
// Uso:  pnpm run seed:demo   (ver manitas-backend/SEED.md)
//
// - Se puede correr varias veces: busca por nombre / correo y no duplica.
// - No modifica nada que ya exista (usuarios, oficios ni zonas): solo agrega lo que falta.
// - Las solicitudes de ejemplo se crean una sola vez (si Maxi no tiene ninguna).
// - Todas las cuentas usan la contraseña CONTRASEÑA (abajo), menos la de Maxi, que sale del .env
//   (SEED_CONTRASENA_MAXI; si no está, usa CONTRASEÑA).
import { NestFactory } from '@nestjs/core';
import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { AppModule } from '../app.module';
import { Provincia } from '../provincia/entities/provincia.entity';
import { Localidad } from '../localidad/entities/localidad.entity';
import { Zona } from '../zona/entities/zona.entity';
import { Especialidad } from '../especialidad/entities/especialidad.entity';
import { TiposDeServicio } from '../tipos-de-servicio/entities/tipos-de-servicio.entity';
import { Cliente } from '../cliente/entities/cliente.entity';
import { Profesional } from '../profesional/entities/profesional.entity';
import { SolicitudDeServicio } from '../solicitud-de-servicio/entities/solicitud-de-servicio.entity';
import { SolicitudDeServicioService } from '../solicitud-de-servicio/solicitud-de-servicio.service';
import { TurnoService } from '../turno/turno.service';
import { MetodoDePago } from '../metodo-de-pago/entities/metodo-de-pago.entity';
import { Promocion } from '../promocion/entities/promocion.entity';
import { EstadoSolicitud } from '../common/enums/estado-solicitud.enum';
import { Rol } from '../common/enums/rol.enum';

const CONTRASEÑA = 'Manitas123';

// ---------- Catálogo ----------

// Los mismos oficios que muestra el front (y la sesión demo), con algunas habilidades de cada uno
const OFICIOS: { nombre: string; descripcion: string; habilidades: string[] }[] = [
  { nombre: 'Electricidad', descripcion: 'Instalaciones eléctricas, tableros y reparaciones', habilidades: ['Cambio de tomas y llaves', 'Tableros y disyuntores', 'Instalación de luminarias'] },
  { nombre: 'Plomería', descripcion: 'Agua, desagües, pérdidas y artefactos sanitarios', habilidades: ['Destapaciones', 'Pérdidas de agua', 'Termotanques y calefones'] },
  { nombre: 'Gas', descripcion: 'Instalaciones y artefactos de gas (gasista matriculado)', habilidades: ['Instalación de artefactos', 'Prueba de hermeticidad', 'Detección de pérdidas'] },
  { nombre: 'Pintura', descripcion: 'Pintura de interiores y exteriores', habilidades: ['Interiores', 'Exteriores y frentes', 'Tratamiento de humedad'] },
  { nombre: 'Albañilería', descripcion: 'Construcción, reformas y reparaciones de mampostería', habilidades: ['Revoques', 'Colocación de cerámicos', 'Pequeñas reformas'] },
  { nombre: 'Carpintería', descripcion: 'Muebles a medida y aberturas de madera', habilidades: ['Muebles a medida', 'Placares', 'Arreglo de puertas y ventanas'] },
  { nombre: 'Cerrajería', descripcion: 'Cerraduras, llaves y aperturas', habilidades: ['Apertura de puertas', 'Cambio de cerraduras', 'Copias de llaves'] },
  { nombre: 'Climatización', descripcion: 'Aires acondicionados y calefacción', habilidades: ['Instalación de aires', 'Carga de gas', 'Mantenimiento'] },
  { nombre: 'Limpieza', descripcion: 'Limpieza de hogares y final de obra', habilidades: ['Limpieza general', 'Final de obra', 'Vidrios'] },
  { nombre: 'Jardinería', descripcion: 'Mantenimiento de jardines y espacios verdes', habilidades: ['Corte de césped', 'Poda', 'Diseño de canteros'] },
];

// Palabras con las que el cliente cuenta su problema: el buscador las usa para llevarlo al oficio.
// Despues el admin las puede ir sumando desde su panel
const PALABRAS_CLAVE: Record<string, string> = {
  Electricidad:
    'electricista, electricidad, luz, sin luz, se cortó la luz, corte de luz, enchufe, toma, tomacorriente, llave de luz, interruptor, ' +
    'cable, cableado, corto, cortocircuito, chispa, tablero, disyuntor, térmica, salta la térmica, lámpara, foco, luminaria, ' +
    'plafón, aplique, dicroica, led, ventilador de techo, timbre, portero eléctrico, alargue, zapatilla, tensión, puesta a tierra',
  Plomería:
    'plomero, plomería, caño, caños, cañería, canilla, grifo, griferia, pérdida, pérdida de agua, gotea, goteo, inodoro, mochila, ' +
    'depósito, bidet, lavatorio, pileta, bacha, ducha, bañera, baño, destapar, destapación, tapado, desagüe, cloaca, rejilla, sifón, ' +
    'agua, sin agua, poca presión, tanque, tanque de agua, flotante, bomba de agua, termotanque, agua caliente, humedad en el piso',
  Gas:
    'gasista, gas, olor a gas, pérdida de gas, calefón, termotanque a gas, estufa, calefactor, tiro balanceado, cocina, hornalla, ' +
    'horno, garrafa, gas natural, medidor de gas, llave de gas, caño de gas, matafuego, monóxido, piloto, no prende, habilitación de gas',
  Pintura:
    'pintor, pintura, pintar, pared, paredes, techo, cielorraso, humedad, mancha, manchas, moho, hongos, descascarado, se descascara, ' +
    'frente, fachada, rejas, puertas, aberturas, barniz, laca, esmalte, látex, impermeabilizante, membrana líquida, empapelado, enduido',
  Albañilería:
    'albañil, albañilería, pared, rajadura, grieta, fisura, revoque, revoque caído, azulejo, azulejos, cerámico, cerámica, porcelanato, ' +
    'piso, contrapiso, carpeta, ladrillo, mampostería, construcción, reforma, ampliación, demolición, cemento, yeso, durlock, ' +
    'humedad de cimientos, techo, losa, filtración, goteras, membrana, impermeabilización, vereda, parrilla',
  Carpintería:
    'carpintero, carpintería, madera, mueble, muebles, mueble a medida, puerta, puertas, placard, placares, vestidor, ventana, ' +
    'ventanas, persiana, postigo, bisagra, cajón, cajonera, estante, estantería, alacena, bajo mesada, mesa, silla, deck, pérgola, ' +
    'marco, zócalo, se traba, no cierra, lustrar, restaurar',
  Cerrajería:
    'cerrajero, cerrajería, llave, llaves, copia de llave, cerradura, cambio de cerradura, me quedé afuera, quedé afuera, ' +
    'puerta trabada, no abre, perdí la llave, candado, cerrojo, traba, combinación, caja fuerte, puerta blindada, picaporte, cilindro, ' +
    'auto',
  Climatización:
    'aire, aire acondicionado, acondicionado, split, ventana, frío, calor, no enfría, no calienta, gotea el aire, carga de refrigerante, ' +
    'instalación de aire, service de aire, filtro, calefacción, caldera, radiador, losa radiante, ventilación, ' +
    'extractor, climatización, climatizador',
  Limpieza:
    'limpieza, limpiar, limpiadora, final de obra, después de obra, mudanza, limpieza profunda, vidrios, ventanas, alfombra, alfombras, ' +
    'tapizado, sillón, colchón, cortinas, cocina, baño, azulejos, desinfección, orden, casa, departamento, oficina, plancha',
  Jardinería:
    'jardinero, jardinería, jardín, patio, parque, pasto, césped, cortar el pasto, corte de pasto, bordes, flores, plantas, planta, ' +
    'macetas, cantero, canteros, árbol, árboles, poda, podar, cerco, ligustro, arbusto, seto, hojas, malezas, yuyos, desmalezado, ' +
    'riego, regar, riego automático, semillas, siembra, abono, fertilizante, plagas, fumigación, huerta, pileta, paisajismo',
};

// Junta dos listas separadas por coma, sin repetir (sin importar mayúsculas ni tildes)
function juntarPalabras(actuales: string | null, nuevas: string): string {
  const lista = [...(actuales ?? '').split(','), ...nuevas.split(',')].map((p) => p.trim()).filter(Boolean);
  const vistas = new Set<string>();
  return lista.filter((p) => !vistas.has(normalizar(p)) && vistas.add(normalizar(p))).join(', ');
}

// Los 6 distritos oficiales de la Municipalidad de Rosario
const ZONAS_ROSARIO = ['Centro', 'Norte', 'Noroeste', 'Oeste', 'Sudoeste', 'Sur'];
// Zonas que cargaba una version vieja del seed y no son distritos: su gente pasa al distrito y se dan de baja
const ZONAS_VIEJAS: Record<string, string> = { Echesortu: 'Centro', Fisherton: 'Noroeste' };

// ---------- Usuarios ----------

interface ClienteSeed {
  correo: string;
  // Si no viene, usa CONTRASEÑA
  contraseña?: string;
  nombre: string;
  apellido: string;
  dni: number;
  telefono: string;
  calle: string;
  altura: number;
  piso?: string;
  depto?: string;
  zona: string;
}

// La cuenta de Maxi: su contraseña NO va en el código (el repo es público), sale del .env
const MAXI = 'maxi.rp002@gmail.com';

const CLIENTES: ClienteSeed[] = [
  { correo: MAXI, contraseña: process.env.SEED_CONTRASENA_MAXI, nombre: 'Maximiliano', apellido: 'Monzón', dni: 40123456, telefono: '3415550101', calle: 'Corrientes', altura: 950, piso: '4', depto: 'C', zona: 'Centro' },
  { correo: 'valeriagodoy.ros@gmail.com', nombre: 'Valeria', apellido: 'Godoy', dni: 31222333, telefono: '3415550102', calle: 'Mendoza', altura: 3240, zona: 'Oeste' },
  { correo: 'fede.ibarra88@gmail.com', nombre: 'Federico', apellido: 'Ibarra', dni: 33444555, telefono: '3415550103', calle: 'Alberdi', altura: 850, zona: 'Norte' },
  { correo: 'camirossi.95@gmail.com', nombre: 'Camila', apellido: 'Rossi', dni: 38777888, telefono: '3415550104', calle: 'Paraguay', altura: 1120, piso: '5', depto: 'A', zona: 'Centro' },
  { correo: 'gusmolina.rosario@gmail.com', nombre: 'Gustavo', apellido: 'Molina', dni: 27555666, telefono: '3415550105', calle: 'Uriburu', altura: 1240, zona: 'Sur' },
  { correo: 'nati.herrera.82@gmail.com', nombre: 'Natalia', apellido: 'Herrera', dni: 29888999, telefono: '3415550106', calle: 'Eva Perón', altura: 7810, zona: 'Noroeste' },
];

interface ProfesionalSeed {
  correo: string;
  nombre: string;
  apellido: string;
  dni: number;
  telefono: string;
  oficios: string[];
  zonas: string[];
  costoVisita: number | null;
  descripcion: string;
  cbu: string;
  matricula?: { oficio: string; numero: string; descripcion: string };
  // [diaSemana, desde, hasta] (0 = domingo)
  horario: [number, number, number][];
}

const LUNES_A_VIERNES = (desde: number, hasta: number): [number, number, number][] =>
  [1, 2, 3, 4, 5].map((d) => [d, desde, hasta]);

const PROFESIONALES: ProfesionalSeed[] = [
  { correo: 'raulbustos.plomeria@gmail.com', nombre: 'Raúl', apellido: 'Bustos', dni: 25111222, telefono: '3416662001', oficios: ['Plomería', 'Gas'], zonas: ['Centro', 'Norte', 'Oeste'], costoVisita: 5000, descripcion: 'Plomero y gasista con 20 años de experiencia. Pérdidas, destapaciones, termotanques y calefones.', cbu: '0110599520000001234561', matricula: { oficio: 'Gas', numero: 'MG-4521', descripcion: 'Gasista de 2da categoría - Litoral Gas' }, horario: [...LUNES_A_VIERNES(8, 17), [6, 9, 13]] },
  { correo: 'sergioledesma.electricista@gmail.com', nombre: 'Sergio', apellido: 'Ledesma', dni: 26222333, telefono: '3416662002', oficios: ['Electricidad'], zonas: ['Centro', 'Sur', 'Oeste', 'Sudoeste'], costoVisita: 4500, descripcion: 'Electricista matriculado. Instalaciones nuevas, tableros, disyuntores y reparaciones.', cbu: '0170099220000067890123', matricula: { oficio: 'Electricidad', numero: 'ME-1187', descripcion: 'Colegio de Técnicos de Santa Fe' }, horario: LUNES_A_VIERNES(9, 18) },
  { correo: 'silviaortiz.pinturas@gmail.com', nombre: 'Silvia', apellido: 'Ortiz', dni: 27333444, telefono: '3416662003', oficios: ['Pintura', 'Albañilería'], zonas: ['Centro', 'Norte', 'Noroeste'], costoVisita: null, descripcion: 'Pintura de interiores y exteriores, reparación de paredes y humedad. Presupuesto sin cargo.', cbu: '0720000788000012345678', horario: [...LUNES_A_VIERNES(8, 13), ...LUNES_A_VIERNES(15, 19)] },
  { correo: 'damianaguirre.carpinteria@gmail.com', nombre: 'Damián', apellido: 'Aguirre', dni: 28444555, telefono: '3416662004', oficios: ['Carpintería'], zonas: ['Centro', 'Oeste', 'Noroeste'], costoVisita: 5000, descripcion: 'Muebles a medida, placares y arreglos de aberturas de madera.', cbu: '0140999801200012345671', horario: LUNES_A_VIERNES(9, 17) },
  { correo: 'marceloquiroga.gasista@gmail.com', nombre: 'Marcelo', apellido: 'Quiroga', dni: 29555666, telefono: '3416662005', oficios: ['Gas', 'Climatización'], zonas: ['Norte', 'Sur', 'Noroeste', 'Sudoeste'], costoVisita: 6000, descripcion: 'Gasista matriculado e instalador de aires acondicionados.', cbu: '0150501102000123456789', matricula: { oficio: 'Gas', numero: 'MG-7730', descripcion: 'Gasista de 1ra categoría - ENARGAS' }, horario: [...LUNES_A_VIERNES(8, 16), [6, 8, 12]] },
  { correo: 'cerrajeriavillalba@gmail.com', nombre: 'Héctor', apellido: 'Villalba', dni: 24666777, telefono: '3416662006', oficios: ['Cerrajería'], zonas: ['Centro', 'Norte', 'Noroeste', 'Oeste', 'Sudoeste', 'Sur'], costoVisita: 3500, descripcion: 'Cerrajería las 24 horas. Aperturas, cambio de cerraduras y combinaciones.', cbu: '0340040108400012345675', horario: [0, 1, 2, 3, 4, 5, 6].map((d) => [d, 8, 22] as [number, number, number]) },
  { correo: 'graciela.romero.limpieza@gmail.com', nombre: 'Graciela', apellido: 'Romero', dni: 30777888, telefono: '3416662007', oficios: ['Limpieza'], zonas: ['Centro', 'Norte', 'Noroeste'], costoVisita: null, descripcion: 'Limpieza de casas, departamentos y final de obra.', cbu: '0070999030004012345671', horario: [...LUNES_A_VIERNES(8, 14), [6, 8, 12]] },
  { correo: 'ezequieltoledo.jardines@gmail.com', nombre: 'Ezequiel', apellido: 'Toledo', dni: 31888999, telefono: '3416662008', oficios: ['Jardinería'], zonas: ['Noroeste', 'Oeste', 'Norte'], costoVisita: 3000, descripcion: 'Corte de césped, poda y mantenimiento de jardines.', cbu: '2850590940090412345671', horario: [[2, 8, 16], [4, 8, 16], [6, 8, 14]] },
  { correo: 'leandrocabrera.clima@gmail.com', nombre: 'Leandro', apellido: 'Cabrera', dni: 32999000, telefono: '3416662009', oficios: ['Climatización', 'Electricidad'], zonas: ['Centro', 'Sur', 'Sudoeste'], costoVisita: 5500, descripcion: 'Instalación y service de aires acondicionados split. También electricidad domiciliaria.', cbu: '0720168520000001234567', horario: LUNES_A_VIERNES(10, 19) },
];

// ---------- Ayudas ----------

const UNA_HORA = 60 * 60 * 1000;

function normalizar(texto: string): string {
  return texto.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();
}

// Un día desde hoy, a una hora en punto
function dia(desdeHoy: number, hora: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + desdeHoy);
  d.setHours(hora, 0, 0, 0);
  return d;
}

const masHoras = (fecha: Date, horas: number) => new Date(fecha.getTime() + horas * UNA_HORA);
const hace = (horas: number) => new Date(Date.now() - horas * UNA_HORA);

// Fecha local sin zona ("2026-10-20T10:00:00"), como la espera la API
function local(fecha: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${fecha.getFullYear()}-${p(fecha.getMonth() + 1)}-${p(fecha.getDate())}T${p(fecha.getHours())}:00:00`;
}

async function buscarPorNombre<T extends object>(repo: Repository<T>, campo: keyof T, nombre: string, extra: Partial<Record<keyof T, unknown>> = {}) {
  const todos = await repo.find({ where: extra as never, withDeleted: false });
  return todos.find((x) => normalizar(String(x[campo])) === normalizar(nombre)) ?? null;
}

// ---------- Pasos ----------

async function seedCatalogo(ds: DataSource) {
  const provincias = ds.getRepository(Provincia);
  const localidades = ds.getRepository(Localidad);
  const zonas = ds.getRepository(Zona);
  const especialidades = ds.getRepository(Especialidad);
  const servicios = ds.getRepository(TiposDeServicio);

  let santaFe = await buscarPorNombre(provincias, 'nombreProvincia', 'Santa Fe');
  if (!santaFe) santaFe = await provincias.save(provincias.create({ nombreProvincia: 'Santa Fe' }));

  const enSantaFe = await localidades.find({ where: { provincia: { idProvincia: santaFe.idProvincia } } });
  let rosario = enSantaFe.find((l) => normalizar(l.nombreLocalidad) === 'rosario') ?? null;
  if (!rosario) rosario = await localidades.save(localidades.create({ nombreLocalidad: 'Rosario', codigoPostal: '2000', provincia: santaFe }));

  const zonasRosario = await zonas.find({ where: { localidad: { idLocalidad: rosario.idLocalidad } } });
  const mapaZonas = new Map<string, Zona>();
  for (const nombre of ZONAS_ROSARIO) {
    let zona = zonasRosario.find((z) => normalizar(z.nombreZona) === normalizar(nombre));
    if (!zona) {
      zona = await zonas.save(zonas.create({ nombreZona: nombre, localidad: rosario }));
      console.log(`  + zona ${nombre}`);
    }
    mapaZonas.set(nombre, zona);
  }

  // Las zonas viejas que no son distritos: los clientes y profesionales pasan al distrito y la zona se da de baja
  for (const [vieja, distrito] of Object.entries(ZONAS_VIEJAS)) {
    const zonaVieja = zonasRosario.find((z) => normalizar(z.nombreZona) === normalizar(vieja));
    if (!zonaVieja) continue;
    const nueva = mapaZonas.get(distrito)!;

    const clientesRepo = ds.getRepository(Cliente);
    const queViven = await clientesRepo.find({ where: { zonaResidencia: { idZona: zonaVieja.idZona } }, withDeleted: true });
    for (const cliente of queViven) {
      cliente.zonaResidencia = nueva;
      await clientesRepo.save(cliente);
    }

    const profesionalesRepo = ds.getRepository(Profesional);
    const queLaCubren = await profesionalesRepo.find({
      where: { zonasDeCobertura: { idZona: zonaVieja.idZona } },
      relations: { zonasDeCobertura: true },
      withDeleted: true,
    });
    for (const profesional of queLaCubren) {
      // Se recarga con todas sus zonas (el where de arriba trae solo la que coincide)
      const completo = await profesionalesRepo.findOne({ where: { idUsuario: profesional.idUsuario }, relations: { zonasDeCobertura: true }, withDeleted: true });
      if (!completo) continue;
      const sinLaVieja = completo.zonasDeCobertura.filter((z) => z.idZona !== zonaVieja.idZona);
      if (!sinLaVieja.some((z) => z.idZona === nueva.idZona)) sinLaVieja.push(nueva);
      completo.zonasDeCobertura = sinLaVieja;
      await profesionalesRepo.save(completo);
    }

    await zonas.softDelete({ idZona: zonaVieja.idZona });
    console.log(`  ~ zona ${vieja} pasada a ${distrito} (y dada de baja)`);
  }

  const mapaOficios = new Map<string, Especialidad>();
  const mapaHabilidades = new Map<string, TiposDeServicio[]>();
  for (const oficio of OFICIOS) {
    let especialidad = await buscarPorNombre(especialidades, 'nombreEspecialidad', oficio.nombre);
    if (!especialidad) {
      especialidad = await especialidades.save(especialidades.create({ nombreEspecialidad: oficio.nombre, descripcionEspecialidad: oficio.descripcion }));
      console.log(`  + oficio ${oficio.nombre}`);
    }
    // Se suman las palabras clave que falten, sin borrar las que ya tenía (ej: las que agregó el admin)
    const palabras = juntarPalabras(especialidad.palabrasClave, PALABRAS_CLAVE[oficio.nombre] ?? '');
    if (palabras !== (especialidad.palabrasClave ?? '')) {
      especialidad.palabrasClave = palabras;
      especialidad = await especialidades.save(especialidad);
    }
    mapaOficios.set(oficio.nombre, especialidad);

    const existentes = await servicios.find({ where: { especialidad: { idEspecialidad: especialidad.idEspecialidad } } });
    const habilidades: TiposDeServicio[] = [];
    for (const nombre of oficio.habilidades) {
      let servicio = existentes.find((s) => normalizar(s.nombreServicio) === normalizar(nombre));
      if (!servicio) servicio = await servicios.save(servicios.create({ nombreServicio: nombre, descripcionServicio: nombre, especialidad }));
      habilidades.push(servicio);
    }
    mapaHabilidades.set(oficio.nombre, habilidades);
  }

  return { mapaZonas, mapaOficios, mapaHabilidades };
}

async function seedUsuarios(ds: DataSource, turnos: TurnoService, catalogo: Awaited<ReturnType<typeof seedCatalogo>>) {
  const clientesRepo = ds.getRepository(Cliente);
  const profesionalesRepo = ds.getRepository(Profesional);
  const hash = await bcrypt.hash(CONTRASEÑA, 10);

  const clientes = new Map<string, Cliente>();
  for (const c of CLIENTES) {
    let cliente = await clientesRepo.findOne({ where: { correo: c.correo }, relations: { zonaResidencia: true }, withDeleted: true });
    if (!cliente) {
      const { zona, contraseña, ...datos } = c;
      cliente = await clientesRepo.save(
        clientesRepo.create({
          ...datos,
          fechaNacimiento: new Date('1990-05-10'),
          contraseña: contraseña ? await bcrypt.hash(contraseña, 10) : hash,
          zonaResidencia: catalogo.mapaZonas.get(zona),
        }),
      );
      console.log(`  + cliente ${c.correo}`);
    } else if (cliente.zonaResidencia?.idZona !== catalogo.mapaZonas.get(c.zona)!.idZona) {
      // Las cuentas de prueba siguen la lista de arriba (ej: si cambiaron las zonas de Rosario)
      cliente.zonaResidencia = catalogo.mapaZonas.get(c.zona)!;
      cliente = await clientesRepo.save(cliente);
    }
    clientes.set(c.correo, cliente);
  }

  const profesionales = new Map<string, Profesional>();
  for (const p of PROFESIONALES) {
    let profesional = await profesionalesRepo.findOne({ where: { correo: p.correo }, withDeleted: true });
    if (!profesional) {
      profesional = await profesionalesRepo.save(
        profesionalesRepo.create({
          correo: p.correo,
          nombre: p.nombre,
          apellido: p.apellido,
          dni: p.dni,
          telefono: p.telefono,
          fechaNacimiento: new Date('1982-03-15'),
          contraseña: hash,
          costoVisita: p.costoVisita as number,
          descripcion: p.descripcion,
          cbu: p.cbu,
          especialidades: p.oficios.map((o) => catalogo.mapaOficios.get(o)!),
          tiposDeServicio: p.oficios.flatMap((o) => catalogo.mapaHabilidades.get(o) ?? []),
          zonasDeCobertura: p.zonas.map((z) => catalogo.mapaZonas.get(z)!),
          matriculas: p.matricula
            ? [{ numero: p.matricula.numero, descripcion: p.matricula.descripcion, especialidad: catalogo.mapaOficios.get(p.matricula.oficio)! }]
            : [],
        } as Partial<Profesional>),
      );
      // Sin horario no tiene turnos libres y nadie le puede pedir una visita
      await turnos.guardarHorario(profesional.idUsuario, {
        horarios: p.horario.map(([diaSemana, horaDesde, horaHasta]) => ({ diaSemana, horaDesde, horaHasta })),
      });
      console.log(`  + profesional ${p.correo}`);
    } else {
      // Las cuentas de prueba siguen la lista de arriba: se les ponen exactamente esas zonas
      const conZonas = await profesionalesRepo.findOne({ where: { idUsuario: profesional.idUsuario }, relations: { zonasDeCobertura: true }, withDeleted: true });
      const queTiene = (conZonas?.zonasDeCobertura ?? []).map((z) => z.idZona).sort().join(',');
      const zonasDeLaLista = p.zonas.map((z) => catalogo.mapaZonas.get(z)!);
      if (conZonas && queTiene !== zonasDeLaLista.map((z) => z.idZona).sort().join(',')) {
        conZonas.zonasDeCobertura = zonasDeLaLista;
        profesional = await profesionalesRepo.save(conZonas);
      }
    }
    profesionales.set(p.correo, profesional);
  }
  return { clientes, profesionales };
}

// Un turno libre del profesional desde dentro de `desdeDias` días (el primero que encuentre)
async function turnoLibre(turnos: TurnoService, idProfesional: number, desdeDias: number, saltear = 0): Promise<Date> {
  const desde = dia(desdeDias, 0);
  const hasta = dia(desdeDias + 14, 0);
  const libres = await turnos.libres(idProfesional, { desde: local(desde).slice(0, 10), hasta: local(hasta).slice(0, 10) });
  const turno = libres[saltear] ?? libres[0];
  if (!turno) throw new Error(`El profesional ${idProfesional} no tiene turnos libres`);
  return turno.inicio;
}

async function seedSolicitudes(
  ds: DataSource,
  servicio: SolicitudDeServicioService,
  turnos: TurnoService,
  usuarios: Awaited<ReturnType<typeof seedUsuarios>>,
  catalogo: Awaited<ReturnType<typeof seedCatalogo>>,
) {
  const repo = ds.getRepository(SolicitudDeServicio);
  const maxi = usuarios.clientes.get(MAXI)!;
  const yaTiene = await repo.count({ where: { cliente: { idUsuario: maxi.idUsuario } } });
  if (yaTiene > 0) {
    console.log('  (las solicitudes de ejemplo ya estaban creadas)');
    return;
  }

  // Se busca por el principio del correo (ej: 'raulbustos' → raulbustos.plomeria@gmail.com)
  const buscar = <T>(mapa: Map<string, T>, inicio: string) => [...mapa.entries()].find(([correo]) => correo.startsWith(inicio))![1];
  const cli = (inicio: string) => buscar(usuarios.clientes, inicio);
  const pro = (inicio: string) => buscar(usuarios.profesionales, inicio);
  const oficio = (nombre: string) => catalogo.mapaOficios.get(nombre)!;
  const comoProfesional = (p: Profesional) => ({ sub: p.idUsuario, correo: p.correo, rol: Rol.PROFESIONAL });

  // --- Con fechas pasadas: se guardan directo (los servicios no dejan crear cosas en el pasado) ---
  const pasada = (datos: Partial<SolicitudDeServicio>) =>
    repo.save(repo.create({ urgente: false, fechaCambioEstado: hace(2), ...datos } as SolicitudDeServicio));

  // Finalizadas y calificadas (dan las estrellas y reseñas de los profesionales)
  const finalizadas: [string, string, string, string, number, number, string | null][] = [
    ['valeriagodoy', 'raulbustos', 'Plomería', 'Destapación de la cloaca del patio.', 22000, 5, 'Rapidísimo y muy prolijo. Lo recomiendo.'],
    ['fede.ibarra', 'raulbustos', 'Plomería', 'Cambio del flotante del tanque.', 18000, 4, 'Buen trabajo, llegó puntual.'],
    ['gusmolina', 'sergioledesma', 'Electricidad', 'Instalar un ventilador de techo.', 30000, 5, 'Excelente, explicó todo.'],
    ['nati.herrera', 'sergioledesma', 'Electricidad', 'Cambiar el disyuntor del tablero.', 45000, 3, 'Cumplió, pero tardó más de lo que dijo.'],
    ['valeriagodoy', 'silviaortiz', 'Pintura', 'Pintar dos dormitorios.', 160000, 5, 'Impecable, dejó todo limpio.'],
    ['fede.ibarra', 'damianaguirre', 'Carpintería', 'Arreglar la puerta del placard.', 25000, 4, null],
    ['nati.herrera', 'marceloquiroga', 'Gas', 'Revisión de la instalación de gas.', 35000, 5, 'Muy profesional, matriculado.'],
    ['gusmolina', 'cerrajeriavillalba', 'Cerrajería', 'Apertura de puerta, me quedé afuera.', 15000, 5, 'Vino en 20 minutos un domingo.'],
    ['camirossi', 'graciela.romero', 'Limpieza', 'Limpieza final de obra del departamento.', 40000, 4, 'Muy detallista.'],
    ['nati.herrera', 'ezequieltoledo', 'Jardinería', 'Corte de césped y poda del frente.', 20000, 5, null],
    ['valeriagodoy', 'leandrocabrera', 'Climatización', 'Service del aire acondicionado.', 28000, 4, 'Bien, recomendable.'],
  ];
  for (const [i, [c, p, o, desc, costo, estrellas, reseña]] of finalizadas.entries()) {
    const visita = dia(-(20 + i), 10);
    const fin = masHoras(dia(-(18 + i), 9), 2);
    await pasada({
      estadoServicio: EstadoSolicitud.FINALIZADO,
      descripcionProblema: desc,
      cliente: cli(c),
      profesional: pro(p),
      especialidad: oficio(o),
      fechaVisita: visita,
      fechaInicio: dia(-(18 + i), 9),
      fechaFinEstimada: fin,
      fechaFinReal: fin,
      fechaPago: fin,
      fechaCambioEstado: fin,
      costoVisita: pro(p).costoVisita,
      costoEstimado: costo,
      costoFinal: costo,
      horasTrabajo: 2,
      calificacionServicio: estrellas,
      reseñaServicio: reseña as string,
    });
  }

  // Maxi: terminada y pagada, falta calificar
  await pasada({
    estadoServicio: EstadoSolicitud.FINALIZADO,
    descripcionProblema: 'Cambio de cerradura de la puerta de entrada.',
    cliente: maxi,
    profesional: pro('cerrajeriavillalba'),
    especialidad: oficio('Cerrajería'),
    fechaVisita: dia(-4, 11),
    fechaInicio: dia(-4, 11),
    fechaFinReal: dia(-4, 12),
    fechaPago: dia(-4, 12),
    costoVisita: 3500,
    costoEstimado: 26000,
    costoFinal: 26000,
    horasTrabajo: 1,
  });

  // Maxi: presupuesto recibido, para aceptar o rechazar
  await pasada({
    estadoServicio: EstadoSolicitud.PRESUPUESTADO,
    descripcionProblema: 'Instalar un calefón nuevo en la cocina.',
    cliente: maxi,
    profesional: pro('marceloquiroga'),
    especialidad: oficio('Gas'),
    fechaVisita: dia(-1, 10),
    fechaFinEstimada: dia(-1, 11),
    costoVisita: 6000,
    costoEstimado: 85000,
    costoFinal: 85000,
    horasTrabajo: 3,
    fechaCambioEstado: hace(5),
  });

  // Maxi: trabajo contratado que ya empezó, para PAGAR con Mercado Pago
  await pasada({
    estadoServicio: EstadoSolicitud.CONTRATADO,
    descripcionProblema: 'Cambiar los tomas de la cocina.',
    cliente: maxi,
    profesional: pro('sergioledesma'),
    especialidad: oficio('Electricidad'),
    fechaVisita: dia(-4, 9),
    fechaInicio: dia(-2, 9),
    fechaFinEstimada: dia(-2, 11),
    fechaAceptacion: dia(-3, 18),
    costoVisita: 4500,
    costoEstimado: 45000,
    costoFinal: 45000,
    horasTrabajo: 2,
    fechaCambioEstado: dia(-3, 18),
  });

  // Maxi: rechazó el presupuesto, queda por pagar la visita
  await pasada({
    estadoServicio: EstadoSolicitud.RECHAZADO,
    descripcionProblema: 'Hacer un mueble para el living.',
    cliente: maxi,
    profesional: pro('damianaguirre'),
    especialidad: oficio('Carpintería'),
    fechaVisita: dia(-6, 15),
    costoVisita: 5000,
    costoFinal: 5000,
    fechaCambioEstado: hace(48),
  });

  // Valeria → Raúl: ya fue la visita, el profesional tiene que mandar el presupuesto
  await pasada({
    estadoServicio: EstadoSolicitud.AGENDADO,
    descripcionProblema: 'Pierde agua el inodoro.',
    cliente: cli('valeriagodoy'),
    profesional: pro('raulbustos'),
    especialidad: oficio('Plomería'),
    fechaVisita: dia(-1, 11),
    fechaFinEstimada: dia(-1, 12),
    costoVisita: 5000,
    fechaCambioEstado: hace(30),
  });

  // Valeria (la cuenta de cliente para el profe): un presupuesto para responder y un trabajo para pagar
  await pasada({
    estadoServicio: EstadoSolicitud.PRESUPUESTADO,
    descripcionProblema: 'Hacer un placard a medida en el dormitorio.',
    cliente: cli('valeriagodoy'),
    profesional: pro('damianaguirre'),
    especialidad: oficio('Carpintería'),
    fechaVisita: dia(-2, 10),
    fechaFinEstimada: dia(-2, 11),
    costoVisita: 5000,
    costoEstimado: 180000,
    costoFinal: 180000,
    horasTrabajo: 16,
    fechaCambioEstado: hace(20),
  });
  await pasada({
    estadoServicio: EstadoSolicitud.CONTRATADO,
    descripcionProblema: 'Agregar dos tomas en el living.',
    cliente: cli('valeriagodoy'),
    profesional: pro('sergioledesma'),
    especialidad: oficio('Electricidad'),
    fechaVisita: dia(-5, 14),
    fechaInicio: dia(-1, 14),
    fechaFinEstimada: dia(-1, 16),
    fechaAceptacion: dia(-4, 19),
    costoVisita: 4500,
    costoEstimado: 32000,
    costoFinal: 32000,
    horasTrabajo: 2,
    fechaCambioEstado: dia(-4, 19),
  });

  // --- Con fechas futuras: se crean con los servicios (validan y reservan los turnos) ---

  // Maxi → Raúl: nueva, esperando que la acepte
  await servicio.create(
    { idProfesional: pro('raulbustos').idUsuario, idEspecialidad: oficio('Plomería').idEspecialidad, descripcionProblema: 'Reparación de cañería del baño, hay humedad en la pared.', inicioTurno: local(await turnoLibre(turnos, pro('raulbustos').idUsuario, 2)) },
    maxi.idUsuario,
  );

  // Maxi → Silvia: visita confirmada (aceptada)
  const confirmada = await servicio.create(
    { idProfesional: pro('silviaortiz').idUsuario, idEspecialidad: oficio('Pintura').idEspecialidad, descripcionProblema: 'Pintar el living y el pasillo.', inicioTurno: local(await turnoLibre(turnos, pro('silviaortiz').idUsuario, 2)) },
    maxi.idUsuario,
  );
  await servicio.aceptar(confirmada!.idSolicitud, {}, comoProfesional(pro('silviaortiz')));

  // Maxi → Leandro: aceptada y el profesional propuso otro horario (Maxi tiene que contestar)
  const leandro = pro('leandrocabrera');
  const aMover = await servicio.create(
    { idProfesional: leandro.idUsuario, idEspecialidad: oficio('Climatización').idEspecialidad, descripcionProblema: 'Instalar un aire split en el dormitorio.', inicioTurno: local(await turnoLibre(turnos, leandro.idUsuario, 3)) },
    maxi.idUsuario,
  );
  await servicio.aceptar(aMover!.idSolicitud, {}, comoProfesional(leandro));
  await servicio.reprogramar(aMover!.idSolicitud, { inicio: local(await turnoLibre(turnos, leandro.idUsuario, 5, 2)) }, comoProfesional(leandro));

  // Federico → Raúl y Gustavo → Sergio: nuevas, para que los profesionales las respondan
  await servicio.create(
    { idProfesional: pro('raulbustos').idUsuario, idEspecialidad: oficio('Gas').idEspecialidad, descripcionProblema: 'Olor a gas cerca de la cocina.', inicioTurno: local(await turnoLibre(turnos, pro('raulbustos').idUsuario, 1)) },
    cli('fede.ibarra').idUsuario,
  );
  await servicio.create(
    { idProfesional: pro('sergioledesma').idUsuario, idEspecialidad: oficio('Electricidad').idEspecialidad, descripcionProblema: 'Se corta la luz cuando prendo el horno.', inicioTurno: local(await turnoLibre(turnos, pro('sergioledesma').idUsuario, 2)) },
    cli('gusmolina').idUsuario,
  );

  console.log('  + solicitudes de ejemplo en todos los estados');
}

// Métodos de pago y promociones bancarias vigentes en el mes actual (las ve el cliente en Inicio)
// Las tarjetas de los 3 bancos con promo van con el banco en el nombre; las demas son de cualquier banco (sin promo)
const BANCOS = ['Banco Nación', 'Banco Macro', 'Banco Galicia'];
const TARJETAS_DE_BANCO = ['Visa crédito', 'Visa débito', 'Mastercard crédito', 'Mastercard débito'];
const METODOS = [
  'Visa crédito', 'Visa débito', 'Mastercard crédito', 'Mastercard débito', 'American Express crédito',
  'Naranja X crédito', 'Naranja X débito', 'Cabal crédito', 'Cabal débito', 'Mercado Pago prepaga', 'Mercado Pago crédito',
  ...BANCOS.flatMap((banco) => TARJETAS_DE_BANCO.map((tarjeta) => `${tarjeta} - ${banco}`)),
];
const tarjetasDe = (banco: string) => TARJETAS_DE_BANCO.map((tarjeta) => `${tarjeta} - ${banco}`);
async function seedPromociones(ds: DataSource) {
  const metodos = ds.getRepository(MetodoDePago);
  const promociones = ds.getRepository(Promocion);

  const porTipo = new Map<string, MetodoDePago>();
  for (const tipo of METODOS) {
    let metodo = await metodos.findOne({ where: { tipo }, relations: { promociones: true } });
    if (!metodo) {
      metodo = await metodos.save(metodos.create({ tipo, estado: 'activo', promociones: [] }));
      console.log(`  + método de pago ${tipo}`);
    }
    porTipo.set(tipo, metodo);
  }

  // Del primero al último día del mes en curso, así siempre hay promos "del mes"
  const hoy = new Date();
  const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  const fin = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
  // El tope no se guarda: el reintegro lo hace el banco, la app solo lo informa (va en el texto)
  const promos: { codigo: string; porcentaje: number; descripcion: string; metodos: string[] }[] = [
    // Corta: el banco y el porcentaje ya se muestran aparte, y las fechas salen de la vigencia
    { codigo: 'NACION20', porcentaje: 20, descripcion: 'Sin tope · Crédito y débito Visa y Mastercard', metodos: tarjetasDe('Banco Nación') },
    { codigo: 'MACRO15', porcentaje: 15, descripcion: 'Tope $30.000 mensual · Crédito y débito Visa y Mastercard', metodos: tarjetasDe('Banco Macro') },
    { codigo: 'GALICIA30', porcentaje: 30, descripcion: 'Tope $20.000 mensual · Crédito y débito Visa y Mastercard', metodos: tarjetasDe('Banco Galicia') },
  ];
  for (const p of promos) {
    const existente = await promociones.findOne({ where: { codigo: p.codigo } });
    if (existente) {
      // Se renueva la vigencia al mes actual y el texto
      existente.fechaInicioVigencia = inicio;
      existente.fechaFinVigencia = fin;
      existente.descripcion = p.descripcion;
      await promociones.save(existente);
      continue;
    }
    const nueva = await promociones.save(
      promociones.create({ codigo: p.codigo, porcentajeDescuento: p.porcentaje, descripcion: p.descripcion, fechaInicioVigencia: inicio, fechaFinVigencia: fin }),
    );
    // La relación la guarda el método de pago (es el dueño de la tabla intermedia)
    for (const tipo of p.metodos) {
      const metodo = porTipo.get(tipo)!;
      metodo.promociones = [...(metodo.promociones ?? []), nueva];
      await metodos.save(metodo);
    }
    console.log(`  + promoción ${p.codigo}`);
  }
}

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn'] });
  try {
    const ds = app.get(DataSource);
    console.log('Catálogo (oficios, habilidades y zonas de Rosario)...');
    const catalogo = await seedCatalogo(ds);
    console.log('Clientes y profesionales...');
    const usuarios = await seedUsuarios(ds, app.get(TurnoService), catalogo);
    console.log('Solicitudes de ejemplo...');
    await seedSolicitudes(ds, app.get(SolicitudDeServicioService), app.get(TurnoService), usuarios, catalogo);
    console.log('Métodos de pago y promociones del mes...');
    await seedPromociones(ds);

    console.log(`\nListo. Contraseña de las cuentas (menos la de Maxi): ${CONTRASEÑA}`);
    console.log('Clientes:      ' + CLIENTES.map((c) => c.correo).join(', '));
    console.log('Profesionales: ' + PROFESIONALES.map((p) => p.correo).join(', '));
  } finally {
    await app.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});