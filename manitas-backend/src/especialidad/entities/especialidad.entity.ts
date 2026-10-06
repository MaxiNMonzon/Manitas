import { Column, DeleteDateColumn, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { TipoDeServicio } from "../../tipo-de-servicio/entities/tipo-de-servicio.entity";
import { Profesional } from "../../profesional/entities/profesional.entity";

@Entity()
export class Especialidad {
    @PrimaryGeneratedColumn()
    idEspecialidad!: number;

    @Column()
    nombreEspecialidad!: string;

    @Column()
    descripcionEspecialidad!: string;
    
    @OneToMany (() => TipoDeServicio, (tipoDeServicio) => tipoDeServicio.especialidad)
    servicios!: TipoDeServicio[];

    @ManyToMany(() => Profesional, (profesional) => profesional.especialidades)
    profesionales!: Profesional[];

    @DeleteDateColumn()
    deleteAt!: Date;
}