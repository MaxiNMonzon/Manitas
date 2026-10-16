import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Profesional } from '../../profesional/entities/profesional.entity';

// El horario fijo del profesional, que carga una sola vez.
// Ej: lunes de 9 a 18 = { diaSemana: 1, horaDesde: 9, horaHasta: 18 } -> turnos de 9, 10, ..., 17.
// Un dia puede tener varios rangos (ej: 9 a 13 y 15 a 19)
@Entity()
export class HorarioLaboral {
  @PrimaryGeneratedColumn()
  idHorario!: number;

  // 0 = domingo, 1 = lunes, ..., 6 = sabado (igual que getDay() de JavaScript)
  @Column()
  diaSemana!: number;

  // Horas enteras: los turnos duran una hora de reloj
  @Column()
  horaDesde!: number;

  @Column()
  horaHasta!: number;

  @ManyToOne(() => Profesional, (profesional) => profesional.horarios, { nullable: false, onDelete: 'CASCADE' })
  profesional!: Profesional;
}