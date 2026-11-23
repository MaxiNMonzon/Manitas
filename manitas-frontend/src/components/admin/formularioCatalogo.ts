// El formulario de alta/edición de un catálogo del admin. Se arma solo con los campos
// de la configuración (pages/admin/catalogos.ts). Son funciones puras (no dibujan nada).
import type { Fila } from '../../api/catalogos'
import type { Catalogo } from '../../pages/admin/catalogos'

// Los valores con los que arranca: vacíos en un alta, los de la fila al editar
export function valoresIniciales(catalogo: Catalogo, fila: Fila | null): Fila {
  return Object.fromEntries(
    catalogo.campos.map((campo) => {
      const desdeFila = fila ? (campo.desdeFila ? campo.desdeFila(fila) : fila[campo.clave]) : undefined
      const vacio = campo.tipo === 'referencias' ? [] : campo.tipo === 'referencia' ? null : ''
      return [campo.clave, desdeFila ?? vacio]
    }),
  )
}

// Los campos obligatorios que faltan (o un número que no es número)
export function errores(catalogo: Catalogo, valores: Fila): Record<string, string> {
  return Object.fromEntries(
    catalogo.campos
      .filter((campo) => campo.requerido)
      .filter((campo) => {
        const valor = valores[campo.clave]
        return valor === null || valor === undefined || String(valor).trim() === '' || (campo.tipo === 'numero' && Number.isNaN(Number(valor)))
      })
      .map((campo) => [campo.clave, 'Completá este dato']),
  )
}

// Arma el cuerpo como lo espera el DTO del back
export function cuerpoParaEnviar(catalogo: Catalogo, valores: Fila, editando: boolean): Fila {
  const cuerpo: Fila = {}
  for (const campo of catalogo.campos) {
    const valor = valores[campo.clave]
    if (campo.tipo === 'numero' || campo.tipo === 'referencia') {
      if (valor !== null && valor !== '') cuerpo[campo.clave] = Number(valor)
    } else if (campo.tipo === 'referencias') {
      cuerpo[campo.clave] = valor
    } else {
      const texto = String(valor ?? '').trim()
      // Un opcional vacío: en el alta no se manda; al editar se borra
      if (texto) cuerpo[campo.clave] = texto
      else if (editando) cuerpo[campo.clave] = null
    }
  }
  return cuerpo
}
