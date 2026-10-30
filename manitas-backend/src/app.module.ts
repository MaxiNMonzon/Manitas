import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
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
import { TurnoModule } from './turno/turno.module';
import { PaymentsModule } from './payments/payments.module';
import { ConsultaModule } from './consulta/consulta.module';

@Module({
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
        // Las bases en la nube (ej: Aiven) piden conexion segura: DB_SSL=true en el servidor (en local no hace falta).
        // DB_SSL_CA es el certificado del proveedor (el "CA certificate"), con el que se verifica que la base sea la real
        ssl: config.get('DB_SSL') === 'true' ? { ca: config.get<string>('DB_SSL_CA')?.replace(/\\n/g, '\n') } : undefined,
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
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
    TurnoModule,
    PaymentsModule,
    ConsultaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
