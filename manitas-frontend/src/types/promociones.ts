// Promociones bancarias del mes

// Una promoción bancaria del mes (GET /promocion/del-mes)
export interface PromoBancaria {
  idPromocion: number
  banco: string
  titulo: string
  detalle: string
  color: string // color de la marca del banco, para el ícono
  // Para "Ver condiciones": el texto de la promo, con qué tarjetas y hasta cuándo
  condiciones?: string
  tarjetas?: string[]
  vigencia?: string
}
