import { Column, DeleteDateColumn, Entity, PrimaryGeneratedColumn, ManyToOne } from "typeorm";

@Entity()
export class TiposDeServicio {
    @PrimaryGeneratedColumn()
    idServicio!: number;
    
    @Column()
    nombreServicio!: string;
    
    @Column()
    descripcionServicio!: string;
    
    //@ManyToOne(() => Especialidad, (especialidad) => especialidad.servicios)
    //especialidad!: Especialidad;

    @DeleteDateColumn()
    deletedAt!: Date;

}
