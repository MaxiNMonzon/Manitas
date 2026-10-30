// Consultas de la sección "Ayuda" (POST /consulta): las lee el administrador y responde por correo.
// Con la sesión demo (provisoria) no se manda nada.
import { api, tokenStorage } from './client'

export interface NuevaConsulta {
  correo: string // a dónde contestarle
  tema: string
  mensaje: string
  // Quién la manda (rol y correo de la cuenta) lo saca el back del token
}

export async function enviarConsulta(consulta: NuevaConsulta): Promise<void> {
  if (tokenStorage.esDemo()) {
    await new Promise((r) => setTimeout(r, 500))
    return
  }
  await api.post('/consulta', consulta)
}
