import { OmitType } from '@nestjs/swagger';
import { CreateSolicitudDeServicioDto } from './create-solicitud-de-servicio.dto';

// Igual que una solicitud normal pero sin profesional ni turno: el sistema se la muestra
// a todos los que hacen esa especialidad en la zona del cliente (es para ahora, no usa turnos)
export class CreateUrgenteDto extends OmitType(CreateSolicitudDeServicioDto, ['idProfesional', 'inicioTurno']) {}
