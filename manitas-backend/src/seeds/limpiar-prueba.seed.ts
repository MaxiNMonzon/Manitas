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

const esDePrueba = (correo: string | null) => !!correo && DOMINIOS_DE_PRUEBA.some((d) => correo.toLowerCase().endsWith(d));

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn'] });
  try {
    const ds = app.get(DataSource);

    // withDeleted: también las que estaban dadas de baja
    const clientes = (await ds.getRepository(Cliente).find({ withDeleted: true })).filter((c) => esDePrueba(c.correo));
    const profesionales = (await ds.getRepository(Profesional).find({ withDeleted: true })).filter((p) => esDePrueba(p.correo));
    const idsClientes = clientes.map((c) => c.idUsuario);
    const idsProfesionales = profesionales.map((p) => p.idUsuario);
    console.log(`Cuentas de prueba: ${clientes.length} clientes y ${profesionales.length} profesionales`);

    // Todo en una transacción: si algo falla, no queda nada a medio borrar
    await ds.transaction(async (m) => {
      // 1. Solicitudes donde participa alguno (sus turnos se borran solos: onDelete CASCADE)
      const solicitudes = await m.find(SolicitudDeServicio, {
        where: [
          ...(idsClientes.length ? [{ cliente: { idUsuario: In(idsClientes) } }] : []),
          ...(idsProfesionales.length ? [{ profesional: { idUsuario: In(idsProfesionales) } }] : []),
        ],
        withDeleted: true,
      });
      if (solicitudes.length) await m.delete(SolicitudDeServicio, { idSolicitud: In(solicitudes.map((s) => s.idSolicitud)) });
      console.log(`  - ${solicitudes.length} solicitudes`);

      if (idsProfesionales.length) {
        // 2. Lo que cuelga del profesional (las tablas de zonas, oficios y habilidades se limpian solas)
        const deEllos = { where: { profesional: { idUsuario: In(idsProfesionales) } }, withDeleted: true };
        await m.remove(await m.find(Turno, deEllos));
        await m.remove(await m.find(HorarioLaboral, deEllos));
        await m.remove(await m.find(Matricula, deEllos));
        await m.delete(Profesional, { idUsuario: In(idsProfesionales) });
      }
      if (idsClientes.length) await m.delete(Cliente, { idUsuario: In(idsClientes) });

      // 3. Consultas de Ayuda mandadas desde esas cuentas o con esos correos
      const consultas = (await m.find(Consulta)).filter((c) => esDePrueba(c.correo) || esDePrueba(c.correoCuenta));
      if (consultas.length) await m.delete(Consulta, { idConsulta: In(consultas.map((c) => c.idConsulta)) });
      console.log(`  - ${consultas.length} consultas de Ayuda`);
    });

    console.log('Listo. Ahora: pnpm run seed:demo');
  } finally {
    await app.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});