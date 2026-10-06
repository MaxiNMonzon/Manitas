import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Tarjeta } from "../../tarjeta/entities/tarjeta.entity";
import { Cliente } from "../../cliente/entities/cliente.entity";
import { Profesional } from "../../profesional/entities/profesional.entity";
import { EstadoSolicitud } from "../../common/enums/estado-solicitud.enum";

@Entity()
export class SolicitudDeServicio {
    @PrimaryGeneratedColumn()
    idSolicitud!: number;

    @Column({ type: 'enum', enum: EstadoSolicitud, default: EstadoSolicitud.SOLICITADO })
    estadoServicio!: EstadoSolicitud;

    @Column()
    descripcionProblema!: string;

    @CreateDateColumn({ type: 'datetime' })
    fechaSolicitud!: Date;

    // Se actualiza en cada cambio de estado, sirve para contar las 48 hs
    @Column({ type: 'datetime' })
    fechaCambioEstado!: Date;

    @Column({ type: 'datetime', nullable: true })
    fechaVisita!: Date;

    @Column({ type: 'datetime', nullable: true })
    fechaInicio!: Date;

    @Column({ type: 'datetime', nullable: true })
    fechaFinEstimada!: Date;

    @Column({ nullable: true })
    duracionEstimada!: number;

    @Column({ type: 'datetime', nullable: true })
    fechaFinReal!: Date;

    @Column({ nullable: true })
    costoVisita!: number;

    @Column({ nullable: true })
    costoEstimado!: number;

    @Column({ nullable: true })
    costoFinal!: number;

    @Column({ nullable: true })
    calificacionServicio!: number;

    @Column({ nullable: true })
    reseñaServicio!: string;

    // Con que tarjeta se pago (el metodo de pago se saca de la tarjeta)
    @ManyToOne(() => Tarjeta, (tarjeta) => tarjeta.solicitudes, { nullable: true })
    tarjeta!: Tarjeta;

    @ManyToOne(() => Cliente, (cliente) => cliente.solicitudes)
    cliente!: Cliente;

    @ManyToOne(() => Profesional, (profesional) => profesional.solicitudes)
    profesional!: Profesional;

    @DeleteDateColumn()
    deleteAt!: Date;
}