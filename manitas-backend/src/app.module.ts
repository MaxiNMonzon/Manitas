import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';

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
import { Zona } from './entities/Zona';
@Module({
  imports: [
TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '',
      database: 'manitas',
      autoLoadEntities: true,
      //entities: [Localidad], con autoLoadEntities: true
      //ya no es necesario especificar manualmente las entidades.
      synchronize: true,
    }),

    TypeOrmModule.forFeature([
      Cliente, Especialidad, Localidad, MetodoDePago,
      Profesional, Promocion, Provincia,
      SolicitudDeServicio, TipoDeServicio, Usuario, Zona
    ]),

  ],
  controllers: [AppController, ClienteController,
    EspecialidadController, LocalidadController,
    MetodoDePagoController, ProfesionalController, 
    PromocionController, ProvinciaController, 
    SolicitudDeServicioController, TipoDeServicioController,
    UsuarioController, ZonaController

  ],
  providers: [AppService, 
    ClienteService, EspecialidadService, LocalidadService, 
    MetodoDePagoService, ProfesionalService, PromocionService, 
    ProvinciaService, SolicitudDeServicioService, TipoDeServicioService,
    UsuarioService, ZonaService
    
  ],
})
export class AppModule {}