import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query, //nuevo, para filtrado
} from '@nestjs/common';
import { ProfesionalService } from './profesional.service';
import { CreateProfesionalDto } from './dto/create-profesional.dto';
import { UpdateProfesionalDto } from './dto/update-profesional.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { Rol } from '../common/enums/rol.enum';
import { UsuarioActivo } from '../common/decorators/usuario-activo.decorator';
import type { UsuarioActivoInterface } from '../common/interfaces/usuario-activo.interface';

@Controller('profesional')
export class ProfesionalController {
  constructor(private readonly profesionalService: ProfesionalService) {}

  //no es necesario crear el profesional. Lo crea el usuario cuando se registra. El usuario se puede registrar como profesional o como cliente.
  //el usuario se tiene que registrar con una cuenta de correo para profesional y con otra cuenta de correo para cliente.
  //por eso no iría @Post
  /*@Post()
  create(@Body() createProfesionalDto: CreateProfesionalDto) {
    return this.profesionalService.create(createProfesionalDto);
  }*/

  @Get()    //lo nuevo del filtrado
  findAll(
  @Query('especialidad') especialidad?: string,
  @Query('zona') zona?: string,
) {
  const idEspecialidad = especialidad ? +especialidad : undefined;
  const idZona = zona ? +zona : undefined;
  return this.profesionalService.findAll(idEspecialidad, idZona);
}
/* @Get()
  findAll() {
    return this.profesionalService.findAll();
  }*/

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.profesionalService.findOne(id);
  }
  
  /*@Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProfesionalDto: UpdateProfesionalDto,
  ) {
    return this.profesionalService.update(id, updateProfesionalDto);
  }*/

  @Patch(':id')
  @Auth(Rol.PROFESIONAL)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProfesionalDto: UpdateProfesionalDto,
    @UsuarioActivo() usuario: UsuarioActivoInterface,
  ) {
    return this.profesionalService.update(id, updateProfesionalDto, usuario.sub);
  }

  /*@Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.profesionalService.remove(id);
  }*/

  @Delete(':id')
  @Auth(Rol.PROFESIONAL)
  remove(@Param('id', ParseIntPipe) id: number, @UsuarioActivo() usuario: UsuarioActivoInterface) {
    return this.profesionalService.remove(id, usuario.sub);
  }
}