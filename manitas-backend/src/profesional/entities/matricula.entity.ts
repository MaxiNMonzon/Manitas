import { Column, DeleteDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Profesional } from './profesional.entity';
import { Especialidad } from '../../especialidad/entities/especialidad.entity';

// Matricula habilitante de un profesional para una de sus especialidades
// (ej: Gas -> "MP-4521", "Gasista de 1ra categoria - ENARGAS"). Un profesional puede tener varias
@Entity()
export class Matricula {
  @PrimaryGeneratedColumn()
  idMatricula!: number;

  @Column({ length: 30 })
  numero!: string;

  // Opcional: categoria, organismo o colegio que la emite, etc.
  @Column({ type: 'varchar', length: 200, nullable: true })
  descripcion?: string | null;

  @ManyToOne(() => Especialidad)
  especialidad!: Especialidad;

  // Si el profesional la saca de su lista, se da de baja (borrado logico)
  @ManyToOne(() => Profesional, (profesional) => profesional.matriculas, { orphanedRowAction: 'soft-delete' })
  profesional!: Profesional;

  @DeleteDateColumn()
  deleteAt!: Date;
}
