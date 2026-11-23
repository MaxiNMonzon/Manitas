// Cliente HTTP mínimo para hablar con el backend NestJS (tiene CORS habilitado).
const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

// El token se guarda en el navegador desde almacenamiento.ts (todo lo guardado pasa por ahí)
import { tokenStorage } from './almacenamiento'

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = tokenStorage.get()
  let respuesta: Response
  try {
    respuesta = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    })
  } catch {
    throw new ApiError(0, 'No se pudo conectar con el servidor')
  }

  if (!respuesta.ok) {
    // Nest devuelve { message: string | string[] } en los errores
    const body = await respuesta.json().catch(() => null)
    const message = Array.isArray(body?.message) ? body.message.join('. ') : body?.message
    throw new ApiError(respuesta.status, message ?? `Error ${respuesta.status}`)
  }
  if (respuesta.status === 204) return undefined as T
  return respuesta.json() as Promise<T>
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}
