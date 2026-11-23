// El formulario de "Mi perfil" del profesional: de dónde sale, cómo se valida y qué se le manda al back.
// Son funciones puras (no dibujan nada).
import { matriculasParaEnviar, type MatriculaForm } from '../matriculas'
import { validarContacto, validarTrabajo } from '../reglas'
import type { Errores } from '../useEdicionPerfil'
import type { CambiosPerfilProfesional, EspecialidadResumen, HabilidadResumen, PerfilProfesional, ZonaResumen } from '../../../types'

// Lo que se puede editar: los textos como texto (así trabajan los campos) y las listas
// con la MISMA forma que tienen en el perfil del back, así no hay que convertirlas
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
  especialidades: EspecialidadResumen[]
  habilidades: HabilidadResumen[]
  zonas: ZonaResumen[]
  matriculas: MatriculaForm[]
}

// El formulario arranca con los datos del perfil. Las listas pasan tal cual;
// solo los números y los opcionales se pasan a texto, y las matrículas al formato del editor
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
    especialidades: p.especialidades,
    habilidades: p.tiposDeServicio,
    zonas: p.zonasDeCobertura,
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
    idsEspecialidades: f.especialidades.map((e) => e.idEspecialidad),
    idsTiposDeServicio: f.habilidades.map((h) => h.idServicio),
    idsZonasCobertura: f.zonas.map((z) => z.idZona),
  }
}