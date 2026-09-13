import { Module } from '@nestjs/common';
import { PrecioBaseService } from './precio-base.service';
import { PrecioBaseController } from './precio-base.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrecioBase } from './entities/precio-base.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PrecioBase])],
  controllers: [PrecioBaseController],
  providers: [PrecioBaseService],
})
export class PrecioBaseModule {}
