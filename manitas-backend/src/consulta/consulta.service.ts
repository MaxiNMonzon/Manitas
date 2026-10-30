import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Consulta } from './entities/consulta.entity';
import { CreateConsultaDto } from './dto/create-consulta.dto';
import { Rol } from '../common/enums/rol.enum';
import type { UsuarioActivoInterface } from '../common/interfaces/usuario-activo.interface';

@Injectable()
export class ConsultaService {
  constructor(@InjectRepository(Consulta) private readonly consultaRepository: Repository<Consulta>) {}

  // Quién la manda sale del token (no del cuerpo del pedido), así nadie se hace pasar por otro
  async create(dto: CreateConsultaDto, usuario: UsuarioActivoInterface) {
    if (usuario.rol !== Rol.CLIENTE && usuario.rol !== Rol.PROFESIONAL) {
      throw new ForbiddenException('Solo los clientes y los profesionales envian consultas');
    }
    const guardada = await this.consultaRepository.save(
      this.consultaRepository.create({
        correo: dto.correo.trim(),
        tema: dto.tema.trim(),
        mensaje: dto.mensaje.trim(),
        rol: usuario.rol,
        correoCuenta: usuario.correo,
      }),
    );
    return { idConsulta: guardada.idConsulta, mensaje: 'Recibimos tu consulta. Te vamos a responder por correo.' };
  }

  // Para el administrador: las sin responder primero, de la mas vieja a la mas nueva
  async findAll() {
    return await this.consultaRepository.find({ order: { respondida: 'ASC', fecha: 'ASC' } });
  }

  async marcarRespondida(id: number) {
    const consulta = await this.consultaRepository.findOneBy({ idConsulta: id });
    if (!consulta) {
      throw new NotFoundException(`Consulta con ID ${id} no encontrada`);
    }
    consulta.respondida = true;
    return await this.consultaRepository.save(consulta);
  }
}