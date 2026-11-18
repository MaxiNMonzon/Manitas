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

export function desdePerfil(p: PerfilCliente): FormularioCliente {
  const zona = p.zonaResidencia
  return {
    nombre: p.nombre,
    apellido: p.apellido,
    correo: p.correo,
    telefono: p.telefono,
    calle: p.calle,
    altura: String(p.altura),
    piso: p.piso ?? '',
    depto: p.depto ?? '',
    idProvincia: zona?.localidad?.provincia ? String(zona.localidad.provincia.idProvincia) : '',
    idLocalidad: zona?.localidad ? String(zona.localidad.idLocalidad) : '',
    idZona: zona ? String(zona.idZona) : '',
  }
}

// Las mismas reglas que el registro (están en reglas.ts)
export function validar(f: FormularioCliente): Errores<FormularioCliente> {
  return { ...validarContacto(f), ...validarDomicilio(f) }
}

// Lo que se manda al back (PATCH /cliente/:id)
export function paraEnviar(f: FormularioCliente): CambiosPerfilCliente {
  return {
    nombre: f.nombre.trim(),
    apellido: f.apellido.trim(),
    correo: f.correo.trim(),
    telefono: f.telefono,
    calle: f.calle.trim(),
    altura: Number(f.altura),
    // Vacío = se borra (una casa no tiene piso ni depto)
    piso: f.piso.trim() || null,
    depto: f.depto.trim() || null,
    idZonaResidencia: Number(f.idZona),
  }
}

// "Centro, Rosario, Santa Fe"
export function textoUbicacion(p: PerfilCliente): string {
  const z = p.zonaResidencia
  return z ? [z.nombreZona, z.localidad?.nombreLocalidad, z.localidad?.provincia?.nombreProvincia].filter(Boolean).join(', ') : 'Sin zona'
}
