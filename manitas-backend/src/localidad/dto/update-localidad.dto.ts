import { PartialType } from '@nestjs/swagger';
import { CreateLocalidadDto } from './create-localidad.dto';

export class UpdateLocalidadDto extends PartialType(CreateLocalidadDto) {}
