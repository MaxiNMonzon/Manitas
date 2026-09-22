import { forwardRef, Module } from '@nestjs/common';
import { PromocionService } from './promocion.service';
import { PromocionController } from './promocion.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Promocion } from './entities/promocion.entity';
import { MetodoDePagoModule } from '../metodo-de-pago/metodo-de-pago.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Promocion]),
    forwardRef(() => MetodoDePagoModule),
  ],
  controllers: [PromocionController],
  providers: [PromocionService],
  exports: [TypeOrmModule],
})
export class PromocionModule {}