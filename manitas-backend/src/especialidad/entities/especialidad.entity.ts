import { Column, DeleteDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { TiposDeServicio } from "../../tipos-de-servicio/entities/tipos-de-servicio.entity";
import { PrecioBase } from "../../precio-base/entities/precio-base.entity";

@Entity()
export class Especialidad {
    @PrimaryGeneratedColumn()
    idEspecialidad!: number;

    @Column()
    nombreEspecialidad!: string;

    @Column()
    descripcionEspecialidad!: string;
    
    @OneToMany (() => TiposDeServicio, (tiposDeServicio) => tiposDeServicio.especialidad)
    servicios!: TiposDeServicio[];

    @OneToMany(() => PrecioBase, (precioBase) => precioBase.especialidad)
    precios!: PrecioBase[];

    @DeleteDateColumn() //es necesario ?? TypeORM guarda la fecha en que se borró cada registro, en vez de eliminarlo físicamente de la tabla
    deleteAt!: Date;
}
