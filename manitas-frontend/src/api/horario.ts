// Horario fijo de trabajo del profesional. Con esto el back arma sus turnos de una hora,
// que son los que el cliente elige al pedir presupuesto (sin horario, nadie le puede pedir).
import { api } from './client'
import type { RangoHorario } from '../types'

export async function traerMiHorario(): Promise<RangoHorario[]> {
  const lista = await api.get<RangoHorario[]>('/turnos/mi-horario')
  return lista.map(({ diaSemana, horaDesde, horaHasta }) => ({ diaSemana, horaDesde, horaHasta }))
}

// Reemplaza todo el horario (una lista vacía = no trabaja ningún día). Los turnos ya tomados no cambian
export async function guardarMiHorario(horarios: RangoHorario[]): Promise<void> {
  await api.put('/turnos/mi-horario', { horarios })
}
