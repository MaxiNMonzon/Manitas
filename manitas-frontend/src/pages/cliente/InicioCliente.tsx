import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PerfilProfesionalDialog from '../../components/profesional/PerfilProfesionalDialog'
import SolicitarPresupuestoDialog from '../../components/solicitudes/SolicitarPresupuestoDialog'
import UrgenteDialog from '../../components/solicitudes/UrgenteDialog'
import NovedadesInicio from '../../components/NovedadesInicio'
import BuscadorInicio from '../../components/inicio/BuscadorInicio'
import CategoriasInicio from '../../components/inicio/CategoriasInicio'
import ProfesionalesCercanos from '../../components/inicio/ProfesionalesCercanos'
import PromosDelMes from '../../components/inicio/PromosDelMes'
import { buscarProfesionales, traerEspecialidades } from '../../api/profesionales'
import { traerUbicacionCliente } from '../../api/perfil'
import { traerPromocionesDelMes } from '../../api/promociones'
import { useCarga } from '../../hooks/useCarga'
import type { ProfesionalResumen } from '../../types'

const PROFESIONALES_VISIBLES = 10

// Pantalla principal del cliente: buscador, novedades, categorías, profesionales de su zona y promociones del mes
// (todo sale del back). Esta página solo trae los datos y abre los diálogos: cada parte está en components/inicio
export default function InicioCliente() {
  const navigate = useNavigate()
  const [perfilAbierto, setPerfilAbierto] = useState<ProfesionalResumen | null>(null)
  const [aSolicitar, setASolicitar] = useState<ProfesionalResumen | null>(null)
  const [urgenteAbierto, setUrgenteAbierto] = useState(false)

  const especialidades = useCarga('especialidades', traerEspecialidades)
  // Los que trabajan en la zona del cliente, los mejor calificados primero (la visita es en su casa)
  const ubicacion = useCarga('ubicacion-cliente', traerUbicacionCliente)
  const idZona = ubicacion.datos?.idZona ?? null
  const cercanos = useCarga(`cercanos-${idZona}-${ubicacion.cargando}`, async () => {
    if (ubicacion.cargando) return []
    const lista = await buscarProfesionales({ idZona })
    return lista.sort((a, b) => b.calificacion - a.calificacion).slice(0, PROFESIONALES_VISIBLES)
  })
  // CUU "Informar promociones bancarias del mes" (GET /promocion/del-mes)
  const promociones = useCarga('promociones-del-mes', traerPromocionesDelMes)

  // Después de pedir un presupuesto o una urgencia, va a "Mis solicitudes" con el aviso
  const irASolicitudes = (mensaje: string) => navigate('/app/solicitudes', { state: { mensaje } })

  return (
    <>
      <BuscadorInicio onUrgente={() => setUrgenteAbierto(true)} />

      {/* Novedades de sus solicitudes (el profesional confirmó, mandó presupuesto...): solo si hay */}
      <NovedadesInicio rol="cliente" sx={{ mt: 3 }} />

      <CategoriasInicio categorias={especialidades.datos ?? []} />
      <ProfesionalesCercanos profesionales={cercanos.datos ?? []} cargando={cercanos.cargando} onVerPerfil={setPerfilAbierto} />
      <PromosDelMes promos={promociones.datos ?? []} cargando={promociones.cargando} />

      <PerfilProfesionalDialog
        profesional={perfilAbierto}
        onClose={() => setPerfilAbierto(null)}
        onSolicitar={(p) => {
          setPerfilAbierto(null)
          setASolicitar(p)
        }}
      />
      <SolicitarPresupuestoDialog profesional={aSolicitar} onClose={() => setASolicitar(null)} onCreada={irASolicitudes} />
      <UrgenteDialog
        key={String(urgenteAbierto)}
        abierto={urgenteAbierto}
        especialidades={especialidades.datos ?? []}
        onClose={() => setUrgenteAbierto(false)}
        onCreada={irASolicitudes}
      />
    </>
  )
}
