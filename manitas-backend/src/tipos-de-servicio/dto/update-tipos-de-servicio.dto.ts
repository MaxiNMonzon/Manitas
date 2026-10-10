import { PartialType } from '@nestjs/swagger';
import { CreateTiposDeServicioDto } from './create-tipos-de-servicio.dto';

export class UpdateTiposDeServicioDto extends PartialType(CreateTiposDeServicioDto) {}

