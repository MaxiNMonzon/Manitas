import Box from '@mui/material/Box'

interface Props {
  // "color" (azul y naranja) sobre fondo claro; "blanco" sobre fondo azul oscuro (la barra de arriba)
  variante?: 'color' | 'blanco'
  // Alto del logo (el ancho sale solo, para no deformarlo). Puede cambiar según la pantalla
  alto?: number | Record<string, number>
}

// Logo de Manitas: la casa con el corazón + "Manitas" + "Tu hogar en buenas manos" (archivos en public/logo)
export default function Marca({ variante = 'color', alto = 64 }: Props) {
  return (
    <Box
      component="img"
      src={`/logo/logo-${variante}.svg`}
      alt="Manitas - Tu hogar en buenas manos"
      sx={{ height: alto, width: 'auto', display: 'block' }}
    />
  )
}
