import { useEffect, useState } from 'react'

// Devuelve el valor recién cuando dejó de cambiar por `ms` milisegundos.
// En el buscador evita pedirle al back una búsqueda por cada letra que se escribe.
export function useDiferido<T>(valor: T, ms = 400): T {
  const [diferido, setDiferido] = useState(valor)
  useEffect(() => {
    const espera = setTimeout(() => setDiferido(valor), ms)
    // Si el valor cambia antes de tiempo, se descarta la espera anterior
    return () => clearTimeout(espera)
  }, [valor, ms])
  return diferido
}
