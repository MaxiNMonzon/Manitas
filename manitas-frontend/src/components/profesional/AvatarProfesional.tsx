import Avatar from '@mui/material/Avatar'
import type { ProfesionalResumen } from '../../mocks/inicioCliente'

// Color fijo por persona (sale del nombre) para las iniciales cuando no hay foto
function colorDesdeTexto(texto: string): string {
  let hash = 0
  for (const letra of texto) hash = (hash * 31 + letra.charCodeAt(0)) % 360
  return `hsl(${hash}, 55%, 45%)`
}

export default function AvatarProfesional({ profesional, tamaño = 56 }: { profesional: ProfesionalResumen; tamaño?: number }) {
  const nombreCompleto = `${profesional.nombre} ${profesional.apellido}`
  return (
    <Avatar
      src={profesional.fotoUrl ?? undefined}
      alt={nombreCompleto}
      sx={{ width: tamaño, height: tamaño, fontSize: tamaño * 0.4, bgcolor: colorDesdeTexto(nombreCompleto) }}
    >
      {profesional.nombre[0]}
      {profesional.apellido[0]}
    </Avatar>
  )
}
