import { NestFactory, Reflector } from '@nestjs/core';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS: el navegador solo deja que una página le haga pedidos al back si el back la permite.
  // Se permiten solo las direcciones del front que estén en CORS_ORIGINS (separadas por coma);
  // si no está cargada (en local), solo el front de desarrollo de Vite
  const variables = app.get(ConfigService);
  const origenesPermitidos = (variables.get<string>('CORS_ORIGINS') ?? 'http://localhost:5173')
    .split(',')
    .map((origen) => origen.trim())
    .filter(Boolean);
  app.enableCors({ origin: origenesPermitidos });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  // Documentacion de la API: queda en http://localhost:3000/api
  const config = new DocumentBuilder()
    .setTitle('Manitas API')
    .setDescription(
      'Backend de Manitas: conecta clientes con profesionales de servicios del hogar.\n\n' +
        'Para las rutas con candado: hacer login (cliente, profesional o admin), copiar el token ' +
        'y pegarlo en el boton "Authorize".',
    )
    .setVersion('1.0')
    .addBearerAuth()
    // Los grupos en el orden en que se usa la app
    .addTag('Auth', 'Registrarse, iniciar sesion y ver mis datos')
    .addTag('Profesionales', 'Buscar profesionales, ver sus calificaciones y editar la cuenta de profesional')
    .addTag('Solicitudes de servicio', 'Todo el recorrido: solicitar presupuesto con un turno → visita → presupuesto → contratar → abonar → calificar')
    .addTag('Turnos', 'Horario fijo del profesional y sus turnos libres')
    .addTag('Pagos con Mercado Pago', 'La otra forma de pagar (modo prueba): ir a pagar al sitio de Mercado Pago y confirmar al volver')
    .addTag('Promociones', 'Promociones bancarias (reintegros por metodo de pago)')
    .addTag('Clientes', 'La cuenta del cliente')
    .addTag('Especialidades', 'Catalogo (lo maneja el admin)')
    .addTag('Tipos de servicio', 'Catalogo (lo maneja el admin)')
    .addTag('Metodos de pago', 'Catalogo (lo maneja el admin)')
    .addTag('Provincias', 'Catalogo (lo maneja el admin)')
    .addTag('Localidades', 'Catalogo (lo maneja el admin)')
    .addTag('Zonas', 'Catalogo (lo maneja el admin)')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();