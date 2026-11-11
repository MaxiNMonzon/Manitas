// Las reglas de los datos del cliente y del profesional, escritas UNA sola vez.
// Las usan el registro y "Mi perfil" (mismas reglas que los DTOs del back), así nunca validan distinto.
import type { Opcion } from '../SelectorConChips'
import { erroresMatriculas, type MatriculaForm } from './matriculas'
import { cbuValido } from './cuentaBancaria'

export const MAX_DESCRIPCION = 2000

type Errores<K extends string> = Partial<Record<K, string>>

// Nombre, apellido, email y teléfono (los tienen todos)
export function validarContacto(f: { nombre: string; apellido: string; correo: string; telefono: string }) {
  const e: Errores<'nombre' | 'apellido' | 'correo' | 'telefono'> = {}
  if (!f.nombre.trim()) e.nombre = 'Ingresá tu nombre'
  if (!f.apellido.trim()) e.apellido = 'Ingresá tu apellido'
  if (!/^\S+@\S+\.\S+$/.test(f.correo.trim())) e.correo = 'Ingresá un email válido'
  if (!/^\d{8,15}$/.test(f.telefono)) e.telefono = 'Ingresá solo números, con característica'
  return e
}

// La dirección del cliente (donde van los profesionales). El profesional no tiene dirección
export function validarDomicilio(f: { calle: string; altura: string; piso: string; depto: string; idZona: string }) {
  const e: Errores<'calle' | 'altura' | 'piso' | 'depto' | 'idZona'> = {}
  if (!f.calle.trim()) e.calle = 'Ingresá la calle'
  if (!/^[1-9]\d*$/.test(f.altura)) e.altura = f.altura ? 'La altura es un número mayor a 0' : 'Ingresá la altura'
  if (f.piso.length > 10) e.piso = 'Máximo 10 caracteres'
  if (f.depto.length > 10) e.depto = 'Máximo 10 caracteres'
  if (!f.idZona) e.idZona = 'Elegí tu zona'
  return e
}

// Lo del trabajo del profesional: oficios, zonas, matrículas, CBU y "sobre mí"
export function validarTrabajo(f: {
  cbu: string
  descripcion: string
  especialidades: Opcion[]
  zonas: Opcion[]
  matriculas: MatriculaForm[]
}) {
  const e: Errores<'cbu' | 'descripcion' | 'especialidades' | 'zonas' | 'matriculas'> = {}
  // El CBU es opcional; si se carga, tiene que ser válido (22 números y sus dígitos verificadores)
  if (f.cbu && f.cbu.length !== 22) e.cbu = 'El CBU/CVU tiene 22 números'
  else if (f.cbu && !cbuValido(f.cbu)) e.cbu = 'Ese CBU no es válido: revisá que esté bien copiado'
  if (f.descripcion.length > MAX_DESCRIPCION) e.descripcion = `Máximo ${MAX_DESCRIPCION} caracteres`
  if (f.especialidades.length === 0) e.especialidades = 'Elegí al menos una especialidad'
  if (f.zonas.length === 0) e.zonas = 'Elegí al menos una zona de trabajo'
  if (Object.keys(erroresMatriculas(f.matriculas)).length > 0) e.matriculas = 'Revisá las matrículas'
  return e
}

// Si se saca una especialidad, también se sacan sus habilidades y sus matrículas
export function conEspecialidades<T extends { especialidades: Opcion[]; habilidades: Opcion[]; matriculas: MatriculaForm[] }>(f: T, elegidas: Opcion[]): T {
  const ids = new Set(elegidas.map((e) => e.id))
  return {
    ...f,
    especialidades: elegidas,
    habilidades: f.habilidades.filter((h) => h.grupoId === undefined || ids.has(h.grupoId)),
    matriculas: f.matriculas.filter((m) => !m.idEspecialidad || ids.has(Number(m.idEspecialidad))),
  }
}
