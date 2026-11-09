// Consultas de la sección "Ayuda" (POST /consulta): las lee el administrador y responde por correo.
import { api } from './client'

export interface NuevaConsulta {
  correo: string // a dónde contestarle
  tema: string
  mensaje: string
  // Quién la manda (rol y correo de la cuenta) lo saca el back del token
}

export async function enviarConsulta(consulta: NuevaConsulta): Promise<void> {
  await api.post('/consulta', consulta)
}
