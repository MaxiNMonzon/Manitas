import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClienteModule } from './cliente/cliente.module';
import { ProfesionalModule } from './profesional/profesional.module';
import { TiposDeServicioModule } from './tipos-de-servicio/tipos-de-servicio.module';
import { EspecialidadModule } from './especialidad/especialidad.module';
import { PrecioBaseModule } from './precio-base/precio-base.module';
import { UsuarioModule } from './usuario/usuario.module';
import { LocalidadModule } from './localidad/localidad.module';
import { ZonaModule } from './zona/zona.module';

@Module({
  imports: [
    ConfigModule.forRoot({ 
      isGlobal: true,
      envFilePath: '.env', // Asegura la lectura explícita
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 3306),
        username: config.get<string>('DB_USERNAME', 'root'),
        password: config.get<string>('DB_PASSWORD', 'root'),
        database: config.get<string>('DB_NAME', 'manitas'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
      }),
    }),
    EspecialidadModule,
    PrecioBaseModule,
    LocalidadModule,
    ClienteModule,
    ProfesionalModule,
    UsuarioModule,
    TiposDeServicioModule,
    ZonaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}