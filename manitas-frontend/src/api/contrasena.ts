// "Olvidé mi contraseña": se pide un link por mail y con ese link se elige una nueva
import { api } from './client'

type RolUsuario = 'cliente' | 'profesional'

// POST /auth/olvide-contrasena. Responde lo mismo exista o no la cuenta
export async function pedirLinkDeContraseña(rol: RolUsuario, correo: string) {
  return api.post<{ mensaje: string }>('/auth/olvide-contrasena', { rol, correo: correo.trim() })
}

// POST /auth/restablecer-contrasena con el código que vino en el link del mail
export async function restablecerContraseña(codigo: string, contraseña: string) {
  return api.post<{ mensaje: string; rol: RolUsuario }>('/auth/restablecer-contrasena', { codigo, contraseña })
}