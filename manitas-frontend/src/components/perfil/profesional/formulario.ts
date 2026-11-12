// El formulario de "Mi perfil" del profesional: de dónde sale, cómo se valida y qué se le manda al back.
// Son funciones puras (no dibujan nada).
import type { Opcion } from '../../SelectorConChips'
import { matriculasParaEnviar, type MatriculaForm } from '../matriculas'
import { validarContacto, validarTrabajo } from '../reglas'
import type { Errores } from '../useEdicionPerfil'
import type { CambiosPerfilProfesional, PerfilProfesional } from '../../../types'

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

// Mismas reglas que el registro (están en reglas.ts), más el costo de la visita que solo se edita acá
export function validar(f: FormularioProfesional): Errores<FormularioProfesional> {
  const e: Errores<FormularioProfesional> = { ...validarContacto(f), ...validarTrabajo(f) }
  if (f.costoVisita && !/^\d+$/.test(f.costoVisita)) e.costoVisita = 'Solo números, sin puntos'
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