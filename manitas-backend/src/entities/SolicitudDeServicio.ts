import { Profesional } from './Profesional';
import { Cliente } from './Cliente';
import { MetodoDePago } from './MetodoDePago';

export class SolicitudDeServicio {
  idSolicitud: number;
  fechaSolicitud: Date;
  estadoServicio: string;
  costoEstimativo: number;
  costoFinal: number;
  duracionEstimada: number;
  visitaPrevia: Date;
  calificacionServicio: number;
  reseñaServicio: string;
  metodoDePago: MetodoDePago;
  profesional: Profesional;
  cliente: Cliente;

  constructor(idSolicitud: number, fechaSolicitud: Date, estadoServicio: string, costoEstimativo: number, costoFinal: number, duracionEstimada: number, visitaPrevia: Date, calificacionServicio: number, reseñaServicio: string, metodoDePago: MetodoDePago, profesional: Profesional, cliente: Cliente) {
    this.idSolicitud = idSolicitud;
    this.fechaSolicitud = fechaSolicitud;
    this.estadoServicio = estadoServicio;
    this.costoEstimativo = costoEstimativo;
    this.costoFinal = costoFinal;
    this.duracionEstimada = duracionEstimada;
    this.visitaPrevia = visitaPrevia;
    this.calificacionServicio = calificacionServicio;
    this.reseñaServicio = reseñaServicio;
    this.metodoDePago = metodoDePago;
    this.profesional = profesional;
    this.cliente = cliente;
  }
}