import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateSolicitudDeServicioDto } from './create-solicitud-de-servicio.dto';

// Solo se puede corregir la descripcion, el profesional no se cambia
export class UpdateSolicitudDeServicioDto extends PartialType(OmitType(CreateSolicitudDeServicioDto, ['idProfesional'])) {}
