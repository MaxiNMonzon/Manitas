import { ApiProperty } from '@nestjs/swagger';
import { Matches } from 'class-validator';

export class ConfirmarPagoDto {
  // El "payment_id" que Mercado Pago agrega en la direccion al volver a la app
  @ApiProperty({ example: '1234567890' })
  @Matches(/^\d{1,30}$/, { message: 'paymentId tiene que ser el numero de pago de Mercado Pago' })
  paymentId!: string;
}
