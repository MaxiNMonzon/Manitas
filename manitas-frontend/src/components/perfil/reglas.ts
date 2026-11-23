// Las reglas de los datos del cliente y del profesional, escritas UNA sola vez.
// Las usan el registro y "Mi perfil" (mismas reglas que los DTOs del back), así nunca validan distinto.
import { erroresMatriculas, type MatriculaForm } from './matriculas'
import type { EspecialidadResumen, HabilidadResumen, ZonaResumen } from '../../types'
import { cbuValido } from './cuentaBancaria'

export const MAX_DESCRIPCION = 2000

type Errores<K extends string> = Partial<Record<K, string>>

// Nombre, apellido, email y teléfono (los tienen todos)
export function validarContacto(datos: { nombre: string; apellido: string; correo: string; telefono: string }) {
  const errores: Errores<'nombre' | 'apellido' | 'correo' | 'telefono'> = {}
  if (!datos.nombre.trim()) errores.nombre = 'Ingresá tu nombre'
  if (!datos.apellido.trim()) errores.apellido = 'Ingresá tu apellido'
  if (!/^\S+@\S+\.\S+$/.test(datos.correo.trim())) errores.correo = 'Ingresá un email válido'
  if (!/^\d{8,15}$/.test(datos.telefono)) errores.telefono = 'Ingresá solo números, con característica'
  return errores
}

// La dirección del cliente (donde van los profesionales). El profesional no tiene dirección
export function validarDomicilio(datos: { calle: string; altura: string; piso: string; depto: string; idZona: string }) {
  const errores: Errores<'calle' | 'altura' | 'piso' | 'depto' | 'idZona'> = {}
  if (!datos.calle.trim()) errores.calle = 'Ingresá la calle'
  if (!/^[1-9]\d*$/.test(datos.altura)) errores.altura = datos.altura ? 'La altura es un número mayor a 0' : 'Ingresá la altura'
  if (datos.piso.length > 10) errores.piso = 'Máximo 10 caracteres'
  if (datos.depto.length > 10) errores.depto = 'Máximo 10 caracteres'
  if (!datos.idZona) errores.idZona = 'Elegí tu zona'
  return errores
}

// Lo del trabajo del profesional: oficios, zonas, matrículas, CBU y "sobre mí"
export function validarTrabajo(datos: {
  cbu: string
  descripcion: string
  especialidades: EspecialidadResumen[]
  zonas: ZonaResumen[]
  matriculas: MatriculaForm[]
}) {
  const errores: Errores<'cbu' | 'descripcion' | 'especialidades' | 'zonas' | 'matriculas'> = {}
  // El CBU es opcional; si se carga, tiene que ser válido (22 números y sus dígitos verificadores)
  if (datos.cbu && datos.cbu.length !== 22) errores.cbu = 'El CBU/CVU tiene 22 números'
  else if (datos.cbu && !cbuValido(datos.cbu)) errores.cbu = 'Ese CBU no es válido: revisá que esté bien copiado'
  if (datos.descripcion.length > MAX_DESCRIPCION) errores.descripcion = `Máximo ${MAX_DESCRIPCION} caracteres`
  if (datos.especialidades.length === 0) errores.especialidades = 'Elegí al menos una especialidad'
  if (datos.zonas.length === 0) errores.zonas = 'Elegí al menos una zona de trabajo'
  if (Object.keys(erroresMatriculas(datos.matriculas)).length > 0) errores.matriculas = 'Revisá las matrículas'
  return errores
}

// Si se saca una especialidad, también se sacan sus habilidades y sus matrículas
export function conEspecialidades<T extends { especialidades: EspecialidadResumen[]; habilidades: HabilidadResumen[]; matriculas: MatriculaForm[] }>(
  formulario: T,
  elegidas: EspecialidadResumen[],
): T {
  const ids = new Set(elegidas.map((especialidad) => especialidad.idEspecialidad))
  return {
    ...formulario,
    especialidades: elegidas,
    habilidades: formulario.habilidades.filter((habilidad) => !habilidad.especialidad || ids.has(habilidad.especialidad.idEspecialidad)),
    matriculas: formulario.matriculas.filter((matricula) => !matricula.idEspecialidad || ids.has(Number(matricula.idEspecialidad))),
  }
}