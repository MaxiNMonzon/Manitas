import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { SolicitudDeServicioModule } from '../solicitud-de-servicio/solicitud-de-servicio.module';

@Module({
  imports: [SolicitudDeServicioModule],
  providers: [PaymentsService],
  controllers: [PaymentsController],
})
export class PaymentsModule {}
