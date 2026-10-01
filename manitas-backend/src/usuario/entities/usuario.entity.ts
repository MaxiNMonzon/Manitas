import { Column, DeleteDateColumn, PrimaryGeneratedColumn } from 'typeorm';

export abstract class Usuario {
  @PrimaryGeneratedColumn()
  idUsuario!: number;

  @Column()
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

  @DeleteDateColumn()
  deleteAt!: Date;
}
