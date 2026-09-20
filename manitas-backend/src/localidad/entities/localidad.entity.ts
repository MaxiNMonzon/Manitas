import { Column, Entity, OneToMany, PrimaryGeneratedColumn, ManyToOne, DeleteDateColumn } from "typeorm";
import { Provincia } from "../../provincia/entities/provincia.entity";
import { Zona } from "../../zona/entities/zona.entity";

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
    
    @OneToMany (() => Zona, (zonas) => zonas.localidad)
    zonas!: Zona[];

    @DeleteDateColumn()  //es necesario ?? TypeORM guarda la fecha en que se borró cada registro, en vez de eliminarlo físicamente de la tabla
    deletedAt!: Date;
}
