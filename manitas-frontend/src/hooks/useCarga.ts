import { useCallback, useEffect, useRef, useState } from 'react'

interface Estado<T> {
  clave: string
  datos: T | null
  error: string | null
}

// Carga datos con una función async. Vuelve a cargar cuando cambia `clave` (ej: el mes del
// calendario) o cuando se llama a `recargar()` (ej: después de agendar).
// Con `cadaMs` además se repite cada tantos milisegundos (ej: los avisos, cada 1 minuto).
export function useCarga<T>(clave: string, cargar: () => Promise<T>, cadaMs?: number) {
  const [estado, setEstado] = useState<Estado<T> | null>(null)
  const [version, setVersion] = useState(0)
  const recargar = useCallback(() => setVersion((v) => v + 1), [])

  // `cargar` cambia en cada render; se guarda la última y lo que decide cuándo recargar es la clave
  const cargarActual = useRef(cargar)
  useEffect(() => {
    cargarActual.current = cargar
  })

  useEffect(() => {
    let vigente = true
    const traer = () =>
      cargarActual.current()
        .then((datos) => vigente && setEstado({ clave, datos, error: null }))
        .catch((e: Error) => vigente && setEstado((prev) => ({ clave, datos: prev?.clave === clave ? prev.datos : null, error: e.message })))
    traer()
    const intervalo = cadaMs ? setInterval(traer, cadaMs) : undefined
    return () => {
      vigente = false
      clearInterval(intervalo)
    }
  }, [clave, version, cadaMs])

  const actual = estado?.clave === clave ? estado : null
  return { datos: actual?.datos ?? null, error: actual?.error ?? null, cargando: actual === null, recargar }
}