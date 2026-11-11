import { useState } from 'react'
import Alert from '@mui/material/Alert'
import Chip from '@mui/material/Chip'
import Grid from '@mui/material/Grid'
import MenuItem from '@mui/material/MenuItem'
import Rating from '@mui/material/Rating'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useAuth } from '../../auth/useAuth'
import { guardarPerfilProfesional, traerPerfilProfesional } from '../../api/perfil'
import { traerMiCalificacion } from '../../api/solicitudes'
import { useCarga } from '../../hooks/useCarga'
import AvisoFlotante, { type Aviso } from '../../components/AvisoFlotante'
import EncabezadoPerfil, { BotonesEdicion } from '../../components/perfil/EncabezadoPerfil'
import SeccionDatosPersonales from '../../components/perfil/SeccionDatosPersonales'
import SeccionCuenta from '../../components/perfil/SeccionCuenta'
import SeccionMiTrabajo from '../../components/perfil/profesional/SeccionMiTrabajo'
import SeccionDatosCobro from '../../components/perfil/profesional/SeccionDatosCobro'
import { useEdicionPerfil } from '../../components/perfil/useEdicionPerfil'
import { useCatalogos } from '../../components/perfil/profesional/useCatalogos'
import { conEspecialidades, desdePerfil, paraEnviar, validar } from '../../components/perfil/profesional/formulario'

// Pestaña "Mi perfil" del profesional (boceto "Mi perfil"): se ve todo y con "Editar perfil" se puede cambiar.
// Esta página solo arma las secciones: el formulario (validar, qué se manda) está en formulario.ts,
// las listas para elegir en useCatalogos y el modo editar/guardar en useEdicionPerfil
export default function PerfilProfesional() {
  const { sesion, actualizarCorreo } = useAuth()
  const perfil = useCarga('mi-perfil', traerPerfilProfesional)
  const calificacion = useCarga('mi-calificacion', traerMiCalificacion)
  const edicion = useEdicionPerfil(validar)
  const catalogos = useCatalogos(edicion.form)
  const [aviso, setAviso] = useState<Aviso | null>(null)

  if (perfil.cargando) {
    return (
      <Stack spacing={2}>
        <Skeleton variant="rounded" height={150} />
        <Skeleton variant="rounded" height={260} />
        <Skeleton variant="rounded" height={260} />
      </Stack>
    )
  }
  if (!perfil.datos) {
    return <Alert severity="error">{perfil.error ?? 'No se pudo cargar tu perfil'}</Alert>
  }

  const p = perfil.datos
  const { editando, errores, cambiar } = edicion
  const datos = edicion.form ?? desdePerfil(p)

  const guardar = () =>
    edicion.guardar(async (form) => {
      const cambios = paraEnviar(form)
      await guardarPerfilProfesional(p.idUsuario, cambios)
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

      {/* Encabezado: iniciales, nombre, especialidades y calificación */}
      <EncabezadoPerfil nombre={p.nombre} apellido={p.apellido} tamañoAvatar={96} acciones={botones}>
        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', my: 1, justifyContent: { xs: 'center', sm: 'flex-start' } }}>
          {p.especialidades.map((e) => (
            <Chip key={e.idEspecialidad} size="small" color="primary" label={e.nombreEspecialidad} />
          ))}
          {p.matriculas.length > 0 && (
            <Tooltip title={p.matriculas.map((m) => `${m.especialidad.nombreEspecialidad}: ${m.numero}`).join(' · ')}>
              <Chip size="small" variant="outlined" label={p.matriculas.length === 1 ? `Matrícula ${p.matriculas[0].numero}` : `${p.matriculas.length} matrículas`} />
            </Tooltip>
          )}
        </Stack>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: { xs: 'center', sm: 'flex-start' } }}>
          <Rating value={calificacion.datos?.promedio ?? 0} precision={0.1} readOnly size="small" />
          <Typography variant="body2" color="text.secondary">
            {calificacion.datos?.promedio != null
              ? `${calificacion.datos.promedio.toLocaleString('es-AR')} · ${calificacion.datos.cantidad} calificaciones`
              : 'Todavía sin calificaciones'}
          </Typography>
        </Stack>
      </EncabezadoPerfil>

      {editando && edicion.error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {edicion.error}
        </Alert>
      )}
      {editando && catalogos.error && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          No se pudieron cargar las listas para elegir: {catalogos.error}
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
          ayudaTelefono="Con característica. Tus clientes te escriben por WhatsApp a este número"
        >
          {/* Solo al editar: sirven para buscar zonas de trabajo nuevas (no se guardan) */}
          {editando && (
            <>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  select
                  fullWidth
                  label="Provincia"
                  value={datos.idProvincia}
                  onChange={(e) => cambiar({ idProvincia: e.target.value, idLocalidad: '' })}
                  helperText="Para buscar zonas de trabajo nuevas"
                >
                  {catalogos.provincias.map((pr) => (
                    <MenuItem key={pr.idProvincia} value={String(pr.idProvincia)}>
                      {pr.nombreProvincia}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField select fullWidth label="Localidad" value={datos.idLocalidad} disabled={!datos.idProvincia} onChange={(e) => cambiar({ idLocalidad: e.target.value })}>
                  {catalogos.localidades.map((l) => (
                    <MenuItem key={l.idLocalidad} value={String(l.idLocalidad)}>
                      {l.nombreLocalidad}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </>
          )}
        </SeccionDatosPersonales>

        <SeccionMiTrabajo
          datos={datos}
          errores={errores}
          editando={editando}
          intentoGuardar={edicion.intentoGuardar}
          cambiar={cambiar}
          onCambiarEspecialidades={(elegidas) => edicion.setForm((f) => f && conEspecialidades(f, elegidas))}
          opciones={{ especialidades: catalogos.opcionesEspecialidades, habilidades: catalogos.opcionesHabilidades, zonas: catalogos.opcionesZonas }}
          matriculasGuardadas={p.matriculas}
        />

        <SeccionDatosCobro datos={datos} errores={errores} editando={editando} cambiar={cambiar} />

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
