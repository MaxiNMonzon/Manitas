import { PartialType } from '@nestjs/mapped-types';
import { CreateTipoDeServicioDto } from './create-tipo-de-servicio.dto';

export class UpdateTipoDeServicioDto extends PartialType(CreateTipoDeServicioDto) {}

