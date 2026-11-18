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

    // Palabras que usa el cliente para contar su problema, separadas por coma (ej: "caño, canilla, pérdida").
    // Las carga el admin; el buscador las usa para llevar al cliente a los profesionales de este oficio
    @Column({ type: 'text', nullable: true })
    palabrasClave!: string | null;

    @OneToMany (() => TiposDeServicio, (tiposDeServicio) => tiposDeServicio.especialidad)
    servicios!: TiposDeServicio[];

    @ManyToMany(() => Profesional, (profesional) => profesional.especialidades)
    profesionales!: Profesional[];

    @OneToMany(() => SolicitudDeServicio, (solicitud) => solicitud.especialidad)
    solicitudes!: SolicitudDeServicio[];

    @DeleteDateColumn()
    deleteAt!: Date;
}
