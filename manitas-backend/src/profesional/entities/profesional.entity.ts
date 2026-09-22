import { Column, Entity, JoinColumn, ManyToMany, OneToMany, OneToOne, JoinTable, PrimaryColumn } from 'typeorm';
import { Usuario } from '../../usuario/entities/usuario.entity';
import { Zona } from '../../zona/entities/zona.entity';
import { PrecioBase } from '../../precio-base/entities/precio-base.entity';
import { SolicitudDeServicio } from '../../solicitud-de-servicio/entities/solicitud-de-servicio.entity';

@Entity('profesionales')
export class Profesional {
  @PrimaryColumn()
  idUsuario!: number;

  @OneToOne(() => Usuario)
  @JoinColumn({ name: 'idUsuario' })
  usuario!: Usuario;

  @Column({ nullable: true })
  nroMatricula?: string;

  // Arreglo de zonas cubiertas por el profesional
  @ManyToMany(() => Zona, (zona) => zona.profesionales)
  @JoinTable({
    name: 'profesional_zonas_cobertura',
    joinColumn: { name: 'idProfesional', referencedColumnName: 'idUsuario' },
    inverseJoinColumn: { name: 'idZona', referencedColumnName: 'idZona' },
  })
  zonasDeCobertura!: Zona[];

  @OneToMany(() => PrecioBase, (precioBase) => precioBase.profesional)
  precios!: PrecioBase[];

  @OneToMany(() => SolicitudDeServicio, (solicitud) => solicitud.profesional)
  solicitudes!: SolicitudDeServicio[];
}