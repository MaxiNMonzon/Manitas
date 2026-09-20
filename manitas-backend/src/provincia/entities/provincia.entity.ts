import { Column, DeleteDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Localidad } from "../../localidad/entities/localidad.entity";


@Entity()
export class Provincia {
    @PrimaryGeneratedColumn()
    idProvincia!: number;

    @Column()
    nombreProvincia!: string;
    
    @OneToMany (() => Localidad, (localidad) => localidad.provincia)
    localidades!: Localidad[];

    @DeleteDateColumn() //es necesario ?? TypeORM guarda la fecha en que se borró cada registro, en vez de eliminarlo físicamente de la tabla
    deleteAt!: Date;
}