import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ZonaService } from './zona.service';
import { CreateZonaDto } from './dto/create-zona.dto';
import { UpdateZonaDto } from './dto/update-zona.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { Rol } from '../common/enums/rol.enum';

@Controller('zona')
export class ZonaController {
  constructor(private readonly zonaService: ZonaService) {}

   @Post()
  @Auth(Rol.ADMIN)
  create(@Body() createZonaDto: CreateZonaDto) {
    return this.zonaService.create(createZonaDto);
  }

 @Get()
  findAll(@Query('localidad', new ParseIntPipe({ optional: true })) idLocalidad?: number) {
    return this.zonaService.findAll(idLocalidad);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.zonaService.findOne(id);
  }
  
    @Patch(':id')
  @Auth(Rol.ADMIN)
  update(@Param('id', ParseIntPipe) id: number, @Body() updateZonaDto: UpdateZonaDto) {
    return this.zonaService.update(id, updateZonaDto);
  }

    @Delete(':id')
  @Auth(Rol.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.zonaService.remove(id);
  }


}

 



  

