import { Module } from '@nestjs/common';
import { ZonaService } from './zona.service';
import { ZonaController } from './zona.controller';

@Module({
  controllers: [ZonaController],
  providers: [ZonaService],
})
export class ZonaModule {}
