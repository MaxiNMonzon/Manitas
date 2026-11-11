import { useState } from 'react'

export type Errores<F> = Partial<Record<keyof F, string>>

// Lo que comparten "Mi perfil" del cliente y del profesional: se ve todo en solo lectura y con
// "Editar perfil" se pasa a un formulario. form = null es "viendo"; con datos es "editando".
// Los errores se muestran recién después del primer intento de guardar.
export function useEdicionPerfil<F>(validar: (f: F) => Errores<F>) {
  const [form, setForm] = useState<F | null>(null)
  const [intentoGuardar, setIntentoGuardar] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const editando = form !== null
  const errores: Errores<F> = form && intentoGuardar ? validar(form) : {}

  const empezar = (inicial: F) => {
    setForm(inicial)
    setIntentoGuardar(false)
    setError(null)
  }

  const cambiar = (cambios: Partial<F>) => setForm((f) => (f ? { ...f, ...cambios } : f))

  // Valida y, si está todo bien, manda los cambios. Si el back responde un error
  // (ej: "Ese correo ya está registrado en otra cuenta"), se muestra y sigue editando
  const guardar = async (enviar: (f: F) => Promise<void>) => {
    if (!form) return
    setIntentoGuardar(true)
    setError(null)
    if (Object.keys(validar(form)).length > 0) return
    setGuardando(true)
    try {
      await enviar(form)
      setForm(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar')
    } finally {
      setGuardando(false)
    }
  }

  return { form, setForm, editando, errores, intentoGuardar, guardando, error, empezar, cancelar: () => setForm(null), cambiar, guardar }
}