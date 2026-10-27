import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Consulta } from './entities/consulta.entity';
import { CreateConsultaDto } from './dto/create-consulta.dto';

@Injectable()
export class ConsultaService {
  constructor(@InjectRepository(Consulta) private readonly consultaRepository: Repository<Consulta>) {}

  async create(dto: CreateConsultaDto) {
    const guardada = await this.consultaRepository.save(
      this.consultaRepository.create({
        correo: dto.correo.trim(),
        tema: dto.tema.trim(),
        mensaje: dto.mensaje.trim(),
        rol: dto.rol ?? 'visitante',
        correoCuenta: dto.correoCuenta ?? null,
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