// Perfil de la persona logueada. Con la sesión demo (provisoria) usa datos mock.
import { api, tokenStorage } from './client'
import type { CambiosPerfilProfesional, PerfilProfesional } from '../types'
import { guardarPerfilDemo, perfilDemo } from '../mocks/perfil'

export async function traerPerfilProfesional(): Promise<PerfilProfesional> {
  if (tokenStorage.esDemo()) return perfilDemo
  return api.get<PerfilProfesional>('/auth/perfil')
}

// `nombres`: lo elegido con su nombre, solo para que la demo pueda mostrarlo (la API lo arma sola)
export async function guardarPerfilProfesional(
  id: number,
  cambios: CambiosPerfilProfesional,
  nombres: Parameters<typeof guardarPerfilDemo>[1],
): Promise<void> {
  if (tokenStorage.esDemo()) return guardarPerfilDemo(cambios, nombres)
  await api.patch(`/profesional/${id}`, cambios)
}

// Pide la actual: el back la verifica antes de cambiarla
export async function cambiarContraseña(contraseñaActual: string, contraseñaNueva: string): Promise<void> {
  if (tokenStorage.esDemo()) {
    if (contraseñaActual.length < 8) throw new Error('La contraseña actual no es correcta')
    return
  }
  await api.patch('/auth/contrasena', { contraseñaActual, contraseñaNueva })
}
