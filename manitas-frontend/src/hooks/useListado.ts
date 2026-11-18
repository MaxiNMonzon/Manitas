import { useEffect, useState } from 'react'
import { api } from '../api/client'

interface Resultado<T> {
  url: string
  datos: T[]
  error: string | null
}

// Trae un listado del backend (ej: '/provincia'). Con url = null no pide nada y devuelve [].
// Si la url cambia (ej: otra provincia), devuelve [] hasta que llega la respuesta nueva.
export function useListado<T>(url: string | null): { datos: T[]; error: string | null } {
  const [resultado, setResultado] = useState<Resultado<T> | null>(null)

  useEffect(() => {
    if (!url) return
    let vigente = true
    api
      .get<T[]>(url)
      .then((datos) => vigente && setResultado({ url, datos, error: null }))
      .catch((e: Error) => vigente && setResultado({ url, datos: [], error: e.message }))
    return () => {
      vigente = false
    }
  }, [url])

  if (!url || resultado?.url !== url) return { datos: [], error: null }
  return { datos: resultado.datos, error: resultado.error }
}
