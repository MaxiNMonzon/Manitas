import { Column, Entity, PrimaryGeneratedColumn, DeleteDateColumn } from "typeorm";


@Entity('usuario')
export abstract class Usuario {
    @PrimaryGeneratedColumn()
    idUsuario!: number;  //El id debería ser único para cada usuario.
    
    @Column({ type: 'int' })
    dni!: number; //Es el mismo dni para dos números de cuenta distintos: cuenta cliente y cuenta profesional.

    @Column({ type: 'varchar', length: 100 })
    nombre!: string;

    @Column({ type: 'varchar', length: 100 })
    apellido!: string;

    @Column({ type: 'date' })
    fechaNacimiento!: Date;
    
    @Column({ type: 'varchar', length: 150, unique: true })
    correo!: string;
    
    @Column({ type: 'varchar', length: 255 })
    contraseña!: string;
    
    @Column({ type: 'bigint' })
    telefono!: number;
    
    @Column({ type: 'varchar', length: 50, default: 'cliente' })
    rol!: string;

    @Column({ type: 'timestamp', nullable: true, default: null })
    fechaBaja!: Date | null;

    @Column({ type: 'timestamp', nullable: true, default: null })
    fechaRehabilitacion!: Date | null;

    @DeleteDateColumn() //es necesario ?? TypeORM guarda la fecha en que se borró cada registro, en vez de eliminarlo físicamente de la tabla
    deleteAt!: Date;
}

