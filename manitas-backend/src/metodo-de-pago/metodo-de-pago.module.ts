import { forwardRef, Module } from '@nestjs/common';
import { MetodoDePagoService } from './metodo-de-pago.service';
import { MetodoDePagoController } from './metodo-de-pago.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MetodoDePago } from './entities/metodo-de-pago.entity';
import { PromocionModule } from '../promocion/promocion.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MetodoDePago]),
    forwardRef(() => PromocionModule),
  ],
  controllers: [MetodoDePagoController],
  providers: [MetodoDePagoService],
  exports: [TypeOrmModule],
})
export class MetodoDePagoModule {}