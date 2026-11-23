// Matrículas del profesional en los formularios (perfil y registro)
import type { MatriculaRequest } from '../../types'

// Una fila del editor. `clave` es solo para React (las nuevas todavía no tienen id)
export interface MatriculaForm {
  clave: number
  numero: string
  descripcion: string
  idEspecialidad: string
}

export const MAX_NUMERO_MATRICULA = 30
export const MAX_DESCRIPCION_MATRICULA = 200

export function nuevaMatricula(lista: MatriculaForm[], idEspecialidad: number | undefined): MatriculaForm {
  const clave = lista.reduce((max, matricula) => Math.max(max, matricula.clave), 0) + 1
  return { clave, numero: '', descripcion: '', idEspecialidad: idEspecialidad ? String(idEspecialidad) : '' }
}

// Errores por fila (clave → mensaje), con las mismas reglas que el back (MatriculaDto)
export function erroresMatriculas(lista: MatriculaForm[]): Record<number, string> {
  const errores: Record<number, string> = {}
  const vistas = new Set<string>()
  for (const matricula of lista) {
    const clave = `${matricula.idEspecialidad}-${matricula.numero.trim().toLowerCase()}`
    if (!matricula.idEspecialidad) errores[matricula.clave] = 'Elegí la especialidad'
    else if (!matricula.numero.trim()) errores[matricula.clave] = 'Ingresá el número'
    else if (vistas.has(clave)) errores[matricula.clave] = 'Esta matrícula está repetida'
    vistas.add(clave)
  }
  return errores
}

export function matriculasParaEnviar(lista: MatriculaForm[]): MatriculaRequest[] {
  return lista.map((matricula) => ({
    numero: matricula.numero.trim(),
    descripcion: matricula.descripcion.trim() || undefined,
    idEspecialidad: Number(matricula.idEspecialidad),
  }))
}
