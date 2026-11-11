import type { ReactNode } from 'react'
import type { Errores } from './useEdicionPerfil'

interface Extra {
  // Texto de ayuda (solo se ve al editar)
  ayuda?: string
  // Deja escribir solo números, hasta esa cantidad
  soloNumeros?: number
  // Máximo de letras
  max?: number
  // Algo adelante del valor (ej: el "$")
  adelante?: ReactNode
}

interface Estado<F> {
  datos: F
  errores: Errores<F>
  editando: boolean
  cambiar: (cambios: Partial<F>) => void
}

// Las props de un campo de texto del perfil: editable al editar y de solo lectura si no.
// Uso: <TextField {...propsCampo(estado, 'nombre', 'Nombre')} />
export function propsCampo<F>({ datos, errores, editando, cambiar }: Estado<F>, nombre: keyof F, label: string, extra: Extra = {}) {
  return {
    label,
    value: datos[nombre] as string,
    onChange: (e: { target: { value: string } }) => {
      let valor = e.target.value
      if (extra.soloNumeros) valor = valor.replace(/\D/g, '').slice(0, extra.soloNumeros)
      if (extra.max) valor = valor.slice(0, extra.max)
      cambiar({ [nombre]: valor } as Partial<F>)
    },
    error: Boolean(errores[nombre]),
    helperText: errores[nombre] ?? (editando ? extra.ayuda : undefined),
    fullWidth: true,
    slotProps: {
      input: { readOnly: !editando, startAdornment: extra.adelante },
      htmlInput: extra.soloNumeros ? { inputMode: 'numeric' as const } : undefined,
    },
  }
}
