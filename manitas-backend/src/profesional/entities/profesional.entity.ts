import { Column, Entity, ManyToOne, ManyToMany, JoinTable } from 'typeorm';
import { Usuario } from '../../usuario/entities/usuario.entity';
import { Provincia } from '../../provincia/entities/provincia.entity';
import { Zona } from '../../zona/entities/zona.entity';

@Entity('profesionales')
export class Profesional extends Usuario {
  @Column({ nullable: true })
  nroMatricula?: string;

  // Provincia única en la que el profesional decide prestar servicios
  @ManyToOne(() => Provincia, { nullable: false })
  provinciaOperacion!: Provincia;

  // Arreglo de zonas cubiertas por el profesional en esa provincia
  @ManyToMany(() => Zona, (zona) => zona.profesionales)
  @JoinTable({
    name: 'profesional_zonas_cobertura',
    joinColumn: { name: 'idProfesional', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'idZona', referencedColumnName: 'idZona' },
  })
  zonasDeCobertura!: Zona[];
}