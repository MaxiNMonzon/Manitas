// El formulario de "Mi perfil" del cliente: de dónde sale, cómo se valida y qué se le manda al back.
// Son funciones puras (no dibujan nada).
import { validarContacto, validarDomicilio } from '../reglas'
import type { Errores } from '../useEdicionPerfil'
import type { CambiosPerfilCliente, PerfilCliente } from '../../../types'

// Lo que se puede editar, como texto (igual que en los campos)
export interface FormularioCliente {
  nombre: string
  apellido: string
  correo: string
  telefono: string
  calle: string
  altura: string
  piso: string
  depto: string
  idProvincia: string
  idLocalidad: string
  idZona: string
}

export function desdePerfil(perfil: PerfilCliente): FormularioCliente {
  const zona = perfil.zonaResidencia
  return {
    nombre: perfil.nombre,
    apellido: perfil.apellido,
    correo: perfil.correo,
    telefono: perfil.telefono,
    calle: perfil.calle,
    altura: String(perfil.altura),
    piso: perfil.piso ?? '',
    depto: perfil.depto ?? '',
    idProvincia: zona?.localidad?.provincia ? String(zona.localidad.provincia.idProvincia) : '',
    idLocalidad: zona?.localidad ? String(zona.localidad.idLocalidad) : '',
    idZona: zona ? String(zona.idZona) : '',
  }
}

// Las mismas reglas que el registro (están en reglas.ts)
export function validar(formulario: FormularioCliente): Errores<FormularioCliente> {
  return { ...validarContacto(formulario), ...validarDomicilio(formulario) }
}

// Lo que se manda al back (PATCH /cliente/:id)
export function paraEnviar(formulario: FormularioCliente): CambiosPerfilCliente {
  return {
    nombre: formulario.nombre.trim(),
    apellido: formulario.apellido.trim(),
    correo: formulario.correo.trim(),
    telefono: formulario.telefono,
    calle: formulario.calle.trim(),
    altura: Number(formulario.altura),
    // Vacío = se borra (una casa no tiene piso ni depto)
    piso: formulario.piso.trim() || null,
    depto: formulario.depto.trim() || null,
    idZonaResidencia: Number(formulario.idZona),
  }
}

// "Centro, Rosario, Santa Fe"
export function textoUbicacion(perfil: PerfilCliente): string {
  const zona = perfil.zonaResidencia
  return zona ? [zona.nombreZona, zona.localidad?.nombreLocalidad, zona.localidad?.provincia?.nombreProvincia].filter(Boolean).join(', ') : 'Sin zona'
}