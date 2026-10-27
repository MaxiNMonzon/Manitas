// Horario fijo de trabajo del profesional. Con esto el back arma sus turnos de una hora,
// que son los que el cliente elige al pedir presupuesto (sin horario, nadie le puede pedir).
// Con la sesión demo (provisoria) se guarda en memoria.
import { api, tokenStorage } from './client'
import type { RangoHorario } from '../types'

let horarioDemo: RangoHorario[] = [1, 2, 3, 4, 5].map((diaSemana) => ({ diaSemana, horaDesde: 9, horaHasta: 18 }))

export async function traerMiHorario(): Promise<RangoHorario[]> {
  if (tokenStorage.esDemo()) return horarioDemo
  const lista = await api.get<RangoHorario[]>('/turnos/mi-horario')
  return lista.map(({ diaSemana, horaDesde, horaHasta }) => ({ diaSemana, horaDesde, horaHasta }))
}

// Reemplaza todo el horario (una lista vacía = no trabaja ningún día). Los turnos ya tomados no cambian
export async function guardarMiHorario(horarios: RangoHorario[]): Promise<void> {
  if (tokenStorage.esDemo()) {
    horarioDemo = horarios
    return
  }
  await api.put('/turnos/mi-horario', { horarios })
}