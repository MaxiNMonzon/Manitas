import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards, Request } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { RegisterUsuarioDto } from './dto/register-usuario.dto';
import { LoginUsuarioDto } from './dto/login-usuario.dto';
import { SolicitarNuevaClaveDto } from './dto/solicitar-nueva-clave.dto';
import { RestablecerClaveDto } from './dto/restablecer-clave-dto';
import { RehabilitarUsuarioDto } from './dto/rehabilitar-usuario.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';


//Se implementa el controlador del usuario con las acciones que gestionará el mismo.
//las acciones se realizan sobre el controlador del usuario.
@Controller('usuario')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

//CRUDS de entidad
  @Post()
  create(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.usuarioService.create(createUsuarioDto);
  }

  @Get()
  findAll() {
    return this.usuarioService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usuarioService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUsuarioDto: UpdateUsuarioDto) {
    return this.usuarioService.update(+id, updateUsuarioDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usuarioService.remove(+id);
  }
  //CRUDS de sesión
  @Post('registro')
  async registrar(@Body() dto: RegisterUsuarioDto) {
    return this.usuarioService.registrar(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginUsuarioDto) {
    return this.usuarioService.login(dto);
  }

  @Post('solicitar-nueva-clave')
  async solicitarNuevaClave(@Body() dto: SolicitarNuevaClaveDto) {
    return this.usuarioService.solicitarNuevaClave(dto);
  }

  @Post('restablecer-clave')
  async restablecerClave(@Body() dto: RestablecerClaveDto) {
    return this.usuarioService.restablecerClave(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('perfil')
  obtenerPerfil(@Request() req: any) {
    return req.user;
  }

  // Endpoint para que el usuario autenticado se dé de baja a sí mismo
  @UseGuards(JwtAuthGuard)
  @Patch('baja-propia')
  async solicitarBajaPropia(@Request() req: any) {
    return this.usuarioService.darBajaPropia(req.user.sub);
  }

  // Endpoint para que la administración inhabilite a un usuario
   @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch('inhabilitar/:id')
  async inhabilitarUsuario(@Param('id', ParseIntPipe) id: number) {
    return this.usuarioService.darBajaPorAdmin(id);
    }

    // Endpoint para que solo el Admin vuelva a dar de alta al usuario
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch('rehabilitar')
  async rehabilitarUsuario(@Body() dto: RehabilitarUsuarioDto) {
    return this.usuarioService.rehabilitarUsuario(dto);
  }
}




