// El formulario de alta/edición de un catálogo del admin. Se arma solo con los campos
// de la configuración (pages/admin/catalogos.ts). Son funciones puras (no dibujan nada).
import type { Fila } from '../../api/catalogos'
import type { Catalogo } from '../../pages/admin/catalogos'

// Los valores con los que arranca: vacíos en un alta, los de la fila al editar
export function valoresIniciales(catalogo: Catalogo, fila: Fila | null): Fila {
  return Object.fromEntries(
    catalogo.campos.map((c) => {
      const desdeFila = fila ? (c.desdeFila ? c.desdeFila(fila) : fila[c.clave]) : undefined
      const vacio = c.tipo === 'referencias' ? [] : c.tipo === 'referencia' ? null : ''
      return [c.clave, desdeFila ?? vacio]
    }),
  )
}

// Los campos obligatorios que faltan (o un número que no es número)
export function errores(catalogo: Catalogo, valores: Fila): Record<string, string> {
  return Object.fromEntries(
    catalogo.campos
      .filter((c) => c.requerido)
      .filter((c) => {
        const v = valores[c.clave]
        return v === null || v === undefined || String(v).trim() === '' || (c.tipo === 'numero' && Number.isNaN(Number(v)))
      })
      .map((c) => [c.clave, 'Completá este dato']),
  )
}

// Arma el cuerpo como lo espera el DTO del back
export function cuerpoParaEnviar(catalogo: Catalogo, valores: Fila, editando: boolean): Fila {
  const cuerpo: Fila = {}
  for (const c of catalogo.campos) {
    const v = valores[c.clave]
    if (c.tipo === 'numero' || c.tipo === 'referencia') {
      if (v !== null && v !== '') cuerpo[c.clave] = Number(v)
    } else if (c.tipo === 'referencias') {
      cuerpo[c.clave] = v
    } else {
      const t = String(v ?? '').trim()
      // Un opcional vacío: en el alta no se manda; al editar se borra
      if (t) cuerpo[c.clave] = t
      else if (editando) cuerpo[c.clave] = null
    }
  }
  return cuerpo
}
