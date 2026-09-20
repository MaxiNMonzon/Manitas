import { Column, Entity } from 'typeorm';
import { Usuario } from '../../usuario/entities/usuario.entity';

@Entity('profesionales')
export class Profesional extends Usuario {
  @Column({ nullable: true })
  nroMatricula?: string;
}
