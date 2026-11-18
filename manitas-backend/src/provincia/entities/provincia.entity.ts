import { Column, DeleteDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Localidad } from "../../localidad/entities/localidad.entity";


@Entity()
export class Provincia {
    @PrimaryGeneratedColumn()
    idProvincia!: number;

    @Column()
    nombreProvincia!: string;

    // Id oficial de la API Georef (ej: "82" = Santa Fe). Lo usa el seed para no duplicar
    @Column({ type: 'varchar', length: 10, unique: true, nullable: true })
    idGeoref!: string | null;
    
    @OneToMany (() => Localidad, (localidad) => localidad.provincia)
    localidades!: Localidad[];

    @DeleteDateColumn()
    deleteAt!: Date;
}