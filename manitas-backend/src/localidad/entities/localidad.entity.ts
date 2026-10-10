import { Column, Entity, OneToMany, PrimaryGeneratedColumn, ManyToOne, DeleteDateColumn } from "typeorm";
import { Provincia } from "../../provincia/entities/provincia.entity";
import { Zona } from "../../zona/entities/zona.entity";

@Entity()
export class Localidad {
    @PrimaryGeneratedColumn()
    idLocalidad!: number;
    
    // Opcional: la API Georef (de donde sale el catalogo) no trae codigo postal
    @Column({ type: 'varchar', nullable: true })
    codigoPostal!: string | null;
    
    @Column()
    nombreLocalidad!: string;

    // Id oficial de la API Georef (ej: "8202129002"). Lo usa el seed para no duplicar
    @Column({ type: 'varchar', length: 20, unique: true, nullable: true })
    idGeoref!: string | null;
    
    @ManyToOne(() => Provincia, (provincia) => provincia.localidades)
    provincia!: Provincia;
    
    @OneToMany (() => Zona, (zonas) => zonas.localidad)
    zonas!: Zona[];

    @DeleteDateColumn()
    deletedAt!: Date;
}
