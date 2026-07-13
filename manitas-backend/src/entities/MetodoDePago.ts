import { SolicitudDeServicio } from './SolicitudDeServicio';
import { Promocion } from './Promocion';
import { Cliente } from './Cliente';

export class MetodoDePago {
  idFormaPago: number;
  tipo: string;
  estado: string;
  solicituddeservicio: SolicitudDeServicio[];
  promocion: Promocion[];
  cliente: Cliente[];

  constructor(idFormaPago: number, tipo: string, estado: string) {
    this.idFormaPago = idFormaPago;
    this.tipo = tipo;
    this.estado = estado;
    this.solicituddeservicio = [];
    this.promocion = [];
    this.cliente = [];
  }
  agregarSolicitud(solicitud: SolicitudDeServicio): void {
    this.solicituddeservicio.push(solicitud);
  }

  agregarPromocion(promo: Promocion): void {
    this.promocion.push(promo);
  }

  agregarCliente(cli: Cliente): void {
    this.cliente.push(cli);
  }
}