import { Column, DeleteDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Cliente } from "../../cliente/entities/cliente.entity";
import { MetodoDePago } from "../../metodo-de-pago/entities/metodo-de-pago.entity";

// Nunca se guarda el numero completo ni el codigo de seguridad,
// solo los ultimos 4 digitos para que el cliente la reconozca
@Entity()
export class Tarjeta {
    @PrimaryGeneratedColumn()
    idTarjeta!: number;

    @Column()
    alias!: string;

    @Column({ length: 4 })
    ultimosDigitos!: string;

    @Column()
    mesVencimiento!: number;

    @Column()
    anioVencimiento!: number;

    @ManyToOne(() => Cliente, (cliente) => cliente.tarjetas, { nullable: false })
    cliente!: Cliente;

    @ManyToOne(() => MetodoDePago, (metodoDePago) => metodoDePago.tarjetas, { nullable: false })
    metodoDePago!: MetodoDePago;

    @DeleteDateColumn()
    deleteAt!: Date;
}
