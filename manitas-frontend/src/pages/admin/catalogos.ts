// Configuración de cada catálogo del panel de administración: qué endpoint usa, qué columnas se ven
// en el listado, por qué se puede filtrar y qué campos tiene el formulario de alta/edición.
// La pantalla (CatalogoAdmin) es una sola y se arma con esta configuración.
import type { Fila } from '../../api/catalogos'

// Un catálogo que sirve como lista de opciones (ej: elegir la especialidad de un tipo de servicio)
export interface Referencia {
  path: string
  id: string
  etiqueta: (fila: Fila) => string
}

export interface Campo {
  clave: string // nombre del campo en el DTO del back
  label: string
  tipo: 'texto' | 'textoLargo' | 'numero' | 'fecha' | 'opciones' | 'referencia' | 'referencias'
  requerido?: boolean
  ayuda?: string
  opciones?: string[] // tipo 'opciones'
  referencia?: Referencia // tipo 'referencia' (un id) y 'referencias' (varios ids)
  // Valor inicial al editar, sacado de la fila (ej: la especialidad de un tipo de servicio)
  desdeFila?: (fila: Fila) => unknown
}

export interface Columna {
  label: string
  valor: (fila: Fila) => string
}

export interface Catalogo {
  clave: string // parte de la URL: /app/catalogos/<clave>
  titulo: string
  singular: string
  descripcion: string
  path: string // endpoint del back
  id: string // nombre del id en la fila
  columnas: Columna[]
  campos: Campo[]
  // Filtro del listado que resuelve el back (?param=id)
  filtro?: { param: string; label: string; referencia: Referencia }
  // Datos extra para el detalle (además de las columnas)
  detalle?: (fila: Fila) => [string, string][]
  soloLectura?: boolean
}

// ---------- Ayudas para leer las filas ----------

const texto = (valor: unknown) => (valor === null || valor === undefined || valor === '' ? '—' : String(valor))
const de = (fila: Fila, ...ruta: string[]): unknown =>
  ruta.reduce<unknown>((actual, clave) => (actual && typeof actual === 'object' ? (actual as Fila)[clave] : undefined), fila)
const lista = (valor: unknown): Fila[] => (Array.isArray(valor) ? (valor as Fila[]) : [])
const fecha = (valor: unknown) => (valor ? new Date(`${String(valor).slice(0, 10)}T00:00:00`).toLocaleDateString('es-AR') : '—')

// ---------- Referencias (listas de opciones) ----------

const especialidad: Referencia = { path: '/especialidad', id: 'idEspecialidad', etiqueta: (fila) => texto(fila.nombreEspecialidad) }
const provincia: Referencia = { path: '/provincia', id: 'idProvincia', etiqueta: (fila) => texto(fila.nombreProvincia) }
const localidad: Referencia = {
  path: '/localidad',
  id: 'idLocalidad',
  etiqueta: (fila) => `${texto(fila.nombreLocalidad)}${de(fila, 'provincia', 'nombreProvincia') ? ` (${texto(de(fila, 'provincia', 'nombreProvincia'))})` : ''}`,
}
const metodoDePago: Referencia = { path: '/metodo-de-pago', id: 'idFormaPago', etiqueta: (fila) => texto(fila.tipo) }
const promocion: Referencia = { path: '/promocion', id: 'idPromocion', etiqueta: (fila) => `${texto(fila.codigo)} (${texto(fila.porcentajeDescuento)}%)` }

// ---------- Catálogos ----------

