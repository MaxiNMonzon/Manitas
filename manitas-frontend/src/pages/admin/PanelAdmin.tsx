import type { ReactElement } from 'react'
import { useNavigate } from 'react-router-dom'
import ButtonBase from '@mui/material/ButtonBase'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import CategoryIcon from '@mui/icons-material/Category'
import BuildIcon from '@mui/icons-material/Build'
import MapIcon from '@mui/icons-material/Map'
import LocationCityIcon from '@mui/icons-material/LocationCity'
import PlaceIcon from '@mui/icons-material/Place'
import CreditCardIcon from '@mui/icons-material/CreditCard'
import LocalOfferIcon from '@mui/icons-material/LocalOffer'
import PeopleIcon from '@mui/icons-material/People'
import EngineeringIcon from '@mui/icons-material/Engineering'
import { catalogos } from './catalogos'

const iconos: Record<string, ReactElement> = {
  especialidades: <CategoryIcon />,
  'tipos-de-servicio': <BuildIcon />,
  provincias: <MapIcon />,
  localidades: <LocationCityIcon />,
  zonas: <PlaceIcon />,
  'metodos-de-pago': <CreditCardIcon />,
  promociones: <LocalOfferIcon />,
  clientes: <PeopleIcon />,
  profesionales: <EngineeringIcon />,
}

// Inicio del administrador: acceso a cada catálogo (los CRUD de las clases de negocio) y a los usuarios
export default function PanelAdmin() {
  const navigate = useNavigate()
  return (
    <>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
        Panel de administración
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Los catálogos que usa la app. Tocá uno para ver el listado, filtrarlo, ver el detalle y agregar, editar o dar de baja.
      </Typography>
      <Grid container spacing={2}>
        {catalogos.map((c) => (
          <Grid key={c.clave} size={{ xs: 12, sm: 6, md: 4 }}>
            <ButtonBase
              onClick={() => navigate(`/app/catalogos/${c.clave}`)}
              sx={{
                width: '100%',
                height: '100%',
                display: 'block',
                textAlign: 'left',
                p: 2,
                borderRadius: 2,
                border: 1,
                borderColor: 'divider',
                bgcolor: 'background.paper',
                '&:hover': { borderColor: 'primary.main', boxShadow: 2 },
              }}
            >
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', color: 'primary.main', mb: 0.5 }}>
                {iconos[c.clave]}
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  {c.titulo}
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                {c.descripcion}
              </Typography>
            </ButtonBase>
          </Grid>
        ))}
      </Grid>
    </>
  )
}
