import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ClienteService } from './cliente.service';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { Rol } from '../common/enums/rol.enum';
import { UsuarioActivo } from '../common/decorators/usuario-activo.decorator';
import type { UsuarioActivoInterface } from '../common/interfaces/usuario-activo.interface';


@ApiTags('Clientes')
@Controller('cliente')
export class ClienteController {
  constructor(private readonly clienteService: ClienteService) {}

  @Get()
  @Auth(Rol.ADMIN)
  @ApiOperation({ summary: 'Listar todos los clientes', description: 'Solo el admin. Con su zona, localidad y provincia (sin contraseñas).' })
  findAll() {
    return this.clienteService.findAll();
  }

  @Get(':id')
  @Auth(Rol.CLIENTE)
  @ApiOperation({ summary: 'Ver mi cuenta de cliente', description: 'Solo la propia cuenta (el id tiene que ser el del token).' })
  findOne(@Param('id', ParseIntPipe) id: number, @UsuarioActivo() usuario: UsuarioActivoInterface) {
    return this.clienteService.findOnePropio(id, usuario.sub);
  }

  @Patch(':id')
  @Auth(Rol.CLIENTE)
  @ApiOperation({ summary: 'Editar mi cuenta de cliente' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateClienteDto: UpdateClienteDto,
    @UsuarioActivo() usuario: UsuarioActivoInterface,
  ) {
    return this.clienteService.update(id, updateClienteDto, usuario.sub);
  }

  @Delete(':id')
  @Auth(Rol.CLIENTE)
  @ApiOperation({ summary: 'Dar de baja mi cuenta de cliente', description: 'Borrado logico: el correo queda bloqueado.' })
  remove(@Param('id', ParseIntPipe) id: number, @UsuarioActivo() usuario: UsuarioActivoInterface) {
    return this.clienteService.remove(id, usuario.sub);
  }
}