# manitas-backend

API REST de Manitas: NestJS + TypeORM + MySQL, autenticación con JWT y pagos con Mercado Pago (modo prueba).

## Uso

```bash
pnpm install
cp .env.example .env     # completar (ver comentarios del archivo)
pnpm run start:dev        # http://localhost:3000 · documentación Swagger en http://localhost:3000/api
```

| Script | Para qué |
| --- | --- |
| `pnpm run start:dev` | Desarrollo (se reinicia al guardar) |
| `pnpm run build` / `pnpm run start:prod` | Producción (`node dist/main`) |
| `pnpm test` | Tests unitarios (Jest) |
| `pnpm run test:e2e` | Test de integración (Jest + Supertest) |
| `pnpm run seed:georef` | Provincias y localidades de Argentina ([SEED.md](SEED.md)) |
| `pnpm run seed:demo` | Datos y cuentas de prueba ([SEED.md](SEED.md)) |

## Estructura

Un módulo por funcionalidad en `src/` (`auth`, `cliente`, `profesional`, `solicitud-de-servicio`, `turno`,
`payments`, `consulta`, catálogos...). Cada uno con su controlador (HTTP), servicio (lógica de negocio), DTOs
(validación) y entidades (TypeORM).

Documentación completa del proyecto: [../docs](../docs/README.md).