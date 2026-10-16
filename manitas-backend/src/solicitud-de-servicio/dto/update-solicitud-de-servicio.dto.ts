import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateSolicitudDeServicioDto } from './create-solicitud-de-servicio.dto';

// Solo se puede corregir la descripcion (el profesional, la especialidad y el turno no se cambian aca)
export class UpdateSolicitudDeServicioDto extends PartialType(OmitType(CreateSolicitudDeServicioDto, ['idProfesional', 'idEspecialidad', 'inicioTurno'])) {}