import { Column, DeleteDateColumn, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Promocion } from "../../promocion/entities/promocion.entity";
import { Tarjeta } from "../../tarjeta/entities/tarjeta.entity";

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

    @OneToMany(() => Tarjeta, (tarjeta) => tarjeta.metodoDePago)
    tarjetas!: Tarjeta[];

    @DeleteDateColumn()
    deleteAt!: Date;
}