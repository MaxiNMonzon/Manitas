import { Column, DeleteDateColumn, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Promocion } from "../../promocion/entities/promocion.entity";
import { SolicitudDeServicio } from "../../solicitud-de-servicio/entities/solicitud-de-servicio.entity";

@Entity()
export class MetodoDePago {
    @PrimaryGeneratedColumn()
    idFormaPago!: number;

    @Column()
    tipo!: string;

    @Column()
    estado!: string;

    @ManyToMany(() => Promocion, (promocion) => promocion.metodosPago)
    @JoinTable()
    promociones!: Promocion[];

    @OneToMany(() => SolicitudDeServicio, (solicitud) => solicitud.metodoPago)
    solicitudes!: SolicitudDeServicio[];

    @DeleteDateColumn() //es necesario ?? TypeORM guarda la fecha en que se borró cada registro, en vez de eliminarlo físicamente de la tabla
    deleteAt!: Date;
}
