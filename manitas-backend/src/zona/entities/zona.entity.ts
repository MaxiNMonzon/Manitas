import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, ManyToMany, DeleteDateColumn } from 'typeorm';
import { Localidad } from '../../localidad/entities/localidad.entity';
import { Cliente } from "../../cliente/entities/cliente.entity";
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

  @OneToMany(() => Cliente, (cliente) => cliente.zonaResidencia)
  clientes!: Cliente[];

  // Contraparte N:M para saber qué profesionales cubren esta zona
  @ManyToMany(() => Profesional, (profesional) => profesional.zonasDeCobertura)
  profesionales!: Profesional[];

    //usuario

    @DeleteDateColumn()  //es necesario ?? TypeORM guarda la fecha en que se borró cada registro, en vez de eliminarlo físicamente de la tabla
    deletedAt!: Date;

}