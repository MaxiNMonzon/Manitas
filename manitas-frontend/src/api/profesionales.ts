// Buscar profesionales y ver su perfil (lo que usa el cliente para pedir un presupuesto)
import { api } from './client'
import type { CalificacionesDetalle, Categoria, Especialidad, ProfesionalApi, ProfesionalResumen } from '../types'

// GET /especialidad (público): las categorías del buscador
export async function traerEspecialidades(): Promise<Categoria[]> {
  const lista = await api.get<Especialidad[]>('/especialidad')
  return lista.map((e) => ({
    idEspecialidad: e.idEspecialidad,
    nombre: e.nombreEspecialidad,
    palabrasClave: (e.palabrasClave ?? '').split(',').map((p) => p.trim()).filter(Boolean),
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

  return lista.map((p) => ({
    idUsuario: p.idUsuario,
    nombre: p.nombre,
    apellido: p.apellido,
    fotoUrl: null,
    especialidades: p.especialidades.map((e) => e.nombreEspecialidad),
    oficios: p.especialidades.map((e) => ({ idEspecialidad: e.idEspecialidad, nombre: e.nombreEspecialidad })),
    zona: p.zonasDeCobertura.map((z) => z.nombreZona).join(', ') || 'Sin zona cargada',
    calificacion: p.calificacion?.promedio ?? 0,
    cantidadCalificaciones: p.calificacion?.cantidad ?? 0,
    descripcion: p.descripcion ?? '',
    costoVisita: p.costoVisita ?? null,
    habilidades: (p.tiposDeServicio ?? []).map((t) => t.nombreServicio),
  }))
}

