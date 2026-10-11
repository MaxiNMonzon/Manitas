import { PartialType } from '@nestjs/swagger';
import { CreateTipoDeServicioDto } from './create-tipo-de-servicio.dto';

export class UpdateTipoDeServicioDto extends PartialType(CreateTipoDeServicioDto) {}