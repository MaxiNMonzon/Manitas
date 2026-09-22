import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, OneToMany, ManyToMany, DeleteDateColumn } from "typeorm";
import { Localidad } from "../../localidad/entities/localidad.entity";
import { Cliente } from "../../cliente/entities/cliente.entity";
import { Profesional } from "../../profesional/entities/profesional.entity";


@Entity()
export class Zona {

    @PrimaryGeneratedColumn()
    idZona!: number;

    @Column()
    nombreZona!: string;

    @ManyToOne(() => Localidad, (localidad) => localidad.zonas)
    localidad!: Localidad;

    @OneToMany(() => Cliente, (cliente) => cliente.zonaResidencia)
    clientes!: Cliente[];

    @ManyToMany(() => Profesional, (profesional) => profesional.zonasDeCobertura)
    profesionales!: Profesional[];

    @DeleteDateColumn()  //es necesario ?? TypeORM guarda la fecha en que se borró cada registro, en vez de eliminarlo físicamente de la tabla
    deletedAt!: Date;

}
