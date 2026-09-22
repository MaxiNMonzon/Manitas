import { Column, DeleteDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { TipoDeServicio } from "../../tipo-de-servicio/entities/tipo-de-servicio.entity";
import { PrecioBase } from "../../precio-base/entities/precio-base.entity";

@Entity()
export class Especialidad {
    @PrimaryGeneratedColumn()
    idEspecialidad!: number;

    @Column()
    nombreEspecialidad!: string;

    @Column()
    descripcionEspecialidad!: string;
    
    @OneToMany (() => TipoDeServicio, (tipoDeServicio) => tipoDeServicio.especialidad)
    servicios!: TipoDeServicio[];

    @OneToMany(() => PrecioBase, (precioBase) => precioBase.especialidad)
    precios!: PrecioBase[];

    @DeleteDateColumn() //es necesario ?? TypeORM guarda la fecha en que se borró cada registro, en vez de eliminarlo físicamente de la tabla
    deleteAt!: Date;
}