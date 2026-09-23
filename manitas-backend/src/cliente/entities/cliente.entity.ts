import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { Usuario } from '../../usuario/entities/usuario.entity';
import { Zona } from '../../zona/entities/zona.entity';
import { SolicitudDeServicio } from '../../solicitud-de-servicio/entities/solicitud-de-servicio.entity';

@Entity('clientes')
export class Cliente extends Usuario {
  @Column()
  direccion!: string;

  @ManyToOne(() => Zona, { nullable: false })
  zonaResidencia!: Zona;

  @OneToMany(() => SolicitudDeServicio, (solicitud) => solicitud.cliente)
  solicitudes!: SolicitudDeServicio[];
}
