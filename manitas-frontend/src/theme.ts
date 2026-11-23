import type { CSSProperties } from 'react'
import { alpha, createTheme, type Theme } from '@mui/material/styles'

// La configuración visual de toda la app, en un solo lugar: colores, tamaños de texto y formas.
// Los componentes no escriben colores ni tamaños sueltos: usan los nombres de acá
// ('primary.main', 'vidrio.fondo', variant="tituloSeccion"...). Para cambiar el look, se toca este archivo.

// Valores propios que MUI no trae: hay que contarle a TypeScript que existen
declare module '@mui/material/styles' {
  interface Palette {
    vidrio: { fondo: string; borde: string; boton: string }
  }
  interface PaletteOptions {
    vidrio?: { fondo: string; borde: string; boton: string }
  }
  interface TypographyVariants {
    etiqueta: CSSProperties
    tituloSeccion: CSSProperties
    bajada: CSSProperties
  }
  interface TypographyVariantsOptions {
    etiqueta?: CSSProperties
    tituloSeccion?: CSSProperties
    bajada?: CSSProperties
  }
}
declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    etiqueta: true
    tituloSeccion: true
    bajada: true
  }
}

const blanco = '#fff'

// 1. Paleta y forma
const base = createTheme({
  palette: {
    primary: { main: '#0b2545' },
    secondary: { main: '#ff8f00' },
    // Blancos translúcidos para poner arriba del degradado o de una foto
    vidrio: {
      fondo: alpha(blanco, 0.12),
      borde: alpha(blanco, 0.2),
      boton: alpha(blanco, 0.9),
    },
  },
  shape: { borderRadius: 10 },
})

// 2. Textos: variantes propias que se repetían con los mismos tamaños.
// Se arman sobre `base` para poder usar sus colores y sus breakpoints
const theme = createTheme(base, {
  typography: {
    // El "titulito" en mayúsculas arriba de un título ("CÓMO FUNCIONA")
    etiqueta: {
      ...base.typography.overline,
      color: base.palette.secondary.dark,
      fontWeight: 700,
      letterSpacing: 1.5,
    },
    // El título de cada sección de una página: más chico en celular
    tituloSeccion: {
      ...base.typography.h4,
      fontWeight: 700,
      fontSize: 26,
      [base.breakpoints.up('md')]: { fontSize: 34 },
    },
    // El párrafo que acompaña a un título, un poco más grande que el texto común
    bajada: {
      ...base.typography.body1,
      fontSize: 17,
    },
  },
  components: {
    MuiTypography: {
      defaultProps: {
        // Qué etiqueta HTML usa cada variante nueva (el título sigue siendo un título)
        variantMapping: { etiqueta: 'span', tituloSeccion: 'h2', bajada: 'p' },
      },
    },
  },
})

// El degradado de la marca (azul oscuro al naranja), usado en los paneles de presentación
export const degradadoMarca = (t: Theme) =>
  `linear-gradient(135deg, ${t.palette.primary.dark} 0%, ${t.palette.primary.main} 55%, ${t.palette.secondary.main} 130%)`

export default theme
