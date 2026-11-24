// El formulario de "Mi perfil" del profesional: de dónde sale, cómo se valida y qué se le manda al back.
// Son funciones puras (no dibujan nada).
import { matriculasParaEnviar, type MatriculaForm } from '../matriculas'
import { validarContacto, validarTrabajo } from '../reglas'
import type { Errores } from '../useEdicionPerfil'
import { AYUDA_MONTO, esMontoValido, montoATexto, textoAMonto } from '../../../dinero'
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
export function desdePerfil(perfil: PerfilProfesional): FormularioProfesional {
  return {
    nombre: perfil.nombre,
    apellido: perfil.apellido,
    correo: perfil.correo,
    telefono: perfil.telefono,
    costoVisita: perfil.costoVisita != null ? montoATexto(perfil.costoVisita) : '',
    descripcion: perfil.descripcion ?? '',
    cbu: perfil.cbu ?? '',
    idProvincia: '',
    idLocalidad: '',
    especialidades: perfil.especialidades,
    habilidades: perfil.tiposDeServicio,
    zonas: perfil.zonasDeCobertura,
    matriculas: perfil.matriculas.map((matricula, indice) => ({
      clave: indice + 1,
      numero: matricula.numero,
      descripcion: matricula.descripcion ?? '',
      idEspecialidad: String(matricula.especialidad.idEspecialidad),
    })),
  }
}

// Mismas reglas que el registro (están en reglas.ts), más el costo de la visita que solo se edita acá
export function validar(formulario: FormularioProfesional): Errores<FormularioProfesional> {
  const errores: Errores<FormularioProfesional> = { ...validarContacto(formulario), ...validarTrabajo(formulario) }
  if (formulario.costoVisita && !esMontoValido(formulario.costoVisita)) errores.costoVisita = AYUDA_MONTO
  return errores
}

// Lo que se manda al back (PATCH /profesional/:id)
export function paraEnviar(formulario: FormularioProfesional): CambiosPerfilProfesional {
  return {
    nombre: formulario.nombre.trim(),
    apellido: formulario.apellido.trim(),
    correo: formulario.correo.trim(),
    telefono: formulario.telefono,
    matriculas: matriculasParaEnviar(formulario.matriculas),
    // Vacío = se borra el dato opcional
    costoVisita: formulario.costoVisita ? textoAMonto(formulario.costoVisita) : null,
    descripcion: formulario.descripcion.trim() || null,
    cbu: formulario.cbu || null,
    idsEspecialidades: formulario.especialidades.map((especialidad) => especialidad.idEspecialidad),
    idsTiposDeServicio: formulario.habilidades.map((habilidad) => habilidad.idServicio),
    idsZonasCobertura: formulario.zonas.map((zona) => zona.idZona),
  }
}