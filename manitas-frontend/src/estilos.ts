import type { SxProps, Theme } from '@mui/material/styles'

// Estilos que se repiten en más de un componente. Los colores y tamaños salen del tema (theme.ts).
// Con `satisfies` TypeScript chequea que sean estilos válidos y deja combinarlos: sx={[botonFlotante, ...]}

// Botón chico translúcido con un ícono que se mueve ("Conocé Manitas", "Volver arriba")
export const botonFlotante = {
  flexDirection: 'column',
  px: 2,
  py: 0.5,
  borderRadius: 3,
  color: 'primary.main',
  bgcolor: 'vidrio.boton',
  boxShadow: 2,
} satisfies SxProps<Theme>

// El ícono del botón sube y baja: `desplazamiento` negativo = hacia arriba
export const iconoQueRebota = (desplazamiento: number) =>
  ({
    '@keyframes rebote': { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: `translateY(${desplazamiento}px)` } },
    '& svg': { animation: 'rebote 1.6s ease-in-out infinite' },
  }) satisfies SxProps<Theme>
