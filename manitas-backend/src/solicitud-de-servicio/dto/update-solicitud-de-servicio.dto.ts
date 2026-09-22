import { PartialType } from '@nestjs/mapped-types';
import { CreateSolicitudDeServicioDto } from './create-solicitud-de-servicio.dto';

export class UpdateSolicitudDeServicioDto extends PartialType(CreateSolicitudDeServicioDto) {}