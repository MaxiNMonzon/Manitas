import { Column, Entity, PrimaryGeneratedColumn, DeleteDateColumn } from "typeorm";

@Entity()
export class Usuario {
    @PrimaryGeneratedColumn()
    idUsuario!: number;               //AVISAR!!!!!!!!!!
    
    @Column()
    dni!: number;

    @Column()
    nombre!: string;

    @Column()
    apellido!: string;
    
    @Column()
    correo!: string;
    
    @Column()
    contraseña!: string;
    
    @Column()
    telefono!: number;
    
    @Column()
    rol!: string;

    @DeleteDateColumn() //es necesario ?? TypeORM guarda la fecha en que se borró cada registro, en vez de eliminarlo físicamente de la tabla
    deleteAt!: Date;
}
