import { Column, PrimaryGeneratedColumn, DeleteDateColumn } from "typeorm";

export abstract class Usuario {
    @PrimaryGeneratedColumn()
    idUsuario!: number;               //AVISAR!!!!!!!!!!
    
    @Column()
    dni!: number;

    @Column()
    nombre!: string;

    @Column()
    apellido!: string;

    @Column({ type: 'date' })
    fechaNacimiento!: Date;

    @Column()
    correo!: string;
    
    @Column()
    contraseña!: string;
    
    @Column()
    telefono!: number;

    @DeleteDateColumn() //es necesario ?? TypeORM guarda la fecha en que se borró cada registro, en vez de eliminarlo físicamente de la tabla
    deleteAt!: Date;
}
