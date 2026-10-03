import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { ClienteService } from './cliente.service';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { Rol } from '../common/enums/rol.enum';
import { UsuarioActivo } from '../common/decorators/usuario-activo.decorator';
import type { UsuarioActivoInterface } from '../common/interfaces/usuario-activo.interface';

@Controller('cliente')
export class ClienteController {
  constructor(private readonly clienteService: ClienteService) {}

  @Get(':id')
  @Auth(Rol.CLIENTE)
  findOne(@Param('id', ParseIntPipe) id: number, @UsuarioActivo() usuario: UsuarioActivoInterface) {
    return this.clienteService.findOnePropio(id, usuario.sub);
  }

  @Patch(':id')
  @Auth(Rol.CLIENTE)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateClienteDto: UpdateClienteDto,
    @UsuarioActivo() usuario: UsuarioActivoInterface,
  ) {
    return this.clienteService.update(id, updateClienteDto, usuario.sub);
  }

  @Delete(':id')
  @Auth(Rol.CLIENTE)
  remove(@Param('id', ParseIntPipe) id: number, @UsuarioActivo() usuario: UsuarioActivoInterface) {
    return this.clienteService.remove(id, usuario.sub);
  }
}
