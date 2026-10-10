// Campos y validaciones comunes a los registros de cliente y profesional
// (mismas reglas que CreateUsuarioDto del backend).

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

export function validarDatosPersonales(c: DatosPersonales): Partial<Record<keyof DatosPersonales, string>> {
  const e: Partial<Record<keyof DatosPersonales, string>> = {}
  if (!/^\d{7,8}$/.test(c.dni)) e.dni = 'Ingresá un DNI válido (7 u 8 números)'
  if (!c.fechaNacimiento) e.fechaNacimiento = 'Ingresá tu fecha de nacimiento'
  if (!c.nombre.trim()) e.nombre = 'Ingresá tu nombre'
  if (!c.apellido.trim()) e.apellido = 'Ingresá tu apellido'
  if (!/^\S+@\S+\.\S+$/.test(c.correo)) e.correo = 'Ingresá un email válido'
  if (!/^\d{8,15}$/.test(c.telefono)) e.telefono = 'Ingresá solo números, con característica'
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
