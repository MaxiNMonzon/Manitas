import { Column, Entity } from 'typeorm';
import { Usuario } from '../../usuario/entities/usuario.entity';

@Entity('clientes')
export class Cliente extends Usuario {
  @Column()
  direccion!: string;
}
