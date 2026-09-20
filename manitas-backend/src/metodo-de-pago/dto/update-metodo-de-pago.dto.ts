import { PartialType } from '@nestjs/mapped-types';
import { CreateMetodoDePagoDto } from './create-metodo-de-pago.dto';

export class UpdateMetodoDePagoDto extends PartialType(CreateMetodoDePagoDto) {}
