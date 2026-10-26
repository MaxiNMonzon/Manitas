import { Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Profesional } from '../../profesional/entities/profesional.entity';
import { SolicitudDeServicio } from '../../solicitud-de-servicio/entities/solicitud-de-servicio.entity';

// Un turno TOMADO de un profesional (de una hora). Los turnos libres no se guardan:
// se calculan con el horario fijo menos estos. Si un turno se libera, se borra la fila.
// El indice unico hace que dos personas nunca puedan tomar el mismo horario del mismo profesional
@Entity()
@Index(['profesional', 'inicio'], { unique: true })
export class Turno {
  @PrimaryGeneratedColumn()
  idTurno!: number;

  @Column({ type: 'datetime' })
  inicio!: Date;

  @Column({ type: 'datetime' })
  fin!: Date;

  // Para que se usa: la visita o una hora del trabajo
  @Column({ length: 10 })
  tipo!: 'visita' | 'trabajo';

  // reservado: confirmado o esperando que el profesional acepte la solicitud.
  // propuesto: es un horario nuevo que se propuso en una reprogramacion (el original sigue reservado)
  @Column({ length: 10 })
  estado!: 'reservado' | 'propuesto';

  @ManyToOne(() => Profesional, { nullable: false })
  profesional!: Profesional;

  @ManyToOne(() => SolicitudDeServicio, (solicitud) => solicitud.turnos, { nullable: false, onDelete: 'CASCADE' })
  solicitud!: SolicitudDeServicio;
}
