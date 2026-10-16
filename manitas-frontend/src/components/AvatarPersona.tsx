import Avatar from '@mui/material/Avatar'

// Color fijo por persona (sale del nombre) para las iniciales cuando no hay foto
function colorDesdeTexto(texto: string): string {
  let hash = 0
  for (const letra of texto) hash = (hash * 31 + letra.charCodeAt(0)) % 360
  return `hsl(${hash}, 55%, 45%)`
}

interface Props {
  nombre: string
  apellido?: string
  fotoUrl?: string | null
  tamaño?: number
}

// Foto de la persona o, si no tiene, sus iniciales sobre un color propio
export default function AvatarPersona({ nombre, apellido = '', fotoUrl, tamaño = 56 }: Props) {
  const nombreCompleto = `${nombre} ${apellido}`.trim()
  return (
    <Avatar
      src={fotoUrl ?? undefined}
      alt={nombreCompleto}
      sx={{ width: tamaño, height: tamaño, fontSize: tamaño * 0.4, bgcolor: colorDesdeTexto(nombreCompleto) }}
    >
      {nombre[0]}
      {apellido[0]}
    </Avatar>
  )
}