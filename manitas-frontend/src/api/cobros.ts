// Cobros del profesional. Con la sesión demo (provisoria) devuelve datos mock.
import { api, tokenStorage } from './client'
import type { MisCobros } from '../types'
import { cobrosDemo } from '../mocks/cobros'

export async function traerCobros(): Promise<MisCobros> {
  if (tokenStorage.esDemo()) return cobrosDemo()
  return api.get<MisCobros>('/solicitud-de-servicio/cobros')
}