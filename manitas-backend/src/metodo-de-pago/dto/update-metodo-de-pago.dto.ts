import { PartialType } from '@nestjs/swagger';
import { CreateMetodoDePagoDto } from './create-metodo-de-pago.dto';

export class UpdateMetodoDePagoDto extends PartialType(CreateMetodoDePagoDto) {}
