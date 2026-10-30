// Versión mínima de @nestjs/typeorm SOLO para los tests (Jest).
// El paquete real se publica como ESM (usa import.meta) y Jest no lo puede cargar en modo CommonJS.
// En los tests unitarios no hay base de datos: los repositorios se reemplazan por objetos simulados,
// así que alcanza con que @InjectRepository y getRepositoryToken usen el mismo token.
import { Inject, Module } from '@nestjs/common';

type Entidad = { name: string } | string;

export const getRepositoryToken = (entidad: Entidad) => `${typeof entidad === 'string' ? entidad : entidad.name}Repository`;

export const InjectRepository = (entidad: Entidad) => Inject(getRepositoryToken(entidad));

// Para que los módulos que importan TypeOrmModule se puedan importar en un test (no conecta a nada)
@Module({})
export class TypeOrmModule {
  static forFeature() {
    return { module: TypeOrmModule };
  }
  static forRoot() {
    return { module: TypeOrmModule };
  }
  static forRootAsync() {
    return { module: TypeOrmModule };
  }
}