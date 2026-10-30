# manitas-backend

API REST de Manitas: NestJS + TypeORM + MySQL, autenticación con JWT y pagos con Mercado Pago (modo prueba).

## Uso

```bash
npm install
cp .env.example .env     # completar (ver comentarios del archivo)
npm run start:dev        # http://localhost:3000 · documentación Swagger en http://localhost:3000/api
```

| Script | Para qué |
| --- | --- |
| `npm run start:dev` | Desarrollo (se reinicia al guardar) |
| `npm run build` / `npm run start:prod` | Producción (`node dist/main`) |
| `npm test` | Tests unitarios (Jest) |
| `npm run test:e2e` | Test de integración (Jest + Supertest) |
| `npm run seed:georef` | Provincias y localidades de Argentina ([SEED.md](SEED.md)) |
| `npm run seed:demo` | Datos y cuentas de prueba ([SEED.md](SEED.md)) |

## Estructura

Un módulo por funcionalidad en `src/` (`auth`, `cliente`, `profesional`, `solicitud-de-servicio`, `turno`,
`payments`, `consulta`, catálogos...). Cada uno con su controlador (HTTP), servicio (lógica de negocio), DTOs
(validación) y entidades (TypeORM).

Documentación completa del proyecto: [../docs](../docs/README.md).
