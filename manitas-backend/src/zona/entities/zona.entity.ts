import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, DeleteDateColumn } from "typeorm";
import { Localidad } from "../../localidad/entities/localidad.entity";


@Entity()
export class Zona {
    
    @PrimaryGeneratedColumn()
    idZona!: number;

    @Column()
    nombreZona!: string;
    
    @ManyToOne(() => Localidad, (localidad) => localidad.zonas)
    localidad!: Localidad;

    
    //usuario

    @DeleteDateColumn()  //es necesario ?? TypeORM guarda la fecha en que se borró cada registro, en vez de eliminarlo físicamente de la tabla
    deletedAt!: Date;
    
}
