// Buscar profesionales y ver su perfil (lo que usa el cliente para pedir un presupuesto).
// Con la sesión demo (provisoria) usa los datos mock de la pantalla de inicio.
import { api, tokenStorage } from './client'
import type { CalificacionesDetalle, Especialidad, ProfesionalApi } from '../types'
import { categorias, profesionalesCercanos, type Categoria, type ProfesionalResumen } from '../mocks/inicioCliente'

// GET /especialidad (público): las categorías del buscador
export async function traerEspecialidades(): Promise<Categoria[]> {
  if (tokenStorage.esDemo()) return categorias
  const lista = await api.get<Especialidad[]>('/especialidad')
  return lista.map((e) => ({
    idEspecialidad: e.idEspecialidad,
    nombre: e.nombreEspecialidad,
    palabrasClave: (e.palabrasClave ?? '').split(',').map((p) => p.trim()).filter(Boolean),
  }))
}

export async function traerCalificaciones(idProfesional: number): Promise<CalificacionesDetalle> {
  if (tokenStorage.esDemo()) {
    const p = profesionalesCercanos.find((x) => x.idUsuario === idProfesional)
    return {
      promedio: p?.calificacion ?? null,
      cantidad: p?.cantidadCalificaciones ?? 0,
      reseñas: [
        { calificacion: 5, reseña: 'Muy prolijo y llegó puntual.', fecha: new Date().toISOString(), cliente: 'Sofía' },
        { calificacion: 4, reseña: 'Buen trabajo, recomendable.', fecha: new Date().toISOString(), cliente: 'Carlos' },
      ],
    }
  }
  return api.get<CalificacionesDetalle>(`/profesional/${idProfesional}/calificaciones`)
}

// GET /profesional con filtros opcionales. Cada uno con su promedio de estrellas (GET /:id/calificaciones)
export async function buscarProfesionales(filtros: { idEspecialidad?: number | null; idZona?: number | null }): Promise<ProfesionalResumen[]> {
  if (tokenStorage.esDemo()) {
    const nombre = categorias.find((c) => c.idEspecialidad === filtros.idEspecialidad)?.nombre
    return nombre ? profesionalesCercanos.filter((p) => p.especialidades.includes(nombre)) : profesionalesCercanos
  }
  const query = new URLSearchParams()
  if (filtros.idEspecialidad) query.set('especialidad', String(filtros.idEspecialidad))
  if (filtros.idZona) query.set('zona', String(filtros.idZona))
  const lista = await api.get<ProfesionalApi[]>(`/profesional${query.size ? `?${query}` : ''}`)

  return Promise.all(
    lista.map(async (p) => {
      // Si fallan las estrellas de uno, se muestra igual (sin calificaciones)
      const cal = await api.get<CalificacionesDetalle>(`/profesional/${p.idUsuario}/calificaciones`).catch(() => null)
      return {
        idUsuario: p.idUsuario,
        nombre: p.nombre,
        apellido: p.apellido,
        fotoUrl: null,
        especialidades: p.especialidades.map((e) => e.nombreEspecialidad),
        oficios: p.especialidades.map((e) => ({ idEspecialidad: e.idEspecialidad, nombre: e.nombreEspecialidad })),
        zona: p.zonasDeCobertura.map((z) => z.nombreZona).join(', ') || 'Sin zona cargada',
        calificacion: cal?.promedio ?? 0,
        cantidadCalificaciones: cal?.cantidad ?? 0,
        descripcion: p.descripcion ?? '',
        costoVisita: p.costoVisita ?? null,
        habilidades: (p.tiposDeServicio ?? []).map((t) => t.nombreServicio),
      }
    }),
  )
}
