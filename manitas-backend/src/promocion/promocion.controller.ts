import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PromocionService } from './promocion.service';
import { CreatePromocionDto } from './dto/create-promocion.dto';
import { UpdatePromocionDto } from './dto/update-promocion.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { Rol } from '../common/enums/rol.enum';

@ApiTags('Promociones')
@Controller('promocion')
export class PromocionController {
  constructor(private readonly promocionService: PromocionService) {}

  @Post()
  @Auth(Rol.ADMIN)
  @ApiOperation({ summary: 'Crear una promocion', description: 'Solo el admin.' })
  create(@Body() createPromocionDto: CreatePromocionDto) {
    return this.promocionService.create(createPromocionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar las promociones', description: 'Publico.' })
  findAll() {
    return this.promocionService.findAll();
  }

  // Tiene que ir antes de ':id', si no Nest piensa que "del-mes" es un id
  @Get('del-mes')
  @ApiOperation({ summary: 'Informar promociones bancarias del mes', description: 'Las promos vigentes en algun momento de este mes, de mayor a menor descuento, con sus metodos de pago. Publico.' })
  delMes() {
    return this.promocionService.delMes();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ver una promocion', description: 'Publico.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.promocionService.findOne(id);
  }

  @Patch(':id')
  @Auth(Rol.ADMIN)
  @ApiOperation({ summary: 'Editar una promocion', description: 'Solo el admin.' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updatePromocionDto: UpdatePromocionDto) {
    return this.promocionService.update(id, updatePromocionDto);
  }

  @Delete(':id')
  @Auth(Rol.ADMIN)
  @ApiOperation({ summary: 'Borrar una promocion', description: 'Borrado logico. Solo el admin.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.promocionService.remove(id);
  }
}
