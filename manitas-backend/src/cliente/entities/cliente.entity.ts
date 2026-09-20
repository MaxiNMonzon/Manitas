import { Column, Entity, ManyToOne } from 'typeorm';
import { Usuario } from '../../usuario/entities/usuario.entity';
import { Zona } from '../../zona/entities/zona.entity';

@Entity('clientes')
export class Cliente extends Usuario {
  @Column()
  direccion!: string;

  @ManyToOne(() => Zona, { nullable: false })
  zonaResidencia!: Zona;
}