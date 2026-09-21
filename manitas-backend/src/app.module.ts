import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TiposDeServicioModule } from './tipos-de-servicio/tipos-de-servicio.module';
import { EspecialidadModule } from './especialidad/especialidad.module';
import { PrecioBaseModule } from './precio-base/precio-base.module';
import { UsuarioModule } from './usuario/usuario.module';
import { LocalidadModule } from './localidad/localidad.module';
import { ZonaModule } from './zona/zona.module';
import { PromocionModule } from './promocion/promocion.module';
import { MetodoDePagoModule } from './metodo-de-pago/metodo-de-pago.module';
import { SolicitudDeServicioModule } from './solicitud-de-servicio/solicitud-de-servicio.module';

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
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
      }),
    }),
    TiposDeServicioModule,
    EspecialidadModule,
    PrecioBaseModule,
    UsuarioModule,
    LocalidadModule,
    ZonaModule,
    PromocionModule,
    MetodoDePagoModule,
    SolicitudDeServicioModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
