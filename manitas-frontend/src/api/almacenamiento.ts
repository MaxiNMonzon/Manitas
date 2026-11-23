// Todo lo que la app guarda en el navegador (localStorage) pasa por acá, en un solo lugar.
// Si un día se guarda en otro lado (ej. una cookie), se cambia solo este archivo.
// En una ventana privada el navegador puede no dejar guardar: entonces se sigue como si no hubiera nada.
import type { Rol } from '../types'

// Las claves con las que se guarda cada cosa
const CLAVES = {
  token: 'manitas.token',
  sesion: 'manitas.sesion',
  misAcciones: 'manitas.misAcciones',
  avisosLeidos: 'manitas.avisosLeidos',
  // Las novedades del Inicio se recuerdan por cuenta (rol + correo)
  estadosVistos: (rol: Rol, correo: string) => `manitas.estadosVistos.${rol}.${correo}`,
}

// Lee un dato guardado como JSON; si no hay o está roto, devuelve el valor por defecto
function leer<T>(clave: string, porDefecto: T): T {
  try {
    const guardado = localStorage.getItem(clave)
    return guardado ? (JSON.parse(guardado) as T) : porDefecto
  } catch {
    return porDefecto
  }
}

function guardar(clave: string, valor: unknown) {
  try {
    localStorage.setItem(clave, JSON.stringify(valor))
  } catch {
    // Sin almacenamiento: no se recuerda, no pasa nada
  }
}

function borrar(clave: string) {
  try {
    localStorage.removeItem(clave)
  } catch {
    // Nada que borrar
  }
}

// El token del login (se guarda tal cual, sin JSON)
export const tokenStorage = {
  get: (): string | null => {
    try {
      return localStorage.getItem(CLAVES.token)
    } catch {
      return null
    }
  },
  set: (token: string) => {
    try {
      localStorage.setItem(CLAVES.token, token)
    } catch {
      // Sin almacenamiento: la sesión dura hasta recargar la página
    }
  },
  clear: () => borrar(CLAVES.token),
}

// Quién está logueado (correo y rol), para mostrar el menú correcto al recargar la página
export interface SesionGuardada {
  correo: string
  rol: Rol
}
export const sesionStorage = {
  get: () => leer<SesionGuardada | null>(CLAVES.sesion, null),
  set: (sesion: SesionGuardada) => guardar(CLAVES.sesion, sesion),
  clear: () => borrar(CLAVES.sesion),
}

// Cuándo cambiaste vos cada solicitud (id -> hora): ver misAcciones.ts
export const misAccionesStorage = {
  get: () => leer<Record<string, number>>(CLAVES.misAcciones, {}),
  set: (acciones: Record<string, number>) => guardar(CLAVES.misAcciones, acciones),
}

// Los avisos de la campanita que ya leíste
export const avisosLeidosStorage = {
  get: () => new Set(leer<string[]>(CLAVES.avisosLeidos, [])),
  set: (leidos: Set<string>) => guardar(CLAVES.avisosLeidos, [...leidos]),
}

// Cómo estaba cada solicitud la última vez que la viste (para las novedades del Inicio)
export const estadosVistosStorage = {
  get: (rol: Rol, correo: string) => leer<Record<string, string> | null>(CLAVES.estadosVistos(rol, correo), null),
  set: (rol: Rol, correo: string, vistos: Record<string, string>) => guardar(CLAVES.estadosVistos(rol, correo), vistos),
}
