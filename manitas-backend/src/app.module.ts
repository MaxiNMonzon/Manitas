import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LocalidadController } from './controllers/LocalidadController';

@Module({
  imports: [],
  controllers: [AppController, LocalidadController],
  providers: [AppService],
})
export class AppModule {}