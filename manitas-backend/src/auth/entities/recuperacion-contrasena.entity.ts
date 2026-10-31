import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

// Un pedido de "olvidé mi contraseña": se manda por mail un link con un codigo que sirve una sola vez
// y vence a los 30 minutos. El codigo no se guarda: se guarda su hash (si alguien ve la base, no le sirve)
@Entity()
export class RecuperacionContrasena {
  @PrimaryGeneratedColumn()
  idRecuperacion!: number;

  @Column({ length: 120 })
  correo!: string;

  // Cliente y profesional son tablas distintas: hay que saber en cual buscar
  @Column({ length: 15 })
  rol!: 'cliente' | 'profesional';

  @Index({ unique: true })
  @Column({ length: 64 })
  codigoHash!: string;

  @Column({ type: 'datetime' })
  vence!: Date;

  // Se marca al usarlo (o cuando se pide uno nuevo): no se puede usar dos veces
  @Column({ default: false })
  usado!: boolean;

  @CreateDateColumn({ type: 'datetime' })
  fecha!: Date;
}