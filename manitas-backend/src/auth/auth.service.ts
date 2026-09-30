import { Injectable } from '@nestjs/common';
import { ClienteService } from '../cliente/cliente.service';
import { ProfesionalService } from '../profesional/profesional.service';
import { CreateClienteDto } from '../cliente/dto/create-cliente.dto';
import { CreateProfesionalDto } from '../profesional/dto/create-profesional.dto';

@Injectable()
export class AuthService {

    constructor(
        private readonly clienteService: ClienteService,
        private readonly profesionalService: ProfesionalService

    ){}

    registerCliente(createClienteDto: CreateClienteDto) {
        return this.clienteService.create(createClienteDto);
    }

    registerProfesional(createProfesionalDto: CreateProfesionalDto) {
        return this.profesionalService.create(createProfesionalDto);
    }

    login(){
        return 'login';
    }

}