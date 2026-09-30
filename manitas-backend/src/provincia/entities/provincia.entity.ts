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

    @DeleteDateColumn()
    deleteAt!: Date;
}