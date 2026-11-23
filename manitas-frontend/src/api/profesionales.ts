// Buscar profesionales y ver su perfil (lo que usa el cliente para pedir un presupuesto)
import { api } from './client'
import type { CalificacionesDetalle, Categoria, Especialidad, ProfesionalApi, ProfesionalResumen } from '../types'

// GET /especialidad (público): las categorías del buscador
export async function traerEspecialidades(): Promise<Categoria[]> {
  const lista = await api.get<Especialidad[]>('/especialidad')
  return lista.map((especialidad) => ({
    idEspecialidad: especialidad.idEspecialidad,
    nombre: especialidad.nombreEspecialidad,
    palabrasClave: (especialidad.palabrasClave ?? '').split(',').map((palabra) => palabra.trim()).filter(Boolean),
  }))
}

export async function traerCalificaciones(idProfesional: number): Promise<CalificacionesDetalle> {
  return api.get<CalificacionesDetalle>(`/profesional/${idProfesional}/calificaciones`)
}

// GET /profesional con filtros opcionales: especialidad, zona y texto libre (q).
// El back filtra y ya trae el promedio de estrellas de cada uno: un solo pedido, con solo los que coinciden
export async function buscarProfesionales(filtros: {
  idEspecialidad?: number | null
  idZona?: number | null
  texto?: string
}): Promise<ProfesionalResumen[]> {
  const texto = filtros.texto?.trim() ?? ''

  const query = new URLSearchParams()
  if (filtros.idEspecialidad) query.set('especialidad', String(filtros.idEspecialidad))
  if (filtros.idZona) query.set('zona', String(filtros.idZona))
  if (texto) query.set('q', texto)
  const lista = await api.get<ProfesionalApi[]>(`/profesional${query.size ? `?${query}` : ''}`)

  return lista.map((profesional) => ({
    idUsuario: profesional.idUsuario,
    nombre: profesional.nombre,
    apellido: profesional.apellido,
    fotoUrl: null,
    especialidades: profesional.especialidades.map((especialidad) => especialidad.nombreEspecialidad),
    oficios: profesional.especialidades.map((especialidad) => ({ idEspecialidad: especialidad.idEspecialidad, nombre: especialidad.nombreEspecialidad })),
    zona: profesional.zonasDeCobertura.map((zona) => zona.nombreZona).join(', ') || 'Sin zona cargada',
    calificacion: profesional.calificacion?.promedio ?? 0,
    cantidadCalificaciones: profesional.calificacion?.cantidad ?? 0,
    descripcion: profesional.descripcion ?? '',
    costoVisita: profesional.costoVisita ?? null,
    habilidades: (profesional.tiposDeServicio ?? []).map((habilidad) => habilidad.nombreServicio),
  }))
}