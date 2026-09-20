import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany } from 'typeorm';
import { Localidad } from '../../localidad/entities/localidad.entity';
import { Profesional } from '../../profesional/entities/profesional.entity';

@Entity()
export class Zona {
  @PrimaryGeneratedColumn()
  idZona!: number;

  @Column()
  nombreZona!: string;

  // Localidad a la que pertenece la zona
  @ManyToOne(() => Localidad, (localidad) => localidad.zonas)
  localidad!: Localidad;

  // Contraparte N:M para saber qué profesionales cubren esta zona
  @ManyToMany(() => Profesional, (profesional) => profesional.zonasDeCobertura)
  profesionales!: Profesional[];
}