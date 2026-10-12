import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateSolicitudDeServicioDto } from './create-solicitud-de-servicio.dto';

// Solo se puede corregir la descripcion, el profesional y la especialidad no se cambian
export class UpdateSolicitudDeServicioDto extends PartialType(OmitType(CreateSolicitudDeServicioDto, ['idProfesional', 'idEspecialidad'])) {}
