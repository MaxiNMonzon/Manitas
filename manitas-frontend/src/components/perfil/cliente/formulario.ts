// El formulario de "Mi perfil" del cliente: de dónde sale, cómo se valida y qué se le manda al back.
// Son funciones puras (no dibujan nada).
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

// Mismas reglas que el registro (CreateClienteDto)
export function validar(f: FormularioCliente): Errores<FormularioCliente> {
  const e: Errores<FormularioCliente> = {}
  if (!f.nombre.trim()) e.nombre = 'Ingresá tu nombre'
  if (!f.apellido.trim()) e.apellido = 'Ingresá tu apellido'
  if (!/^\S+@\S+\.\S+$/.test(f.correo.trim())) e.correo = 'Ingresá un email válido'
  if (!/^\d{8,15}$/.test(f.telefono)) e.telefono = 'Ingresá solo números, con característica'
  if (!f.calle.trim()) e.calle = 'Ingresá la calle'
  if (!(Number(f.altura) > 0)) e.altura = 'Ingresá la altura'
  if (f.piso.length > 10) e.piso = 'Máximo 10 caracteres'
  if (f.depto.length > 10) e.depto = 'Máximo 10 caracteres'
  if (!f.idZona) e.idZona = 'Elegí tu zona'
  return e
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
