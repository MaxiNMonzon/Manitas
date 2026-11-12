// Campos y validaciones comunes a los registros de cliente y profesional
// (mismas reglas que CreateUsuarioDto del backend).
import { validarContacto } from '../../components/perfil/reglas'

export const datosPersonalesVacios = {
  dni: '',
  fechaNacimiento: '',
  nombre: '',
  apellido: '',
  correo: '',
  telefono: '',
  contraseña: '',
  confirmarContraseña: '',
}

export type DatosPersonales = typeof datosPersonalesVacios

// Nombre, apellido, email y teléfono con las mismas reglas que "Mi perfil" (reglas.ts);
// DNI, fecha de nacimiento y contraseña solo se cargan al registrarse
export function validarDatosPersonales(c: DatosPersonales): Partial<Record<keyof DatosPersonales, string>> {
  const e: Partial<Record<keyof DatosPersonales, string>> = validarContacto(c)
  if (!/^\d{7,8}$/.test(c.dni)) e.dni = 'Ingresá un DNI válido (7 u 8 números)'
  if (!c.fechaNacimiento) e.fechaNacimiento = 'Ingresá tu fecha de nacimiento'
  if (c.contraseña.length < 8) e.contraseña = 'Mínimo 8 caracteres'
  if (c.confirmarContraseña !== c.contraseña) e.confirmarContraseña = 'Las contraseñas no coinciden'
  return e
}

// Datos personales listos para mandar al backend
export function datosPersonalesParaEnviar(c: DatosPersonales) {
  return {
    dni: Number(c.dni),
    nombre: c.nombre.trim(),
    apellido: c.apellido.trim(),
    fechaNacimiento: c.fechaNacimiento,
    correo: c.correo.trim(),
    telefono: c.telefono,
    contraseña: c.contraseña,
  }
}