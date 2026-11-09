// Cobros del profesional
import { api } from './client'
import type { MisCobros } from '../types'

export async function traerCobros(): Promise<MisCobros> {
  return api.get<MisCobros>('/solicitud-de-servicio/cobros')
}