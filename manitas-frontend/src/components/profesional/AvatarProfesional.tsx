import type { ProfesionalResumen } from '../../types'
import AvatarPersona from '../AvatarPersona'

export default function AvatarProfesional({ profesional, tamaño = 56 }: { profesional: ProfesionalResumen; tamaño?: number }) {
  return (
    <AvatarPersona
      nombre={profesional.nombre}
      apellido={profesional.apellido}
      fotoUrl={profesional.fotoUrl}
      tamaño={tamaño}
    />
  )
}
