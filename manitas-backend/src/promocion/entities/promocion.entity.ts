import { Column, DeleteDateColumn, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { MetodoDePago } from "../../metodo-de-pago/entities/metodo-de-pago.entity";

@Entity()
export class Promocion {
    @PrimaryGeneratedColumn()
    idPromocion!: number;

    @Column()
    codigo!: string;

    @Column({ type: 'date' })
    fechaInicioVigencia!: Date;

    @Column({ type: 'date' })
    fechaFinVigencia!: Date;

    @Column('decimal', { precision: 5, scale: 2 })
    porcentajeDescuento!: number;

    @Column()
    descripcion!: string;

    @ManyToMany(() => MetodoDePago, (metodoDePago) => metodoDePago.promociones)
    metodosPago!: MetodoDePago[];

    @DeleteDateColumn() //es necesario ?? TypeORM guarda la fecha en que se borró cada registro, en vez de eliminarlo físicamente de la tabla
    deleteAt!: Date;
}