import { useState } from 'react'
import Alert from '@mui/material/Alert'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import PlaceIcon from '@mui/icons-material/Place'
import { useAuth } from '../../auth/useAuth'
import { guardarPerfilCliente, traerPerfilCliente } from '../../api/perfil'
import { useCarga } from '../../hooks/useCarga'
import AvisoFlotante, { type Aviso } from '../../components/AvisoFlotante'
import EncabezadoPerfil, { BotonesEdicion } from '../../components/perfil/EncabezadoPerfil'
import SeccionDatosPersonales from '../../components/perfil/SeccionDatosPersonales'
import SeccionCuenta from '../../components/perfil/SeccionCuenta'
import SeccionDomicilio from '../../components/perfil/cliente/SeccionDomicilio'
import { useEdicionPerfil } from '../../components/perfil/useEdicionPerfil'
import { desdePerfil, paraEnviar, textoUbicacion, validar } from '../../components/perfil/cliente/formulario'

// Pestaña "Mi perfil" del cliente: se ve todo y con "Editar perfil" se puede cambiar.
// La dirección es importante: es donde van los profesionales, y la zona define a quiénes ve cerca.
// Esta página solo arma las secciones: el formulario está en formulario.ts y el modo editar/guardar en useEdicionPerfil
export default function PerfilCliente() {
  const { sesion, actualizarCorreo } = useAuth()
  const perfil = useCarga('mi-perfil-cliente', traerPerfilCliente)
  const edicion = useEdicionPerfil(validar)
  const [aviso, setAviso] = useState<Aviso | null>(null)

  if (perfil.cargando) {
    return (
      <Stack spacing={2}>
        <Skeleton variant="rounded" height={130} />
        <Skeleton variant="rounded" height={240} />
        <Skeleton variant="rounded" height={200} />
      </Stack>
    )
  }
  if (!perfil.datos) {
    return <Alert severity="error">{perfil.error ?? 'No se pudo cargar tu perfil'}</Alert>
  }

  const p = perfil.datos
  const { editando, errores, cambiar } = edicion
  const datos = edicion.form ?? desdePerfil(p)
  const ubicacion = textoUbicacion(p)

  const guardar = () =>
    edicion.guardar(async (form) => {
      const cambios = paraEnviar(form)
      await guardarPerfilCliente(p.idUsuario, cambios)
      // Si cambió el email, la sesión lo muestra actualizado (el próximo login es con el nuevo)
      const cambioCorreo = cambios.correo !== p.correo
      if (cambioCorreo && sesion) actualizarCorreo(cambios.correo)
      setAviso({ texto: cambioCorreo ? 'Perfil actualizado. La próxima vez entrá con tu email nuevo' : 'Perfil actualizado', tipo: 'success' })
      perfil.recargar()
    })

  const botones = (
    <BotonesEdicion
      editando={editando}
      guardando={edicion.guardando}
      onEditar={() => edicion.empezar(desdePerfil(p))}
      onCancelar={edicion.cancelar}
      onGuardar={guardar}
    />
  )

  return (
    <>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
        Mi perfil
      </Typography>

      {/* Encabezado: iniciales, nombre, email y dónde vive */}
      <EncabezadoPerfil nombre={p.nombre} apellido={p.apellido} tamañoAvatar={88} acciones={botones}>
        <Typography color="text.secondary">{p.correo}</Typography>
        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', color: 'text.secondary', mt: 0.5, justifyContent: { xs: 'center', sm: 'flex-start' } }}>
          <PlaceIcon fontSize="small" />
          <Typography variant="body2">{ubicacion}</Typography>
        </Stack>
      </EncabezadoPerfil>

      {/* Ej: "Ese correo ya está registrado en otra cuenta" */}
      {editando && edicion.error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {edicion.error}
        </Alert>
      )}

      <Stack spacing={2}>
        <SeccionDatosPersonales
          datos={datos}
          errores={errores}
          editando={editando}
          cambiar={cambiar}
          dni={p.dni}
          fechaNacimiento={p.fechaNacimiento}
          ayudaTelefono="Con característica. El profesional te escribe por WhatsApp a este número"
        />

        <SeccionDomicilio datos={datos} errores={errores} editando={editando} cambiar={cambiar} zonaActual={p.zonaResidencia} ubicacion={ubicacion} />

        {editando ? (
          <Stack direction="row" sx={{ justifyContent: 'flex-end' }}>
            {botones}
          </Stack>
        ) : (
          <SeccionCuenta idUsuario={p.idUsuario} onContraseñaCambiada={() => setAviso({ texto: 'Contraseña cambiada', tipo: 'success' })} />
        )}
      </Stack>

      <AvisoFlotante aviso={aviso} onClose={() => setAviso(null)} duracion={4000} />
    </>
  )
}