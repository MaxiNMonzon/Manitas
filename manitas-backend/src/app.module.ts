import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
//import { UsuarioModule } from './usuario/usuario.module'; //EVALUAR SI VA ADMIN O SE ELIMINA
import { ClienteModule } from './cliente/cliente.module';
import { ProfesionalModule } from './profesional/profesional.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '3306', 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      autoLoadEntities: true,
      synchronize: true, // Auto-crea las tablas en el MySQL local (YO YA LO TENGO INSTALADO)
    }),
    //UsuarioModule, //EVALUAR SI VA ADMIN O SE ELIMINA
    ClienteModule,
    ProfesionalModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
