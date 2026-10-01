import { Column, Entity, PrimaryGeneratedColumn, DeleteDateColumn } from "typeorm";


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
    
    @Column({ type: 'varchar', length: 255, nullable: false })
    contraseña!: string;
 
    @Column({ nullable: true })
    telefono!: string;
    
    @Column({ type: 'varchar', length: 50, default: 'cliente' })
    rol!: string;

    @Column({ type: 'timestamp', nullable: true, default: null })
    fechaBaja!: Date | null;

    @Column({ type: 'timestamp', nullable: true, default: null })
    fechaRehabilitacion!: Date | null;

    @DeleteDateColumn()
    deleteAt!: Date;

}






