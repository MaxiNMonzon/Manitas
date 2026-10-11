import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { MetodoDePagoService } from './metodo-de-pago.service';
import { CreateMetodoDePagoDto } from './dto/create-metodo-de-pago.dto';
import { UpdateMetodoDePagoDto } from './dto/update-metodo-de-pago.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { Rol } from '../common/enums/rol.enum';

@ApiTags('Metodos de pago')
@Controller('metodo-de-pago')
export class MetodoDePagoController {
  constructor(private readonly metodoDePagoService: MetodoDePagoService) {}

  @Post()
  @Auth(Rol.ADMIN)
  @ApiOperation({ summary: 'Crear un metodo de pago', description: 'El estado "activo" permite pagar con ese metodo. Solo el admin.' })
  create(@Body() createMetodoDePagoDto: CreateMetodoDePagoDto) {
    return this.metodoDePagoService.create(createMetodoDePagoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar los metodos de pago', description: 'Publico.' })
  findAll() {
    return this.metodoDePagoService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ver un metodo de pago', description: 'Publico.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.metodoDePagoService.findOne(id);
  }

  @Patch(':id')
  @Auth(Rol.ADMIN)
  @ApiOperation({ summary: 'Editar un metodo de pago', description: 'Solo el admin.' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateMetodoDePagoDto: UpdateMetodoDePagoDto) {
    return this.metodoDePagoService.update(id, updateMetodoDePagoDto);
  }

  @Delete(':id')
  @Auth(Rol.ADMIN)
  @ApiOperation({ summary: 'Borrar un metodo de pago', description: 'Borrado logico. Solo el admin.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.metodoDePagoService.remove(id);
  }
}