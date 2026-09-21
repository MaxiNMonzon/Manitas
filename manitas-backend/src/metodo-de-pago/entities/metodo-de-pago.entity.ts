import { Column, DeleteDateColumn, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { Promocion } from "../../promocion/entities/promocion.entity";

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

    @DeleteDateColumn() //es necesario ?? TypeORM guarda la fecha en que se borró cada registro, en vez de eliminarlo físicamente de la tabla
    deleteAt!: Date;
}
