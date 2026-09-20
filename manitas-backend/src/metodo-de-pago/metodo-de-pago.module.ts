import { Module } from '@nestjs/common';
import { MetodoDePagoService } from './metodo-de-pago.service';
import { MetodoDePagoController } from './metodo-de-pago.controller';

@Module({
  controllers: [MetodoDePagoController],
  providers: [MetodoDePagoService],
})
export class MetodoDePagoModule {}
