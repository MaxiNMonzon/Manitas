// Borra las CUENTAS DE PRUEBA (las del seed viejo y las que se crearon probando la API) con todo lo suyo:
// solicitudes, turnos, horarios, matrículas y consultas de Ayuda. Las cuentas reales no se tocan.
//
// Uso:  pnpm run seed:limpiar   (después, pnpm run seed:demo para cargar la gente nueva)
//
// Se reconocen por el correo: @manitas.test (seed viejo), @test.com y @t.com (pruebas de la API).
// Se borran de verdad (no soft delete), así esos correos quedan libres.
import { NestFactory } from '@nestjs/core';
import { DataSource, In } from 'typeorm';
import { AppModule } from '../app.module';
import { Cliente } from '../cliente/entities/cliente.entity';
import { Profesional } from '../profesional/entities/profesional.entity';
import { Matricula } from '../profesional/entities/matricula.entity';
import { SolicitudDeServicio } from '../solicitud-de-servicio/entities/solicitud-de-servicio.entity';
import { Turno } from '../turno/entities/turno.entity';
import { HorarioLaboral } from '../turno/entities/horario-laboral.entity';
import { Consulta } from '../consulta/entities/consulta.entity';

const DOMINIOS_DE_PRUEBA = ['@manitas.test', '@test.com', '@t.com'];

const esDePrueba = (correo: string | null) => !!correo && DOMINIOS_DE_PRUEBA.some((dominio) => correo.toLowerCase().endsWith(dominio));

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn'] });
  try {
    const fuenteDeDatos = app.get(DataSource);

    // withDeleted: también las que estaban dadas de baja
    const clientes = (await fuenteDeDatos.getRepository(Cliente).find({ withDeleted: true })).filter((cliente) => esDePrueba(cliente.correo));
    const profesionales = (await fuenteDeDatos.getRepository(Profesional).find({ withDeleted: true })).filter((profesional) => esDePrueba(profesional.correo));
    const idsClientes = clientes.map((cliente) => cliente.idUsuario);
    const idsProfesionales = profesionales.map((profesional) => profesional.idUsuario);
    console.log(`Cuentas de prueba: ${clientes.length} clientes y ${profesionales.length} profesionales`);

    // Todo en una transacción: si algo falla, no queda nada a medio borrar
    await fuenteDeDatos.transaction(async (manager) => {
      // 1. Solicitudes donde participa alguno (sus turnos se borran solos: onDelete CASCADE)
      const solicitudes = await manager.find(SolicitudDeServicio, {
        where: [
          ...(idsClientes.length ? [{ cliente: { idUsuario: In(idsClientes) } }] : []),
          ...(idsProfesionales.length ? [{ profesional: { idUsuario: In(idsProfesionales) } }] : []),
        ],
        withDeleted: true,
      });
      if (solicitudes.length) await manager.delete(SolicitudDeServicio, { idSolicitud: In(solicitudes.map((solicitud) => solicitud.idSolicitud)) });
      console.log(`  - ${solicitudes.length} solicitudes`);

      if (idsProfesionales.length) {
        // 2. Lo que cuelga del profesional (las tablas de zonas, oficios y habilidades se limpian solas)
        const deEllos = { where: { profesional: { idUsuario: In(idsProfesionales) } }, withDeleted: true };
        await manager.remove(await manager.find(Turno, deEllos));
        await manager.remove(await manager.find(HorarioLaboral, deEllos));
        await manager.remove(await manager.find(Matricula, deEllos));
        await manager.delete(Profesional, { idUsuario: In(idsProfesionales) });
      }
      if (idsClientes.length) await manager.delete(Cliente, { idUsuario: In(idsClientes) });

      // 3. Consultas de Ayuda mandadas desde esas cuentas o con esos correos
      const consultas = (await manager.find(Consulta)).filter((consulta) => esDePrueba(consulta.correo) || esDePrueba(consulta.correoCuenta));
      if (consultas.length) await manager.delete(Consulta, { idConsulta: In(consultas.map((consulta) => consulta.idConsulta)) });
      console.log(`  - ${consultas.length} consultas de Ayuda`);
    });

    console.log('Listo. Ahora: pnpm run seed:demo');
  } finally {
    await app.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
