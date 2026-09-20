import { Column, DeleteDateColumn, PrimaryGeneratedColumn } from 'typeorm';

export abstract class Usuario {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  dni!: string;

  @Column()
  nombre!: string;

  @Column()
  apellido!: string;

  @Column({ type: 'date' })
  fechaNacimiento!: Date;

  @Column({ unique: true })
  correo!: string;

  @Column()
  contraseña!: string;

  @Column({ nullable: true })
  telefono!: string;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date;
}
