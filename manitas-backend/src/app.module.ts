import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { join } from 'path';
import { TiposDeServicioModule } from './tipos-de-servicio/tipos-de-servicio.module';
import { EspecialidadModule } from './especialidad/especialidad.module';
import { LocalidadModule } from './localidad/localidad.module';
import { ZonaModule } from './zona/zona.module';
import { PromocionModule } from './promocion/promocion.module';
import { MetodoDePagoModule } from './metodo-de-pago/metodo-de-pago.module';
import { SolicitudDeServicioModule } from './solicitud-de-servicio/solicitud-de-servicio.module';
import { ClienteModule } from './cliente/cliente.module';
import { ProfesionalModule } from './profesional/profesional.module';
import { AuthModule } from './auth/auth.module';
import { TarjetaModule } from './tarjeta/tarjeta.module';
import { TurnoModule } from './turno/turno.module';
import { PaymentsModule } from './payments/payments.module';



@Module({

  imports: [

       ConfigModule.forRoot({ 
          isGlobal: true,
          envFilePath: join(__dirname, '..', '.env'), // Asegura la lectura explícita 
        }),
       TypeOrmModule.forRootAsync({
         imports: [ConfigModule],
         inject: [ConfigService],
          useFactory: (config: ConfigService) => ({
            type: 'mysql',
            host: config.get<string>('DB_HOST'),
            port: config.get<number>('DB_PORT'),
            username: config.get<string>('DB_USERNAME'),
            password: config.get<string>('DB_PASSWORD'),
            database: config.get<string>('DB_NAME'),
            entities: [__dirname + '/**/*.entity{.ts,.js}'], //también hubiera sido válido autoLoadEntities: true,
          //En la línea 71 las entidades se generan automáticamente.
            synchronize: true, //En esta línea las entidades se sincronizan con los controladores y servicios.

      //  ssl: {
      //      rejectUnauthorized: false, // Requerido habitualmente para Aiven Cloud
   // },
      }),
    }),
    TiposDeServicioModule,
    EspecialidadModule,
    LocalidadModule,
    ZonaModule,
    PromocionModule,
    MetodoDePagoModule,
    SolicitudDeServicioModule,
    ClienteModule,
    ProfesionalModule,
    AuthModule,
    TarjetaModule,
    TurnoModule,
    PaymentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
