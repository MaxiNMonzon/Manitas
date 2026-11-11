import { listar } from '../../api/catalogos'
import { useCarga } from '../../hooks/useCarga'
import type { Referencia } from '../../pages/admin/catalogos'

export type Opcion = { id: number; label: string }

// Lista de opciones de una referencia (ej: las especialidades para elegir la de un tipo de servicio)
export function useOpciones(referencia: Referencia | undefined) {
  const carga = useCarga(`opciones-${referencia?.path ?? 'ninguna'}`, () => (referencia ? listar(referencia.path) : Promise.resolve([])))
  const opciones: Opcion[] = (carga.datos ?? []).map((f) => ({ id: Number(f[referencia!.id]), label: referencia!.etiqueta(f) }))
  return { opciones, cargando: carga.cargando, error: carga.error }
}