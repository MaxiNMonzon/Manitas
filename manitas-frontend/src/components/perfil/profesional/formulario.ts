// El formulario de "Mi perfil" del profesional: de dónde sale, cómo se valida y qué se le manda al back.
// Son funciones puras (no dibujan nada).
import type { Opcion } from '../../SelectorConChips'
import { erroresMatriculas, matriculasParaEnviar, type MatriculaForm } from '../matriculas'
import { cbuValido } from '../cuentaBancaria'
import type { Errores } from '../useEdicionPerfil'
import type { CambiosPerfilProfesional, PerfilProfesional } from '../../../types'

export const MAX_DESCRIPCION = 2000

// Lo que se puede editar (como texto, igual que en los campos) y lo elegido en las listas
export interface FormularioProfesional {
  nombre: string
  apellido: string
  correo: string
  telefono: string
  costoVisita: string
  descripcion: string
  cbu: string
  // Provincia y localidad solo sirven para buscar zonas nuevas
  idProvincia: string
  idLocalidad: string
  especialidades: Opcion[]
  habilidades: Opcion[]
  zonas: Opcion[]
  matriculas: MatriculaForm[]
}

const etiquetaZona = (z: PerfilProfesional['zonasDeCobertura'][number]) =>
  z.localidad ? `${z.nombreZona} (${z.localidad.nombreLocalidad})` : z.nombreZona

export function desdePerfil(p: PerfilProfesional): FormularioProfesional {
  return {
    nombre: p.nombre,
    apellido: p.apellido,
    correo: p.correo,
    telefono: p.telefono,
    costoVisita: p.costoVisita != null ? String(p.costoVisita) : '',
    descripcion: p.descripcion ?? '',
    cbu: p.cbu ?? '',
    idProvincia: '',
    idLocalidad: '',
    especialidades: p.especialidades.map((e) => ({ id: e.idEspecialidad, label: e.nombreEspecialidad })),
    habilidades: p.tiposDeServicio.map((t) => ({
      id: t.idServicio,
      label: t.nombreServicio,
      grupo: t.especialidad?.nombreEspecialidad,
      grupoId: t.especialidad?.idEspecialidad,
    })),
    zonas: p.zonasDeCobertura.map((z) => ({ id: z.idZona, label: etiquetaZona(z) })),
    matriculas: p.matriculas.map((m, i) => ({
      clave: i + 1,
      numero: m.numero,
      descripcion: m.descripcion ?? '',
      idEspecialidad: String(m.especialidad.idEspecialidad),
    })),
  }
}

// Mismas reglas que el back (UpdateProfesionalDto), más el control de los dígitos del CBU
export function validar(f: FormularioProfesional): Errores<FormularioProfesional> {
  const e: Errores<FormularioProfesional> = {}
  if (!f.nombre.trim()) e.nombre = 'Ingresá tu nombre'
  if (!f.apellido.trim()) e.apellido = 'Ingresá tu apellido'
  if (!/^\S+@\S+\.\S+$/.test(f.correo.trim())) e.correo = 'Ingresá un email válido'
  if (!/^\d{8,15}$/.test(f.telefono)) e.telefono = 'Ingresá solo números, con característica'
  if (f.costoVisita && !/^\d+$/.test(f.costoVisita)) e.costoVisita = 'Solo números, sin puntos'
  if (f.cbu && f.cbu.length !== 22) e.cbu = 'El CBU/CVU tiene 22 números'
  else if (f.cbu && !cbuValido(f.cbu)) e.cbu = 'Ese CBU no es válido: revisá que esté bien copiado'
  if (f.descripcion.length > MAX_DESCRIPCION) e.descripcion = `Máximo ${MAX_DESCRIPCION} caracteres`
  if (f.especialidades.length === 0) e.especialidades = 'Elegí al menos una especialidad'
  if (f.zonas.length === 0) e.zonas = 'Elegí al menos una zona de trabajo'
  if (Object.keys(erroresMatriculas(f.matriculas)).length > 0) e.matriculas = 'Revisá las matrículas'
  return e
}

// Lo que se manda al back (PATCH /profesional/:id)
export function paraEnviar(f: FormularioProfesional): CambiosPerfilProfesional {
  return {
    nombre: f.nombre.trim(),
    apellido: f.apellido.trim(),
    correo: f.correo.trim(),
    telefono: f.telefono,
    matriculas: matriculasParaEnviar(f.matriculas),
    // Vacío = se borra el dato opcional
    costoVisita: f.costoVisita ? Number(f.costoVisita) : null,
    descripcion: f.descripcion.trim() || null,
    cbu: f.cbu || null,
    idsEspecialidades: f.especialidades.map((o) => o.id),
    idsTiposDeServicio: f.habilidades.map((o) => o.id),
    idsZonasCobertura: f.zonas.map((o) => o.id),
  }
}

// Si se saca una especialidad, también se sacan sus habilidades y sus matrículas
export function conEspecialidades(f: FormularioProfesional, elegidas: Opcion[]): FormularioProfesional {
  const ids = new Set(elegidas.map((e) => e.id))
  return {
    ...f,
    especialidades: elegidas,
    habilidades: f.habilidades.filter((h) => h.grupoId === undefined || ids.has(h.grupoId)),
    matriculas: f.matriculas.filter((m) => !m.idEspecialidad || ids.has(Number(m.idEspecialidad))),
  }
}
