import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, DeleteDateColumn } from 'typeorm';
import { Profesional } from '../../profesional/entities/profesional.entity';
import { Especialidad } from '../../especialidad/entities/especialidad.entity';

@Entity()
export class PrecioBase {
  @PrimaryGeneratedColumn()
  idPrecio!: number;   //PREGUNTAR SI ESTA BIEN QUE CREEMOS UN ID O DEJAMOS COMO CLAVE PRIMARIA UNA COMPUESTA

  @Column('decimal', { precision: 10, scale: 2 })
  precio!: number;

  @Column({ type: 'date' })
  fechaDesde!: Date;

  @ManyToOne(() => Profesional, (profesional) => profesional.precios)
  profesional!: Profesional;

  @ManyToOne(() => Especialidad, (especialidad) => especialidad.precios)
  especialidad!: Especialidad;

  @DeleteDateColumn() //es necesario ?? TypeORM guarda la fecha en que se borró cada registro, en vez de eliminarlo físicamente de la tabla
  deleteAt!: Date;
}