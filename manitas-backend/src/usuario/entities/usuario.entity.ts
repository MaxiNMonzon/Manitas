import { Column, PrimaryGeneratedColumn, DeleteDateColumn } from "typeorm";
import { Exclude } from "class-transformer";

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

    @Column({unique:true, nullable: false})
    correo!: string;
    
    @Exclude()
    @Column({nullable: false})
    contraseña!: string;
    
    @Column()
    telefono!: string;

    @DeleteDateColumn()
    deleteAt!: Date;
}