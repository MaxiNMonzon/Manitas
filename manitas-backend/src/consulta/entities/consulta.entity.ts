import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

// Una consulta enviada desde la seccion "Ayuda" cuando las preguntas frecuentes no alcanzan.
// El administrador la lee (GET /consulta) y le escribe a la persona al correo que dejo
@Entity()
export class Consulta {
  @PrimaryGeneratedColumn()
  idConsulta!: number;

  // A donde contestarle (puede ser otro que el de su cuenta)
  @Column({ length: 120 })
  correo!: string;

  // Tema elegido de una lista (ej: "Pagos", "Mi cuenta")
  @Column({ length: 60 })
  tema!: string;

  @Column({ type: 'text' })
  mensaje!: string;

  // Quien pregunta (cliente o profesional), tomado del token
  @Column({ length: 15 })
  rol!: 'cliente' | 'profesional';

  // El correo de la cuenta con la que estaba logueado, tomado del token
  @Column({ type: 'varchar', length: 120, nullable: true })
  correoCuenta!: string | null;

  @CreateDateColumn({ type: 'datetime' })
  fecha!: Date;

  // El administrador la marca cuando ya le respondio
  @Column({ default: false })
  respondida!: boolean;
}