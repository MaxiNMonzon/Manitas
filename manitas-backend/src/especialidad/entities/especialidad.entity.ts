import { Column, DeleteDateColumn, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { TiposDeServicio } from "../../tipos-de-servicio/entities/tipos-de-servicio.entity";
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
    
    @OneToMany (() => TiposDeServicio, (tiposDeServicio) => tiposDeServicio.especialidad)
    servicios!: TiposDeServicio[];

    @ManyToMany(() => Profesional, (profesional) => profesional.especialidades)
    profesionales!: Profesional[];

    @OneToMany(() => SolicitudDeServicio, (solicitud) => solicitud.especialidad)
    solicitudes!: SolicitudDeServicio[];

    @DeleteDateColumn()
    deleteAt!: Date;
}
