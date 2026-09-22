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
import { PromocionModule } from './promocion/promocion.module';
import { MetodoDePagoModule } from './metodo-de-pago/metodo-de-pago.module';
import { SolicitudDeServicioModule } from './solicitud-de-servicio/solicitud-de-servicio.module';


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
          //En la línea 71 las entidades se generan automáticamente.
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
    ZonaModule,
    PromocionModule,
    MetodoDePagoModule,
    SolicitudDeServicioModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

/*
  imports: [


  ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRootAsync({
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get('DB_HOST'),
        port: config.get('DB_PORT'),
        username: config.get('DB_USERNAME'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_NAME'),


   



*/