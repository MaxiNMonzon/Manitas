# Instalación y ejecución

Manitas tiene dos partes independientes que se comunican por una API REST:

| Parte | Carpeta | Tecnología | Puerto |
| --- | --- | --- | --- |
| Backend (API) | `manitas-backend` | NestJS + TypeORM + MySQL | 3000 |
| Frontend | `manitas-frontend` | React + Vite + Material UI | 5173 |

## Requisitos

- [Node.js](https://nodejs.org) 22 o superior (incluye `npm`).
- [MySQL](https://dev.mysql.com/downloads/) 8 o superior, con una base creada (por ejemplo `manitas`). Las tablas se crean solas al iniciar el back.
- Para pagar: una cuenta de vendedor de prueba de [Mercado Pago](https://www.mercadopago.com.ar/developers) (solo el *access token*).
- Para los tests end-to-end del front: Google Chrome instalado (o `npx playwright install chromium`).

## 1. Backend

```bash
cd manitas-backend
npm install
cp .env.example .env      # en Windows: copy .env.example .env
```

Completar el `.env` (cada variable está explicada en [`.env.example`](../manitas-backend/.env.example)):
la conexión a MySQL (`DB_*`), `JWT_SECRET`, `ADMIN_CORREO` / `ADMIN_CONTRASENA` y `MERCADOPAGO_ACCESS_TOKEN`.

```bash
npm run start:dev         # API en http://localhost:3000 (se reinicia al guardar cambios)
```

La documentación interactiva de la API queda en **http://localhost:3000/api** (Swagger).

### Datos iniciales (opcional pero recomendado)

```bash
npm run seed:georef       # provincias y localidades de Argentina (API Georef del Gobierno)
npm run seed:demo         # oficios, zonas, clientes, profesionales, solicitudes y promociones de prueba
```

`seed:demo` crea cuentas de prueba con contraseña **`Manitas123`** (detalle en [`SEED.md`](../manitas-backend/SEED.md)).
Se puede correr varias veces: no duplica ni modifica lo que ya existe.

## 2. Frontend

```bash
cd manitas-frontend
npm install
cp .env.example .env      # opcional: por defecto usa http://localhost:3000
npm run dev               # http://localhost:5173
```

En la pantalla de login (modo desarrollo) hay botones para entrar directo con las cuentas de prueba, y una
**sesión demo** que funciona sin back (con datos de ejemplo).

## 3. Tests

| Comando | Dónde | Qué corre |
| --- | --- | --- |
| `npm test` | `manitas-backend` | Tests unitarios (Jest) |
| `npm run test:e2e` | `manitas-backend` | Test de integración de la API (Jest + Supertest) |
| `npm test` | `manitas-frontend` | Test unitario de componentes (Vitest + Testing Library) |
| `npm run test:e2e` | `manitas-frontend` | Tests end-to-end en el navegador (Playwright) |

Ninguno necesita la base de datos. Ver [tests.md](tests.md).

## 4. Build de producción

```bash
cd manitas-backend && npm run build && npm run start:prod     # node dist/main
cd manitas-frontend && npm run build                          # genera dist/ (archivos estáticos)
```

Ver [deploy.md](deploy.md).
