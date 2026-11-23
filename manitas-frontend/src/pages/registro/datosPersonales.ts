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
export function validarDatosPersonales(datos: DatosPersonales): Partial<Record<keyof DatosPersonales, string>> {
  const errores: Partial<Record<keyof DatosPersonales, string>> = validarContacto(datos)
  if (!/^\d{7,8}$/.test(datos.dni)) errores.dni = 'Ingresá un DNI válido (7 u 8 números)'
  if (!datos.fechaNacimiento) errores.fechaNacimiento = 'Ingresá tu fecha de nacimiento'
  if (datos.contraseña.length < 8) errores.contraseña = 'Mínimo 8 caracteres'
  if (datos.confirmarContraseña !== datos.contraseña) errores.confirmarContraseña = 'Las contraseñas no coinciden'
  return errores
}

// Datos personales listos para mandar al backend
export function datosPersonalesParaEnviar(datos: DatosPersonales) {
  return {
    dni: Number(datos.dni),
    nombre: datos.nombre.trim(),
    apellido: datos.apellido.trim(),
    fechaNacimiento: datos.fechaNacimiento,
    correo: datos.correo.trim(),
    telefono: datos.telefono,
    contraseña: datos.contraseña,
  }
}
