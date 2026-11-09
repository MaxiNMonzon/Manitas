// CRUD genérico de los catálogos que maneja el administrador (especialidades, zonas, métodos de pago...).
// Todos siguen el mismo contrato REST del back: GET /recurso, POST /recurso, PATCH /recurso/:id, DELETE /recurso/:id
import { api } from './client'

export type Fila = Record<string, unknown>

// filtro: query string opcional (ej: { especialidad: 3 } → ?especialidad=3)
export async function listar(path: string, filtro?: Record<string, string | number | null | undefined>): Promise<Fila[]> {
  const query = new URLSearchParams()
  Object.entries(filtro ?? {}).forEach(([clave, valor]) => {
    if (valor !== null && valor !== undefined && valor !== '') query.set(clave, String(valor))
  })
  return api.get<Fila[]>(query.size ? `${path}?${query}` : path)
}

export async function crear(path: string, datos: Fila): Promise<void> {
  await api.post(path, datos)
}

export async function editar(path: string, id: number, datos: Fila): Promise<void> {
  await api.patch(`${path}/${id}`, datos)
}

export async function borrar(path: string, id: number): Promise<void> {
  await api.delete(`${path}/${id}`)
}