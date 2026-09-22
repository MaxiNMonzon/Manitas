import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryColumn } from 'typeorm';
import { Usuario } from '../../usuario/entities/usuario.entity';
import { Zona } from '../../zona/entities/zona.entity';
import { SolicitudDeServicio } from '../../solicitud-de-servicio/entities/solicitud-de-servicio.entity';

@Entity('clientes')
export class Cliente {
  @PrimaryColumn()
  idUsuario!: number;

  @OneToOne(() => Usuario)
  @JoinColumn({ name: 'idUsuario' })
  usuario!: Usuario;

  @Column()
  direccion!: string;

  @ManyToOne(() => Zona, { nullable: false })
  zonaResidencia!: Zona;

  @OneToMany(() => SolicitudDeServicio, (solicitud) => solicitud.cliente)
  solicitudes!: SolicitudDeServicio[];
}
