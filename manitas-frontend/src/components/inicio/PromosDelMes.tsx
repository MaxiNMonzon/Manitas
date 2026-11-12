import { useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Link from '@mui/material/Link'
import Typography from '@mui/material/Typography'
import Seccion from '../Seccion'
import CondicionesPromoDialog from '../CondicionesPromoDialog'
import TarjetaPromo from '../promociones/TarjetaPromo'
import type { PromoBancaria } from '../../types'

// "Promos bancarias del mes" en el Inicio del cliente: las 3 mejores y el link a todas
// (CUU "Informar promociones bancarias del mes", GET /promocion/del-mes)
export default function PromosDelMes({ promos, cargando }: { promos: PromoBancaria[]; cargando: boolean }) {
  const [condiciones, setCondiciones] = useState<PromoBancaria | null>(null)

  return (
    <Seccion titulo="Promos bancarias del mes">
      {!cargando && promos.length === 0 && <Typography color="text.secondary">Este mes no hay promociones vigentes.</Typography>}
      <Grid container spacing={2}>
        {promos.slice(0, 3).map((promo) => (
          <Grid key={promo.idPromocion} size={{ xs: 12, sm: 4 }}>
            <TarjetaPromo promo={promo} tamañoAvatar={28} onVerCondiciones={() => setCondiciones(promo)} />
          </Grid>
        ))}
      </Grid>
      <Box sx={{ textAlign: 'center', mt: 1.5 }}>
        <Link component={RouterLink} to="/app/promociones">
          Ver todas las promociones bancarias
        </Link>
      </Box>
      <CondicionesPromoDialog promo={condiciones} onCerrar={() => setCondiciones(null)} />
    </Seccion>
  )
}