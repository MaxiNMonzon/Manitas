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

const texto = (v: unknown) => (v === null || v === undefined || v === '' ? '—' : String(v))
const de = (fila: Fila, ...ruta: string[]): unknown =>
  ruta.reduce<unknown>((actual, clave) => (actual && typeof actual === 'object' ? (actual as Fila)[clave] : undefined), fila)
const lista = (v: unknown): Fila[] => (Array.isArray(v) ? (v as Fila[]) : [])
const fecha = (v: unknown) => (v ? new Date(`${String(v).slice(0, 10)}T00:00:00`).toLocaleDateString('es-AR') : '—')

// ---------- Referencias (listas de opciones) ----------

const especialidad: Referencia = { path: '/especialidad', id: 'idEspecialidad', etiqueta: (f) => texto(f.nombreEspecialidad) }
const provincia: Referencia = { path: '/provincia', id: 'idProvincia', etiqueta: (f) => texto(f.nombreProvincia) }
const localidad: Referencia = {
  path: '/localidad',
  id: 'idLocalidad',
  etiqueta: (f) => `${texto(f.nombreLocalidad)}${de(f, 'provincia', 'nombreProvincia') ? ` (${texto(de(f, 'provincia', 'nombreProvincia'))})` : ''}`,
}
const metodoDePago: Referencia = { path: '/metodo-de-pago', id: 'idFormaPago', etiqueta: (f) => texto(f.tipo) }
const promocion: Referencia = { path: '/promocion', id: 'idPromocion', etiqueta: (f) => `${texto(f.codigo)} (${texto(f.porcentajeDescuento)}%)` }

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
      { label: 'Nombre', valor: (f) => texto(f.nombreEspecialidad) },
      { label: 'Descripción', valor: (f) => texto(f.descripcionEspecialidad) },
      { label: 'Palabras clave', valor: (f) => texto(f.palabrasClave) },
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
      { label: 'Nombre', valor: (f) => texto(f.nombreServicio) },
      { label: 'Especialidad', valor: (f) => texto(de(f, 'especialidad', 'nombreEspecialidad')) },
    ],
    campos: [
      { clave: 'nombreServicio', label: 'Nombre', tipo: 'texto', requerido: true },
      { clave: 'descripcionServicio', label: 'Descripción', tipo: 'textoLargo', requerido: true },
      { clave: 'idEspecialidad', label: 'Especialidad', tipo: 'referencia', requerido: true, referencia: especialidad, desdeFila: (f) => de(f, 'especialidad', 'idEspecialidad') },
    ],
    filtro: { param: 'especialidad', label: 'Especialidad', referencia: especialidad },
    detalle: (f) => [
      ['Descripción', texto(f.descripcionServicio)],
      ['Especialidad', texto(de(f, 'especialidad', 'nombreEspecialidad'))],
      ['Sobre la especialidad', texto(de(f, 'especialidad', 'descripcionEspecialidad'))],
    ],
  },
  {
    clave: 'provincias',
    titulo: 'Provincias',
    singular: 'provincia',
    descripcion: 'Se cargan solas con el seed de Georef; acá se pueden corregir.',
    path: '/provincia',
    id: 'idProvincia',
    columnas: [{ label: 'Nombre', valor: (f) => texto(f.nombreProvincia) }],
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
      { label: 'Nombre', valor: (f) => texto(f.nombreLocalidad) },
      { label: 'Código postal', valor: (f) => texto(f.codigoPostal) },
      { label: 'Provincia', valor: (f) => texto(de(f, 'provincia', 'nombreProvincia')) },
    ],
    campos: [
      { clave: 'nombreLocalidad', label: 'Nombre', tipo: 'texto', requerido: true },
      { clave: 'codigoPostal', label: 'Código postal', tipo: 'texto' },
      { clave: 'idProvincia', label: 'Provincia', tipo: 'referencia', requerido: true, referencia: provincia, desdeFila: (f) => de(f, 'provincia', 'idProvincia') },
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
      { label: 'Nombre', valor: (f) => texto(f.nombreZona) },
      { label: 'Localidad', valor: (f) => texto(de(f, 'localidad', 'nombreLocalidad')) },
    ],
    campos: [
      { clave: 'nombreZona', label: 'Nombre', tipo: 'texto', requerido: true },
      { clave: 'idLocalidad', label: 'Localidad', tipo: 'referencia', requerido: true, referencia: localidad, desdeFila: (f) => de(f, 'localidad', 'idLocalidad') },
    ],
    filtro: { param: 'localidad', label: 'Localidad', referencia: localidad },
    detalle: (f) => [
      ['Localidad', texto(de(f, 'localidad', 'nombreLocalidad'))],
      ['Código postal', texto(de(f, 'localidad', 'codigoPostal'))],
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
      { label: 'Tipo', valor: (f) => texto(f.tipo) },
      { label: 'Estado', valor: (f) => texto(f.estado) },
      { label: 'Promociones', valor: (f) => String(lista(f.promociones).length) },
    ],
    campos: [
      { clave: 'tipo', label: 'Tipo', tipo: 'texto', requerido: true, ayuda: 'Ej: Visa crédito Banco Nación' },
      { clave: 'estado', label: 'Estado', tipo: 'opciones', requerido: true, opciones: ['activo', 'inactivo'] },
      { clave: 'idsPromociones', label: 'Promociones', tipo: 'referencias', referencia: promocion, desdeFila: (f) => lista(f.promociones).map((p) => p.idPromocion) },
    ],
    detalle: (f) => [
      ['Tipo', texto(f.tipo)],
      ['Estado', texto(f.estado)],
      ['Promociones', lista(f.promociones).map((p) => `${texto(p.codigo)}: ${texto(p.porcentajeDescuento)}% (${fecha(p.fechaInicioVigencia)} al ${fecha(p.fechaFinVigencia)})`).join(' · ') || 'Ninguna'],
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
      { label: 'Código', valor: (f) => texto(f.codigo) },
      { label: 'Descuento', valor: (f) => `${texto(f.porcentajeDescuento)}%` },
      { label: 'Vigencia', valor: (f) => `${fecha(f.fechaInicioVigencia)} al ${fecha(f.fechaFinVigencia)}` },
    ],
    campos: [
      { clave: 'codigo', label: 'Código', tipo: 'texto', requerido: true, ayuda: 'Ej: NACION20' },
      { clave: 'descripcion', label: 'Descripción', tipo: 'textoLargo', requerido: true, ayuda: 'Condiciones y tope de reintegro' },
      { clave: 'porcentajeDescuento', label: 'Descuento (%)', tipo: 'numero', requerido: true },
      { clave: 'fechaInicioVigencia', label: 'Vigente desde', tipo: 'fecha', requerido: true, desdeFila: (f) => String(f.fechaInicioVigencia ?? '').slice(0, 10) },
      { clave: 'fechaFinVigencia', label: 'Vigente hasta', tipo: 'fecha', requerido: true, desdeFila: (f) => String(f.fechaFinVigencia ?? '').slice(0, 10) },
      { clave: 'idsMetodosPago', label: 'Métodos de pago', tipo: 'referencias', referencia: metodoDePago, desdeFila: (f) => lista(f.metodosPago).map((m) => m.idFormaPago) },
    ],
    detalle: (f) => [
      ['Descripción', texto(f.descripcion)],
      ['Métodos de pago', lista(f.metodosPago).map((m) => `${texto(m.tipo)} (${texto(m.estado)})`).join(' · ') || 'Ninguno'],
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
      { label: 'Nombre', valor: (f) => `${texto(f.nombre)} ${texto(f.apellido)}` },
      { label: 'Email', valor: (f) => texto(f.correo) },
      { label: 'Zona', valor: (f) => texto(de(f, 'zonaResidencia', 'nombreZona')) },
    ],
    campos: [],
    detalle: (f) => [
      ['DNI', texto(f.dni)],
      ['Teléfono', texto(f.telefono)],
      ['Dirección', `${texto(f.calle)} ${texto(f.altura)}${f.piso ? `, piso ${texto(f.piso)}` : ''}${f.depto ? `, depto ${texto(f.depto)}` : ''}`],
      ['Zona', texto(de(f, 'zonaResidencia', 'nombreZona'))],
      ['Localidad', texto(de(f, 'zonaResidencia', 'localidad', 'nombreLocalidad'))],
      ['Provincia', texto(de(f, 'zonaResidencia', 'localidad', 'provincia', 'nombreProvincia'))],
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
      { label: 'Nombre', valor: (f) => `${texto(f.nombre)} ${texto(f.apellido)}` },
      { label: 'Especialidades', valor: (f) => lista(f.especialidades).map((e) => texto(e.nombreEspecialidad)).join(', ') || '—' },
      { label: 'Zonas', valor: (f) => lista(f.zonasDeCobertura).map((z) => texto(z.nombreZona)).join(', ') || '—' },
    ],
    campos: [],
    filtro: { param: 'especialidad', label: 'Especialidad', referencia: especialidad },
    detalle: (f) => [
      ['Email', texto(f.correo)],
      ['Teléfono', texto(f.telefono)],
      ['Costo de visita', f.costoVisita ? `$ ${texto(f.costoVisita)}` : 'Sin cargo'],
      ['Sobre mí', texto(f.descripcion)],
    ],
  },
]

export const catalogoPorClave = (clave: string | undefined) => catalogos.find((c) => c.clave === clave)