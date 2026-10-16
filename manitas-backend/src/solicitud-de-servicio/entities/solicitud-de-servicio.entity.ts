import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Turno } from "../../turno/entities/turno.entity";
import { Tarjeta } from "../../tarjeta/entities/tarjeta.entity";
import { Cliente } from "../../cliente/entities/cliente.entity";
import { Profesional } from "../../profesional/entities/profesional.entity";
import { Especialidad } from "../../especialidad/entities/especialidad.entity";
import { EstadoSolicitud } from "../../common/enums/estado-solicitud.enum";

@Entity()
export class SolicitudDeServicio {
    @PrimaryGeneratedColumn()
    idSolicitud!: number;

    @Column({ type: 'enum', enum: EstadoSolicitud, default: EstadoSolicitud.SOLICITADO })
    estadoServicio!: EstadoSolicitud;

    @Column()
    descripcionProblema!: string;

    // Urgente: no se elige profesional, la ven todos los de esa especialidad y zona,
    // el primero que acepta se la queda, vence en 1 hora y solo se cancela si nadie la acepto
    @Column({ default: false })
    urgente!: boolean;

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

    // Cuando pago el cliente (el trabajo, o la visita si rechazo el presupuesto).
    // Con esto el profesional ve sus cobros por mes y cuando se le deposita
    @Column({ type: 'datetime', nullable: true })
    fechaPago!: Date;

    // Si se pago con Mercado Pago (en vez de una tarjeta guardada): el numero de pago que da Mercado Pago
    @Column({ type: 'varchar', length: 30, nullable: true })
    idPagoMercadoPago!: string | null;

    // Cuantas horas lleva el trabajo (lo dice el profesional en el presupuesto)
    @Column({ nullable: true })
    horasTrabajo!: number;

    // Cuando el cliente acepto el presupuesto: tiene 6 hs para echarse atras
    @Column({ type: 'datetime', nullable: true })
    fechaAceptacion!: Date;

    // Mientras hay una reprogramacion: a que estado vuelve y quien la propuso
    // (le toca contestar al otro)
    @Column({ type: 'enum', enum: EstadoSolicitud, nullable: true })
    estadoAnterior!: EstadoSolicitud | null;

    @Column({ type: 'varchar', length: 15, nullable: true })
    propuestaDe!: 'cliente' | 'profesional' | null;

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

    // En una urgente queda vacio hasta que un profesional la acepta
    @ManyToOne(() => Profesional, (profesional) => profesional.solicitudes, { nullable: true })
    profesional!: Profesional;

    // La especialidad que eligio el cliente (ej: Plomeria). En la base es opcional
    // solo por las solicitudes viejas; al crear una nueva siempre se pide
    @ManyToOne(() => Especialidad, (especialidad) => especialidad.solicitudes, { nullable: true })
    especialidad!: Especialidad;

    // Los turnos que tiene tomados (la visita y las horas del trabajo) y los propuestos
    @OneToMany(() => Turno, (turno) => turno.solicitud)
    turnos!: Turno[];

    @DeleteDateColumn()
    deleteAt!: Date;
}