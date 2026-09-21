import { Column, DeleteDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { MetodoDePago } from "../../metodo-de-pago/entities/metodo-de-pago.entity";
//import { Cliente } from "../../cliente/entities/cliente.entity";
//import { Profesional } from "../../profesional/entities/profesional.entity";

@Entity()
export class SolicitudDeServicio {
    @PrimaryGeneratedColumn()
    idSolicitud!: number;

    @Column()
    estadoServicio!: string;

    @Column()
    visitaPrevia!: boolean;

    @Column({ type: 'date' })
    fechaSolicitud!: Date;

    @Column({ type: 'date', nullable: true })
    fechaVisita!: Date;

    @Column({ type: 'time' })
    horaInicio!: string;

    @Column({ type: 'time' })
    horaFinEstimada!: string;

    @Column()
    duracionEstimada!: number;

    @Column({ type: 'time', nullable: true })
    horaFinReal!: string;

    @Column()
    costoEstimado!: number;

    @Column({ nullable: true })
    costoFinal!: number;

    @Column({ nullable: true })
    calificacionServicio!: number;

    @Column({ nullable: true })
    reseñaServicio!: string;

    @ManyToOne(() => MetodoDePago, (metodoDePago) => metodoDePago.solicitudes)
    metodoPago!: MetodoDePago;

    //@ManyToOne(() => Cliente, (cliente) => cliente.solicitudes)
    //cliente!: Cliente;

    //@ManyToOne(() => Profesional, (profesional) => profesional.solicitudes)
    //profesional!: Profesional;

    @DeleteDateColumn() //es necesario ?? TypeORM guarda la fecha en que se borró cada registro, en vez de eliminarlo físicamente de la tabla
    deleteAt!: Date;
}
