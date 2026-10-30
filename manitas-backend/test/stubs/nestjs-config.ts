// Versión mínima de @nestjs/config SOLO para los tests (Jest): el paquete real se publica como ESM.
// Lee las variables de process.env, igual que el ConfigService real después de cargar el .env
import { Injectable, Module } from '@nestjs/common';

@Injectable()
export class ConfigService {
  get<T = string>(clave: string, porDefecto?: T): T | undefined {
    return (process.env[clave] as T | undefined) ?? porDefecto;
  }
}

@Module({ providers: [ConfigService], exports: [ConfigService] })
export class ConfigModule {
  static forRoot() {
    return { module: ConfigModule, global: true, providers: [ConfigService], exports: [ConfigService] };
  }
}