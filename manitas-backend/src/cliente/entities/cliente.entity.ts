import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { Usuario } from '../../usuario/entities/usuario.entity';
import { Zona } from '../../zona/entities/zona.entity';
import { SolicitudDeServicio } from '../../solicitud-de-servicio/entities/solicitud-de-servicio.entity';
import { Tarjeta } from '../../tarjeta/entities/tarjeta.entity';

@Entity('clientes')
export class Cliente extends Usuario {
  // Direccion separada en partes. Piso y depto son opcionales (una casa no tiene)
  @Column()
  calle!: string;

  @Column()
  altura!: number;

  @Column({ nullable: true })
  piso?: string;

  @Column({ nullable: true })
  depto?: string;

  @ManyToOne(() => Zona, { nullable: false })
  zonaResidencia!: Zona;

  @OneToMany(() => SolicitudDeServicio, (solicitud) => solicitud.cliente)
  solicitudes!: SolicitudDeServicio[];

  @OneToMany(() => Tarjeta, (tarjeta) => tarjeta.cliente)
  tarjetas!: Tarjeta[];
}
