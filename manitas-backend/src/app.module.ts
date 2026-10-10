import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClienteModule } from './cliente/cliente.module';
import { ProfesionalModule } from './profesional/profesional.module';
import { TiposDeServicioModule } from './tipos-de-servicio/tipos-de-servicio.module';
import { EspecialidadModule } from './especialidad/especialidad.module';
import { LocalidadModule } from './localidad/localidad.module';
import { ZonaModule } from './zona/zona.module';
import { PromocionModule } from './promocion/promocion.module';
import { MetodoDePagoModule } from './metodo-de-pago/metodo-de-pago.module';
import { SolicitudDeServicioModule } from './solicitud-de-servicio/solicitud-de-servicio.module';
import { AuthModule } from './auth/auth.module';
import { TarjetaModule } from './tarjeta/tarjeta.module';

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
    LocalidadModule,
    ClienteModule,
    ProfesionalModule,
    TiposDeServicioModule,
    ZonaModule,
    PromocionModule,
    MetodoDePagoModule,
    SolicitudDeServicioModule,
    AuthModule,
    TarjetaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}