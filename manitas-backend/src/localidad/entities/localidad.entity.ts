import { Column, Entity, OneToMany, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Provincia } from '../../provincia/entities/provincia.entity';
import { Zona } from '../../zona/entities/zona.entity';

@Entity()
export class Localidad {
  @PrimaryGeneratedColumn()
  idLocalidad!: number;

  @Column()
  codigoPostal!: string;

  @Column()
  nombreLocalidad!: string;

  @ManyToOne(() => Provincia, (provincia) => provincia.localidades)
  provincia!: Provincia;

  @OneToMany(() => Zona, (zona) => zona.localidad)
  zonas!: Zona[];
}