export const catalogos: Catalogo[] = [
  {
    clave: 'especialidades',
    titulo: 'Especialidades',
    singular: 'especialidad',
    descripcion: 'Los oficios que se ofrecen (Plomería, Electricidad...). Los clientes buscan por especialidad.',
    path: '/especialidad',
    id: 'idEspecialidad',
    columnas: [
      { label: 'Nombre', valor: (fila) => texto(fila.nombreEspecialidad) },
      { label: 'Descripción', valor: (fila) => texto(fila.descripcionEspecialidad) },
      { label: 'Palabras clave', valor: (fila) => texto(fila.palabrasClave) },
    ],
    campos: [
      { clave: 'nombreEspecialidad', label: 'Nombre', tipo: 'texto', requerido: true },
      { clave: 'descripcionEspecialidad', label: 'Descripción', tipo: 'textoLargo', requerido: true },
      {
        clave: 'palabrasClave',
        label: 'Palabras clave',
        tipo: 'textoLargo',
        ayuda: 'Separadas por coma. Son las palabras con las que el cliente cuenta su problema (ej: caño, canilla, pérdida)',
      },
    ],
  },
  {
    clave: 'tipos-de-servicio',
    titulo: 'Tipos de servicio',
    singular: 'tipo de servicio',
    descripcion: 'Las habilidades de cada especialidad (ej: Plomería → Destapaciones). Los profesionales eligen las suyas.',
    path: '/tipos-de-servicio',
    id: 'idServicio',
    columnas: [
      { label: 'Nombre', valor: (fila) => texto(fila.nombreServicio) },
      { label: 'Especialidad', valor: (fila) => texto(de(fila, 'especialidad', 'nombreEspecialidad')) },
    ],
    campos: [
      { clave: 'nombreServicio', label: 'Nombre', tipo: 'texto', requerido: true },
      { clave: 'descripcionServicio', label: 'Descripción', tipo: 'textoLargo', requerido: true },
      { clave: 'idEspecialidad', label: 'Especialidad', tipo: 'referencia', requerido: true, referencia: especialidad, desdeFila: (fila) => de(fila, 'especialidad', 'idEspecialidad') },
    ],
    filtro: { param: 'especialidad', label: 'Especialidad', referencia: especialidad },
    detalle: (fila) => [
      ['Descripción', texto(fila.descripcionServicio)],
      ['Especialidad', texto(de(fila, 'especialidad', 'nombreEspecialidad'))],
      ['Sobre la especialidad', texto(de(fila, 'especialidad', 'descripcionEspecialidad'))],
    ],
  },
  {
    clave: 'provincias',
    titulo: 'Provincias',
    singular: 'provincia',
    descripcion: 'Se cargan solas con el seed de Georef; acá se pueden corregir.',
    path: '/provincia',
    id: 'idProvincia',
    columnas: [{ label: 'Nombre', valor: (fila) => texto(fila.nombreProvincia) }],
    campos: [{ clave: 'nombreProvincia', label: 'Nombre', tipo: 'texto', requerido: true }],
  },
  {
    clave: 'localidades',
    titulo: 'Localidades',
    singular: 'localidad',
    descripcion: 'Ciudades de cada provincia. Las zonas cuelgan de una localidad.',
    path: '/localidad',
    id: 'idLocalidad',
    columnas: [
      { label: 'Nombre', valor: (fila) => texto(fila.nombreLocalidad) },
      { label: 'Código postal', valor: (fila) => texto(fila.codigoPostal) },
      { label: 'Provincia', valor: (fila) => texto(de(fila, 'provincia', 'nombreProvincia')) },
    ],
    campos: [
      { clave: 'nombreLocalidad', label: 'Nombre', tipo: 'texto', requerido: true },
      { clave: 'codigoPostal', label: 'Código postal', tipo: 'texto' },
      { clave: 'idProvincia', label: 'Provincia', tipo: 'referencia', requerido: true, referencia: provincia, desdeFila: (fila) => de(fila, 'provincia', 'idProvincia') },
    ],
    filtro: { param: 'provincia', label: 'Provincia', referencia: provincia },
  },
  {
    clave: 'zonas',
    titulo: 'Zonas',
    singular: 'zona',
    descripcion: 'Barrios o zonas de una localidad: los clientes viven en una y los profesionales trabajan en varias.',
    path: '/zona',
    id: 'idZona',
    columnas: [
      { label: 'Nombre', valor: (fila) => texto(fila.nombreZona) },
      { label: 'Localidad', valor: (fila) => texto(de(fila, 'localidad', 'nombreLocalidad')) },
    ],
    campos: [
      { clave: 'nombreZona', label: 'Nombre', tipo: 'texto', requerido: true },
      { clave: 'idLocalidad', label: 'Localidad', tipo: 'referencia', requerido: true, referencia: localidad, desdeFila: (fila) => de(fila, 'localidad', 'idLocalidad') },
    ],
    filtro: { param: 'localidad', label: 'Localidad', referencia: localidad },
    detalle: (fila) => [
      ['Localidad', texto(de(fila, 'localidad', 'nombreLocalidad'))],
      ['Código postal', texto(de(fila, 'localidad', 'codigoPostal'))],
    ],
  },
  {
    clave: 'metodos-de-pago',
    titulo: 'Métodos de pago',
    singular: 'método de pago',
    descripcion: 'Tarjetas y medios con los que pueden pagar los clientes. Solo los "activo" se pueden usar.',
    path: '/metodo-de-pago',
    id: 'idFormaPago',
    columnas: [
      { label: 'Tipo', valor: (fila) => texto(fila.tipo) },
      { label: 'Estado', valor: (fila) => texto(fila.estado) },
      { label: 'Promociones', valor: (fila) => String(lista(fila.promociones).length) },
    ],
    campos: [
      { clave: 'tipo', label: 'Tipo', tipo: 'texto', requerido: true, ayuda: 'Ej: Visa crédito Banco Nación' },
      { clave: 'estado', label: 'Estado', tipo: 'opciones', requerido: true, opciones: ['activo', 'inactivo'] },
      { clave: 'idsPromociones', label: 'Promociones', tipo: 'referencias', referencia: promocion, desdeFila: (fila) => lista(fila.promociones).map((unaPromocion) => unaPromocion.idPromocion) },
    ],
    detalle: (fila) => [
      ['Tipo', texto(fila.tipo)],
      ['Estado', texto(fila.estado)],
      ['Promociones', lista(fila.promociones).map((unaPromocion) => `${texto(unaPromocion.codigo)}: ${texto(unaPromocion.porcentajeDescuento)}% (${fecha(unaPromocion.fechaInicioVigencia)} al ${fecha(unaPromocion.fechaFinVigencia)})`).join(' · ') || 'Ninguna'],
    ],
  },
  {
    clave: 'promociones',
    titulo: 'Promociones bancarias',
    singular: 'promoción',
    descripcion: 'Reintegros por método de pago. Las vigentes en el mes se le muestran al cliente en Inicio.',
    path: '/promocion',
    id: 'idPromocion',
    columnas: [
      { label: 'Código', valor: (fila) => texto(fila.codigo) },
      { label: 'Descuento', valor: (fila) => `${texto(fila.porcentajeDescuento)}%` },
      { label: 'Vigencia', valor: (fila) => `${fecha(fila.fechaInicioVigencia)} al ${fecha(fila.fechaFinVigencia)}` },
    ],
    campos: [
      { clave: 'codigo', label: 'Código', tipo: 'texto', requerido: true, ayuda: 'Ej: NACION20' },
      { clave: 'descripcion', label: 'Descripción', tipo: 'textoLargo', requerido: true, ayuda: 'Condiciones y tope de reintegro' },
      { clave: 'porcentajeDescuento', label: 'Descuento (%)', tipo: 'numero', requerido: true },
      { clave: 'fechaInicioVigencia', label: 'Vigente desde', tipo: 'fecha', requerido: true, desdeFila: (fila) => String(fila.fechaInicioVigencia ?? '').slice(0, 10) },
      { clave: 'fechaFinVigencia', label: 'Vigente hasta', tipo: 'fecha', requerido: true, desdeFila: (fila) => String(fila.fechaFinVigencia ?? '').slice(0, 10) },
      { clave: 'idsMetodosPago', label: 'Métodos de pago', tipo: 'referencias', referencia: metodoDePago, desdeFila: (fila) => lista(fila.metodosPago).map((metodo) => metodo.idFormaPago) },
    ],
    detalle: (fila) => [
      ['Descripción', texto(fila.descripcion)],
      ['Métodos de pago', lista(fila.metodosPago).map((metodo) => `${texto(metodo.tipo)} (${texto(metodo.estado)})`).join(' · ') || 'Ninguno'],
    ],
  },
  {
    clave: 'clientes',
    titulo: 'Clientes',
    singular: 'cliente',
    descripcion: 'Las cuentas de clientes. Cada cliente edita o da de baja su cuenta desde "Mi perfil".',
    path: '/cliente',
    id: 'idUsuario',
    soloLectura: true,
    columnas: [
      { label: 'Nombre', valor: (fila) => `${texto(fila.nombre)} ${texto(fila.apellido)}` },
      { label: 'Email', valor: (fila) => texto(fila.correo) },
      { label: 'Zona', valor: (fila) => texto(de(fila, 'zonaResidencia', 'nombreZona')) },
    ],
    campos: [],
    detalle: (fila) => [
      ['DNI', texto(fila.dni)],
      ['Teléfono', texto(fila.telefono)],
      ['Dirección', `${texto(fila.calle)} ${texto(fila.altura)}${fila.piso ? `, piso ${texto(fila.piso)}` : ''}${fila.depto ? `, depto ${texto(fila.depto)}` : ''}`],
      ['Zona', texto(de(fila, 'zonaResidencia', 'nombreZona'))],
      ['Localidad', texto(de(fila, 'zonaResidencia', 'localidad', 'nombreLocalidad'))],
      ['Provincia', texto(de(fila, 'zonaResidencia', 'localidad', 'provincia', 'nombreProvincia'))],
    ],
  },
  {
    clave: 'profesionales',
    titulo: 'Profesionales',
    singular: 'profesional',
    descripcion: 'Las cuentas de profesionales. Cada profesional edita su perfil, oficios y zonas desde "Mi perfil".',
    path: '/profesional',
    id: 'idUsuario',
    soloLectura: true,
    columnas: [
      { label: 'Nombre', valor: (fila) => `${texto(fila.nombre)} ${texto(fila.apellido)}` },
      { label: 'Especialidades', valor: (fila) => lista(fila.especialidades).map((unaEspecialidad) => texto(unaEspecialidad.nombreEspecialidad)).join(', ') || '—' },
      { label: 'Zonas', valor: (fila) => lista(fila.zonasDeCobertura).map((zona) => texto(zona.nombreZona)).join(', ') || '—' },
    ],
    campos: [],
    filtro: { param: 'especialidad', label: 'Especialidad', referencia: especialidad },
    detalle: (fila) => [
      ['Email', texto(fila.correo)],
      ['Teléfono', texto(fila.telefono)],
      ['Costo de visita', fila.costoVisita ? `$ ${texto(fila.costoVisita)}` : 'Sin cargo'],
      ['Sobre mí', texto(fila.descripcion)],
    ],
  },
]

export const catalogoPorClave = (clave: string | undefined) => catalogos.find((catalogo) => catalogo.clave === clave)