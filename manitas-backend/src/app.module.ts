import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClienteModule } from './cliente/cliente.module';
import { ProfesionalModule } from './profesional/profesional.module';
import { TipoDeServicioModule } from './tipo-de-servicio/tipo-de-servicio.module';
import { EspecialidadModule } from './especialidad/especialidad.module';
import { PrecioBaseModule } from './precio-base/precio-base.module';
import { UsuarioModule } from './usuario/usuario.module';
import { LocalidadModule } from './localidad/localidad.module';
import { ProvinciaModule } from './provincia/provincia.module';
import { ZonaModule } from './zona/zona.module';

/*
--Imports innecesarios que se usaron cuando se resolvió por capas.
import { ClienteController } from './controllers/ClienteController';
import { ClienteService } from './services/ClienteService';
import { Cliente } from './entities/Cliente';
import { EspecialidadController } from './controllers/EspecialidadController';
import { EspecialidadService } from './services/EspecialidadService';
import { Especialidad } from './entities/Especialidad';
import { LocalidadController } from './controllers/LocalidadController';
import { LocalidadService } from './services/LocalidadService';
import { Localidad } from './entities/Localidad';
import { MetodoDePagoController } from './controllers/MetodoDePagoController';
import { MetodoDePagoService } from './services/MetodoDePagoService';
import { MetodoDePago } from './entities/MetodoDePago';
import { ProfesionalController } from './controllers/ProfesionalController';
import { ProfesionalService } from './services/ProfesionalService';
import { Profesional } from './entities/Profesional';
import { PromocionController } from './controllers/PromocionController';
import { PromocionService } from './services/PromocionService';
import { Promocion } from './entities/Promocion';
import { ProvinciaController } from './controllers/ProvinciaController';
import { ProvinciaService } from './services/ProvinciaService';
import { Provincia } from './entities/Provincia';
import { SolicitudDeServicioController } from './controllers/SolicitudDeServicioController';
import { SolicitudDeServicioService } from './services/SolicitudDeServicioService';
import { SolicitudDeServicio } from './entities/SolicitudDeServicio';
import { TipoDeServicioController } from './controllers/TipoDeServicioController';
import { TipoDeServicioService } from './services/TipoDeServicioService';
import { TipoDeServicio } from './entities/TipoDeServicio';
import { UsuarioController } from './controllers/UsuarioController';
import { UsuarioService } from './services/UsuarioService';
import { Usuario } from './entities/Usuario';
import { ZonaController } from './controllers/ZonaController';
import { ZonaService } from './services/ZonaService';
import { Zona } from './entities/Zona';*/
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
        entities: [__dirname + '/**/*.entity{.ts,.js}'], //también hubiera sido válido autoLoadEntities: true,
        //En la línea 58 las entidades se generan automáticamente.
        synchronize: true, //En esta línea las entidades se sincronizan con los controladores y servicios.
      }),
    }),
    ClienteModule,
    ProfesionalModule,
    TipoDeServicioModule,
    EspecialidadModule,
    PrecioBaseModule,
    UsuarioModule,
    LocalidadModule,
    ProvinciaModule,
    ZonaModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}