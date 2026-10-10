import { Column, DeleteDateColumn, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { TiposDeServicio } from "../../tipos-de-servicio/entities/tipos-de-servicio.entity";
import { Profesional } from "../../profesional/entities/profesional.entity";

@Entity()
export class Especialidad {
    @PrimaryGeneratedColumn()
    idEspecialidad!: number;

    @Column()
    nombreEspecialidad!: string;

    @Column()
    descripcionEspecialidad!: string;
    
    @OneToMany (() => TiposDeServicio, (tiposDeServicio) => tiposDeServicio.especialidad)
    servicios!: TiposDeServicio[];

    @ManyToMany(() => Profesional, (profesional) => profesional.especialidades)
    profesionales!: Profesional[];

    @DeleteDateColumn()
    deleteAt!: Date;
}
