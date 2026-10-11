import { Column, DeleteDateColumn, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { TipoDeServicio } from "../../tipo-de-servicio/entities/tipo-de-servicio.entity";
import { Profesional } from "../../profesional/entities/profesional.entity";
import { SolicitudDeServicio } from "../../solicitud-de-servicio/entities/solicitud-de-servicio.entity";

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

    @OneToMany(() => SolicitudDeServicio, (solicitud) => solicitud.especialidad)
    solicitudes!: SolicitudDeServicio[];

    @DeleteDateColumn()
    deleteAt!: Date;
}