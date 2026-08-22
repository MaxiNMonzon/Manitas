import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';

import { Usuario } from '../entities/Usuario';
import { UsuarioService } from '../services/UsuarioService';

@Controller('usuarios')
export class UsuarioController {

 constructor(
    private readonly usuarioService: UsuarioService,
  ) {}

  }
