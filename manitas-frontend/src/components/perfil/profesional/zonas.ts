import type { ZonaResumen } from '../../../types'

// "Centro (Rosario)": la localidad evita confundir zonas con el mismo nombre de distintas localidades.
// Está aparte (y no en SelectoresDeTrabajo.tsx) porque un archivo de componente tiene que exportar
// solo componentes: así la recarga en caliente de Vite funciona bien
export const textoZona = (zona: ZonaResumen) => (zona.localidad ? `${zona.nombreZona} (${zona.localidad.nombreLocalidad})` : zona.nombreZona)
