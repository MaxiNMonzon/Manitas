import { PartialType } from '@nestjs/swagger';
import { CreateZonaDto } from './create-zona.dto';

export class UpdateZonaDto extends PartialType(CreateZonaDto) {}
