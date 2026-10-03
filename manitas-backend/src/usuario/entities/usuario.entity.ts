import { Column, Entity, PrimaryGeneratedColumn, DeleteDateColumn } from "typeorm";
import { Exclude } from "class-transformer";


@Entity('usuario')
export abstract class Usuario {
    @PrimaryGeneratedColumn()
    idUsuario!: number;  //El id debería ser único para cada usuario.
    
    @Column({ type: 'varchar' })
    dni!: string;

    @Column({ type: 'varchar', length: 100 })
    nombre!: string;

    @Column({ type: 'varchar', length: 100 })
    apellido!: string;

    @Column({ type: 'date' })
    fechaNacimiento!: Date;
    
    @Column({ type: 'varchar', length: 150, unique: true, nullable: false })
    correo!: string;
    
    @Exclude()
    @Column({ type: 'varchar', length: 255, nullable: false })
    contraseña!: string;
 
    @Column({ nullable: true })
    telefono!: string;

    @DeleteDateColumn()
    deleteAt!: Date;

}






