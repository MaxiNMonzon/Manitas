import { Column, Entity, ManyToMany, OneToMany, JoinTable } from 'typeorm';
import { Usuario } from '../../usuario/entities/usuario.entity';
import { Zona } from '../../zona/entities/zona.entity';
import { Especialidad } from '../../especialidad/entities/especialidad.entity';
import { SolicitudDeServicio } from '../../solicitud-de-servicio/entities/solicitud-de-servicio.entity';

@Entity('profesionales')
export class Profesional extends Usuario {
  @Column({ nullable: true })
  nroMatricula?: string;

  // Opcional: solo se cobra si el cliente rechaza el presupuesto
  @Column({ nullable: true })
  costoVisita?: number;

  // Arreglo de zonas cubiertas por el profesional
  @ManyToMany(() => Zona, (zona) => zona.profesionales)
  @JoinTable({
    name: 'profesional_zonas_cobertura',
    joinColumn: { name: 'idProfesional', referencedColumnName: 'idUsuario' },
    inverseJoinColumn: { name: 'idZona', referencedColumnName: 'idZona' },
  })
  zonasDeCobertura!: Zona[];

  // Especialidades que hace el profesional (plomeria, gas, etc.)
  @ManyToMany(() => Especialidad, (especialidad) => especialidad.profesionales)
  @JoinTable({
    name: 'profesional_especialidades',
    joinColumn: { name: 'idProfesional', referencedColumnName: 'idUsuario' },
    inverseJoinColumn: { name: 'idEspecialidad', referencedColumnName: 'idEspecialidad' },
  })
  especialidades!: Especialidad[];

  @OneToMany(() => SolicitudDeServicio, (solicitud) => solicitud.profesional)
  solicitudes!: SolicitudDeServicio[];
}
