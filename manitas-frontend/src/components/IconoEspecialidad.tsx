import ElectricalServicesIcon from '@mui/icons-material/ElectricalServices'
import PlumbingIcon from '@mui/icons-material/Plumbing'
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment'
import FormatPaintIcon from '@mui/icons-material/FormatPaint'
import ConstructionIcon from '@mui/icons-material/Construction'
import CarpenterIcon from '@mui/icons-material/Carpenter'
import KeyIcon from '@mui/icons-material/Key'
import AcUnitIcon from '@mui/icons-material/AcUnit'
import CleaningServicesIcon from '@mui/icons-material/CleaningServices'
import YardIcon from '@mui/icons-material/Yard'
import HandymanIcon from '@mui/icons-material/Handyman'

// Ícono según el nombre de la especialidad (sin importar mayúsculas ni tildes).
// Las especialidades que no están en la lista usan uno genérico.
const iconos: Record<string, typeof HandymanIcon> = {
  electricidad: ElectricalServicesIcon,
  plomeria: PlumbingIcon,
  gas: LocalFireDepartmentIcon,
  pintura: FormatPaintIcon,
  albanileria: ConstructionIcon,
  carpinteria: CarpenterIcon,
  cerrajeria: KeyIcon,
  climatizacion: AcUnitIcon,
  limpieza: CleaningServicesIcon,
  jardineria: YardIcon,
}

function normalizar(texto: string) {
  return texto.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim()
}

export default function IconoEspecialidad({ nombre, fontSize = 'medium' }: { nombre: string; fontSize?: 'small' | 'medium' | 'large' }) {
  const Icono = iconos[normalizar(nombre)] ?? HandymanIcon
  return <Icono fontSize={fontSize} />
}
