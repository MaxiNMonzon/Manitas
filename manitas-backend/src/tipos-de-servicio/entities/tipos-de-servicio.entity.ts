import { Column, DeleteDateColumn, Entity, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import { Especialidad } from "../../especialidad/entities/especialidad.entity";

@Entity()
export class TiposDeServicio {
    @PrimaryGeneratedColumn()
    idServicio!: number;
    
    @Column()
    nombreServicio!: string;
    
    @Column()
    descripcionServicio!: string;
    
    @ManyToOne(() => Especialidad, (especialidad) => especialidad.servicios)
    especialidad!: Especialidad;

    @DeleteDateColumn()  //es necesario ?? TypeORM guarda la fecha en que se borró cada registro, en vez de eliminarlo físicamente de la tabla
    deletedAt!: Date;

}
