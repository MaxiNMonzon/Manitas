// Seed de DATOS DE PRUEBA: oficios, zonas, clientes, profesionales y solicitudes en todos los
// estados, para poder probar el sistema de punta a punta (pedir, aceptar, presupuestar, pagar...).
//
// Uso:  npm run seed:demo   (ver manitas-backend/SEED.md)
//
// - Se puede correr varias veces: busca por nombre / correo y no duplica.
// - No modifica nada que ya exista (usuarios, oficios ni zonas): solo agrega lo que falta.
// - Las solicitudes de ejemplo se crean una sola vez (si la clienta de prueba no tiene ninguna).
// - Todas las cuentas de prueba usan la contraseña CONTRASEÑA (abajo) y correos @manitas.test.
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

const ZONAS_ROSARIO = ['Centro', 'Echesortu', 'Norte', 'Sur', 'Oeste', 'Fisherton'];

// ---------- Usuarios ----------

interface ClienteSeed {
  correo: string;
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

const CLIENTES: ClienteSeed[] = [
  { correo: 'laura.cliente@manitas.test', nombre: 'Laura', apellido: 'Méndez', dni: 30111222, telefono: '3415551001', calle: 'Zeballos', altura: 1451, piso: '3', depto: 'B', zona: 'Centro' },
  { correo: 'martin.cliente@manitas.test', nombre: 'Martín', apellido: 'Suárez', dni: 31222333, telefono: '3415551002', calle: 'Mendoza', altura: 3200, zona: 'Echesortu' },
  { correo: 'sofia.cliente@manitas.test', nombre: 'Sofía', apellido: 'Paz', dni: 32333444, telefono: '3415551003', calle: 'Alberdi', altura: 850, zona: 'Norte' },
  { correo: 'diego.cliente@manitas.test', nombre: 'Diego', apellido: 'Ramos', dni: 33444555, telefono: '3415551004', calle: 'Uriburu', altura: 1200, zona: 'Sur' },
  { correo: 'carla.cliente@manitas.test', nombre: 'Carla', apellido: 'Funes', dni: 34555666, telefono: '3415551005', calle: 'Eva Perón', altura: 7800, zona: 'Fisherton' },
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
  { correo: 'jorge.plomero@manitas.test', nombre: 'Jorge', apellido: 'Díaz', dni: 25111222, telefono: '3416662001', oficios: ['Plomería', 'Gas'], zonas: ['Centro', 'Echesortu', 'Norte'], costoVisita: 5000, descripcion: 'Plomero y gasista con 20 años de experiencia. Pérdidas, destapaciones, termotanques y calefones.', cbu: '0110599520000001234561', matricula: { oficio: 'Gas', numero: 'MG-4521', descripcion: 'Gasista de 2da categoría - Litoral Gas' }, horario: [...LUNES_A_VIERNES(8, 17), [6, 9, 13]] },
  { correo: 'oscar.electricista@manitas.test', nombre: 'Oscar', apellido: 'Gómez', dni: 26222333, telefono: '3416662002', oficios: ['Electricidad'], zonas: ['Centro', 'Sur', 'Oeste'], costoVisita: 4500, descripcion: 'Electricista matriculado. Instalaciones nuevas, tableros, disyuntores y reparaciones.', cbu: '0170099220000067890123', matricula: { oficio: 'Electricidad', numero: 'ME-1187', descripcion: 'Colegio de Técnicos de Santa Fe' }, horario: LUNES_A_VIERNES(9, 18) },
  { correo: 'marta.pintora@manitas.test', nombre: 'Marta', apellido: 'Ríos', dni: 27333444, telefono: '3416662003', oficios: ['Pintura', 'Albañilería'], zonas: ['Centro', 'Norte', 'Fisherton'], costoVisita: null, descripcion: 'Pintura de interiores y exteriores, reparación de paredes y humedad. Presupuesto sin cargo.', cbu: '0720000788000012345678', horario: [...LUNES_A_VIERNES(8, 13), ...LUNES_A_VIERNES(15, 19)] },
  { correo: 'lucia.carpintera@manitas.test', nombre: 'Lucía', apellido: 'Fernández', dni: 28444555, telefono: '3416662004', oficios: ['Carpintería'], zonas: ['Centro', 'Echesortu', 'Oeste'], costoVisita: 5000, descripcion: 'Muebles a medida, placares y arreglos de aberturas de madera.', cbu: '0140999801200012345671', horario: LUNES_A_VIERNES(9, 17) },
  { correo: 'julian.gasista@manitas.test', nombre: 'Julián', apellido: 'Pereyra', dni: 29555666, telefono: '3416662005', oficios: ['Gas', 'Climatización'], zonas: ['Norte', 'Sur', 'Fisherton'], costoVisita: 6000, descripcion: 'Gasista matriculado e instalador de aires acondicionados.', cbu: '0150501102000123456789', matricula: { oficio: 'Gas', numero: 'MG-7730', descripcion: 'Gasista de 1ra categoría - ENARGAS' }, horario: [...LUNES_A_VIERNES(8, 16), [6, 8, 12]] },
  { correo: 'ramon.cerrajero@manitas.test', nombre: 'Ramón', apellido: 'Acosta', dni: 24666777, telefono: '3416662006', oficios: ['Cerrajería'], zonas: ['Centro', 'Echesortu', 'Norte', 'Sur', 'Oeste', 'Fisherton'], costoVisita: 3500, descripcion: 'Cerrajería las 24 horas. Aperturas, cambio de cerraduras y combinaciones.', cbu: '0340040108400012345675', horario: [0, 1, 2, 3, 4, 5, 6].map((d) => [d, 8, 22] as [number, number, number]) },
  { correo: 'ana.limpieza@manitas.test', nombre: 'Ana', apellido: 'Benítez', dni: 30777888, telefono: '3416662007', oficios: ['Limpieza'], zonas: ['Centro', 'Norte', 'Fisherton'], costoVisita: null, descripcion: 'Limpieza de casas, departamentos y final de obra.', cbu: '0070999030004012345671', horario: [...LUNES_A_VIERNES(8, 14), [6, 8, 12]] },
  { correo: 'pablo.jardinero@manitas.test', nombre: 'Pablo', apellido: 'Sosa', dni: 31888999, telefono: '3416662008', oficios: ['Jardinería'], zonas: ['Fisherton', 'Oeste', 'Norte'], costoVisita: 3000, descripcion: 'Corte de césped, poda y mantenimiento de jardines.', cbu: '2850590940090412345671', horario: [[2, 8, 16], [4, 8, 16], [6, 8, 14]] },
  { correo: 'nicolas.clima@manitas.test', nombre: 'Nicolás', apellido: 'Vera', dni: 32999000, telefono: '3416662009', oficios: ['Climatización', 'Electricidad'], zonas: ['Centro', 'Sur', 'Echesortu'], costoVisita: 5500, descripcion: 'Instalación y service de aires acondicionados split. También electricidad domiciliaria.', cbu: '0720168520000001234567', horario: LUNES_A_VIERNES(10, 19) },
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

  const mapaOficios = new Map<string, Especialidad>();
  const mapaHabilidades = new Map<string, TiposDeServicio[]>();
  for (const oficio of OFICIOS) {
    let especialidad = await buscarPorNombre(especialidades, 'nombreEspecialidad', oficio.nombre);
    if (!especialidad) {
      especialidad = await especialidades.save(especialidades.create({ nombreEspecialidad: oficio.nombre, descripcionEspecialidad: oficio.descripcion }));
      console.log(`  + oficio ${oficio.nombre}`);
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
    let cliente = await clientesRepo.findOne({ where: { correo: c.correo }, withDeleted: true });
    if (!cliente) {
      const { zona, ...datos } = c;
      cliente = await clientesRepo.save(
        clientesRepo.create({ ...datos, fechaNacimiento: new Date('1990-05-10'), contraseña: hash, zonaResidencia: catalogo.mapaZonas.get(zona) }),
      );
      console.log(`  + cliente ${c.correo}`);
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
  const laura = usuarios.clientes.get('laura.cliente@manitas.test')!;
  const yaTiene = await repo.count({ where: { cliente: { idUsuario: laura.idUsuario } } });
  if (yaTiene > 0) {
    console.log('  (las solicitudes de ejemplo ya estaban creadas)');
    return;
  }

  const cli = (correo: string) => usuarios.clientes.get(`${correo}@manitas.test`)!;
  const pro = (correo: string) => usuarios.profesionales.get(`${correo}@manitas.test`)!;
  const oficio = (nombre: string) => catalogo.mapaOficios.get(nombre)!;
  const comoProfesional = (p: Profesional) => ({ sub: p.idUsuario, correo: p.correo, rol: Rol.PROFESIONAL });

  // --- Con fechas pasadas: se guardan directo (los servicios no dejan crear cosas en el pasado) ---
  const pasada = (datos: Partial<SolicitudDeServicio>) =>
    repo.save(repo.create({ urgente: false, fechaCambioEstado: hace(2), ...datos } as SolicitudDeServicio));

  // Finalizadas y calificadas (dan las estrellas y reseñas de los profesionales)
  const finalizadas: [string, string, string, string, number, number, string | null][] = [
    ['martin.cliente', 'jorge.plomero', 'Plomería', 'Destapación de la cloaca del patio.', 22000, 5, 'Rapidísimo y muy prolijo. Lo recomiendo.'],
    ['sofia.cliente', 'jorge.plomero', 'Plomería', 'Cambio del flotante del tanque.', 18000, 4, 'Buen trabajo, llegó puntual.'],
    ['diego.cliente', 'oscar.electricista', 'Electricidad', 'Instalar un ventilador de techo.', 30000, 5, 'Excelente, explicó todo.'],
    ['carla.cliente', 'oscar.electricista', 'Electricidad', 'Cambiar el disyuntor del tablero.', 45000, 3, 'Cumplió, pero tardó más de lo que dijo.'],
    ['martin.cliente', 'marta.pintora', 'Pintura', 'Pintar dos dormitorios.', 160000, 5, 'Impecable, dejó todo limpio.'],
    ['sofia.cliente', 'lucia.carpintera', 'Carpintería', 'Arreglar la puerta del placard.', 25000, 4, null],
    ['carla.cliente', 'julian.gasista', 'Gas', 'Revisión de la instalación de gas.', 35000, 5, 'Muy profesional, matriculado.'],
    ['diego.cliente', 'ramon.cerrajero', 'Cerrajería', 'Apertura de puerta, me quedé afuera.', 15000, 5, 'Vino en 20 minutos un domingo.'],
    ['laura.cliente', 'ana.limpieza', 'Limpieza', 'Limpieza final de obra del departamento.', 40000, 4, 'Muy detallista.'],
    ['carla.cliente', 'pablo.jardinero', 'Jardinería', 'Corte de césped y poda del frente.', 20000, 5, null],
    ['martin.cliente', 'nicolas.clima', 'Climatización', 'Service del aire acondicionado.', 28000, 4, 'Bien, recomendable.'],
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

  // Laura: terminada y pagada, falta calificar
  await pasada({
    estadoServicio: EstadoSolicitud.FINALIZADO,
    descripcionProblema: 'Cambio de cerradura de la puerta de entrada.',
    cliente: laura,
    profesional: pro('ramon.cerrajero'),
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

  // Laura: presupuesto recibido, para aceptar o rechazar
  await pasada({
    estadoServicio: EstadoSolicitud.PRESUPUESTADO,
    descripcionProblema: 'Instalar un calefón nuevo en la cocina.',
    cliente: laura,
    profesional: pro('julian.gasista'),
    especialidad: oficio('Gas'),
    fechaVisita: dia(-1, 10),
    fechaFinEstimada: dia(-1, 11),
    costoVisita: 6000,
    costoEstimado: 85000,
    costoFinal: 85000,
    horasTrabajo: 3,
    fechaCambioEstado: hace(5),
  });

  // Laura: trabajo contratado que ya empezó, para PAGAR con Mercado Pago
  await pasada({
    estadoServicio: EstadoSolicitud.CONTRATADO,
    descripcionProblema: 'Cambiar los tomas de la cocina.',
    cliente: laura,
    profesional: pro('oscar.electricista'),
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

  // Laura: rechazó el presupuesto, queda por pagar la visita
  await pasada({
    estadoServicio: EstadoSolicitud.RECHAZADO,
    descripcionProblema: 'Hacer un mueble para el living.',
    cliente: laura,
    profesional: pro('lucia.carpintera'),
    especialidad: oficio('Carpintería'),
    fechaVisita: dia(-6, 15),
    costoVisita: 5000,
    costoFinal: 5000,
    fechaCambioEstado: hace(48),
  });

  // Martín → Jorge: ya fue la visita, el profesional tiene que mandar el presupuesto
  await pasada({
    estadoServicio: EstadoSolicitud.AGENDADO,
    descripcionProblema: 'Pierde agua el inodoro.',
    cliente: cli('martin.cliente'),
    profesional: pro('jorge.plomero'),
    especialidad: oficio('Plomería'),
    fechaVisita: dia(-1, 11),
    fechaFinEstimada: dia(-1, 12),
    costoVisita: 5000,
    fechaCambioEstado: hace(30),
  });

  // --- Con fechas futuras: se crean con los servicios (validan y reservan los turnos) ---

  // Laura → Jorge: nueva, esperando que la acepte
  await servicio.create(
    { idProfesional: pro('jorge.plomero').idUsuario, idEspecialidad: oficio('Plomería').idEspecialidad, descripcionProblema: 'Reparación de cañería del baño, hay humedad en la pared.', inicioTurno: local(await turnoLibre(turnos, pro('jorge.plomero').idUsuario, 2)) },
    laura.idUsuario,
  );

  // Laura → Marta: visita confirmada (aceptada)
  const confirmada = await servicio.create(
    { idProfesional: pro('marta.pintora').idUsuario, idEspecialidad: oficio('Pintura').idEspecialidad, descripcionProblema: 'Pintar el living y el pasillo.', inicioTurno: local(await turnoLibre(turnos, pro('marta.pintora').idUsuario, 2)) },
    laura.idUsuario,
  );
  await servicio.aceptar(confirmada!.idSolicitud, {}, comoProfesional(pro('marta.pintora')));

  // Laura → Nicolás: aceptada y el profesional propuso otro horario (Laura tiene que contestar)
  const nicolas = pro('nicolas.clima');
  const aMover = await servicio.create(
    { idProfesional: nicolas.idUsuario, idEspecialidad: oficio('Climatización').idEspecialidad, descripcionProblema: 'Instalar un aire split en el dormitorio.', inicioTurno: local(await turnoLibre(turnos, nicolas.idUsuario, 3)) },
    laura.idUsuario,
  );
  await servicio.aceptar(aMover!.idSolicitud, {}, comoProfesional(nicolas));
  await servicio.reprogramar(aMover!.idSolicitud, { inicio: local(await turnoLibre(turnos, nicolas.idUsuario, 5, 2)) }, comoProfesional(nicolas));

  // Sofía → Jorge y Diego → Oscar: nuevas, para que los profesionales las respondan
  await servicio.create(
    { idProfesional: pro('jorge.plomero').idUsuario, idEspecialidad: oficio('Gas').idEspecialidad, descripcionProblema: 'Olor a gas cerca de la cocina.', inicioTurno: local(await turnoLibre(turnos, pro('jorge.plomero').idUsuario, 1)) },
    cli('sofia.cliente').idUsuario,
  );
  await servicio.create(
    { idProfesional: pro('oscar.electricista').idUsuario, idEspecialidad: oficio('Electricidad').idEspecialidad, descripcionProblema: 'Se corta la luz cuando prendo el horno.', inicioTurno: local(await turnoLibre(turnos, pro('oscar.electricista').idUsuario, 2)) },
    cli('diego.cliente').idUsuario,
  );

  console.log('  + solicitudes de ejemplo en todos los estados');
}

// Métodos de pago y promociones bancarias vigentes en el mes actual (las ve el cliente en Inicio)
const METODOS = ['Visa crédito Banco Nación', 'Mastercard crédito Banco Galicia', 'Visa débito Banco Macro', 'Mercado Pago'];
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
  const promos: { codigo: string; porcentaje: number; descripcion: string; metodo: string }[] = [
    { codigo: 'NACION20', porcentaje: 20, descripcion: 'Reintegro con Visa crédito del Banco Nación. Tope $10.000 por mes.', metodo: 'Visa crédito Banco Nación' },
    { codigo: 'GALICIA15', porcentaje: 15, descripcion: 'Reintegro con Mastercard crédito Galicia. Tope $8.000.', metodo: 'Mastercard crédito Banco Galicia' },
    { codigo: 'MACRO10', porcentaje: 10, descripcion: 'Reintegro con débito Macro, sin tope.', metodo: 'Visa débito Banco Macro' },
  ];
  for (const p of promos) {
    const existente = await promociones.findOne({ where: { codigo: p.codigo } });
    if (existente) {
      // Se renueva la vigencia al mes actual
      existente.fechaInicioVigencia = inicio;
      existente.fechaFinVigencia = fin;
      await promociones.save(existente);
      continue;
    }
    const nueva = await promociones.save(
      promociones.create({ codigo: p.codigo, porcentajeDescuento: p.porcentaje, descripcion: p.descripcion, fechaInicioVigencia: inicio, fechaFinVigencia: fin }),
    );
    // La relación la guarda el método de pago (es el dueño de la tabla intermedia)
    const metodo = porTipo.get(p.metodo)!;
    metodo.promociones = [...(metodo.promociones ?? []), nueva];
    await metodos.save(metodo);
    console.log(`  + promoción ${p.codigo}`);
  }
}

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn'] });
  try {
    const ds = app.get(DataSource);
    console.log('Catálogo (oficios, habilidades y zonas de Rosario)...');
    const catalogo = await seedCatalogo(ds);
    console.log('Usuarios de prueba...');
    const usuarios = await seedUsuarios(ds, app.get(TurnoService), catalogo);
    console.log('Solicitudes de ejemplo...');
    await seedSolicitudes(ds, app.get(SolicitudDeServicioService), app.get(TurnoService), usuarios, catalogo);
    console.log('Métodos de pago y promociones del mes...');
    await seedPromociones(ds);

    console.log(`\nListo. Contraseña de todas las cuentas de prueba: ${CONTRASEÑA}`);
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