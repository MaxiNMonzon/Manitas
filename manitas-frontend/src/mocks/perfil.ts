// DATOS MOCK del perfil del profesional, solo para la sesión demo (datos del boceto "Mi perfil").
// Con sesión real se usan GET /auth/perfil y PATCH /profesional/:id.
import type { CambiosPerfilCliente, CambiosPerfilProfesional, PerfilCliente, PerfilProfesional } from '../types'

const plomeria = { idEspecialidad: 1, nombreEspecialidad: 'Plomería' }
const gas = { idEspecialidad: 2, nombreEspecialidad: 'Gas' }
const rosario = { nombreLocalidad: 'Rosario' }

export let perfilDemo: PerfilProfesional = {
  idUsuario: 7,
  dni: 23748882,
  nombre: 'Esteban',
  apellido: 'Quito',
  fechaNacimiento: '1985-04-12',
  correo: 'e.quito@gmail.com',
  telefono: '3415673202',
  matriculas: [
    { idMatricula: 1, numero: '000712249', descripcion: 'Plomero matriculado - Municipalidad de Rosario', especialidad: plomeria },
    { idMatricula: 2, numero: 'MG-4521', descripcion: 'Gasista de 2ª categoría', especialidad: gas },
  ],
  costoVisita: 5000,
  descripcion: 'Plomero y gasista matriculado con más de 15 años de experiencia. Me destaco por la puntualidad y por dejar todo limpio.',
  cbu: '0072414043253727100006', // Banco Galicia (empieza con 007)
  especialidades: [plomeria, gas],
  tiposDeServicio: [
    { idServicio: 1, nombreServicio: 'Mantenimiento', especialidad: plomeria },
    { idServicio: 2, nombreServicio: 'Instalación y reparación de cañerías', especialidad: plomeria },
  ],
  zonasDeCobertura: [
    { idZona: 1, nombreZona: 'Norte', localidad: rosario },
    { idZona: 2, nombreZona: 'Sur', localidad: rosario },
    { idZona: 3, nombreZona: 'Centro', localidad: rosario },
  ],
}

// Simula el PATCH: los datos simples se reemplazan. Las listas se quedan con lo que ya conocía el mock
// (en la demo sin back, el catálogo puede no estar)
export function guardarPerfilDemo(cambios: CambiosPerfilProfesional, nombres: { especialidades: PerfilProfesional['especialidades']; tiposDeServicio: PerfilProfesional['tiposDeServicio']; zonasDeCobertura: PerfilProfesional['zonasDeCobertura'] }): void {
  const { idsEspecialidades, idsTiposDeServicio, idsZonasCobertura, matriculas, ...simples } = cambios
  perfilDemo = {
    ...perfilDemo,
    ...simples,
    matriculas: matriculas.map((m) => ({
      numero: m.numero,
      descripcion: m.descripcion ?? null,
      especialidad: nombres.especialidades.find((e) => e.idEspecialidad === m.idEspecialidad) ?? { idEspecialidad: m.idEspecialidad, nombreEspecialidad: '' },
    })),
    especialidades: nombres.especialidades.filter((e) => idsEspecialidades.includes(e.idEspecialidad)),
    tiposDeServicio: nombres.tiposDeServicio.filter((t) => idsTiposDeServicio.includes(t.idServicio)),
    zonasDeCobertura: nombres.zonasDeCobertura.filter((z) => idsZonasCobertura.includes(z.idZona)),
  }
}

// ---------- Cliente (sesión demo) ----------
// Con sesión real se usan GET /auth/perfil y PATCH /cliente/:id

const zonaCentro: PerfilCliente['zonaResidencia'] = {
  idZona: 1,
  nombreZona: 'Centro',
  localidad: { idLocalidad: 1, codigoPostal: '2000', nombreLocalidad: 'Rosario', provincia: { idProvincia: 1, nombreProvincia: 'Santa Fe' } },
}

export let perfilClienteDemo: PerfilCliente = {
  idUsuario: 1,
  dni: 30111222,
  nombre: 'Laura',
  apellido: 'Méndez',
  fechaNacimiento: '1990-05-10',
  correo: 'demo.cliente@manitas.com',
  telefono: '3415551001',
  calle: 'Zeballos',
  altura: 1451,
  piso: '3',
  depto: 'B',
  zonaResidencia: zonaCentro,
}

// Simula el PATCH. La zona viene completa (con localidad y provincia) desde el formulario
export function guardarPerfilClienteDemo(cambios: CambiosPerfilCliente, zona: PerfilCliente['zonaResidencia']): void {
  const { idZonaResidencia: _id, ...simples } = cambios
  perfilClienteDemo = { ...perfilClienteDemo, ...simples, zonaResidencia: zona }
}
