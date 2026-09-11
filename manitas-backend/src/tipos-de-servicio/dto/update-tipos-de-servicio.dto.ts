import { PartialType } from '@nestjs/mapped-types';
import { CreateTiposDeServicioDto } from './create-tipos-de-servicio.dto';

export class UpdateTiposDeServicioDto extends PartialType(CreateTiposDeServicioDto) {}
