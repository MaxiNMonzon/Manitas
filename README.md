# Manitas

Aplicación web que conecta a clientes con profesionales de oficios (plomería, electricidad, gas, pintura y más) para
resolver arreglos del hogar. TP de Desarrollo de Software — UTN FRRo.

## Integrantes

| Legajo | Nombre |
| --- | --- |
| 56821 | Arias, Francisco José |
| 52098 | Monzón, Maximiliano Nicolás |
| 54456 | Baremboum, Micaela |
| 42062 | Coria, Lautaro |

## Links

| | |
| --- | --- |
| App publicada | https://manitas-sigma.vercel.app |
| API publicada | https://manitas-api-hv16.onrender.com (documentación en [`/api`](https://manitas-api-hv16.onrender.com/api)) |
| Credenciales de prueba | [docs/deploy.md](docs/deploy.md) |
| Video de la app funcionando | |
| Documentación del TP | [docs/](docs/README.md) |
| Propuesta | [docs/proposal.md](docs/proposal.md) |

## Repositorio

Un solo repositorio con el back y el front en carpetas separadas, independientes entre sí, que se comunican por una
API REST:

- [`manitas-backend`](manitas-backend) — API con NestJS
- [`manitas-frontend`](manitas-frontend) — app web con React

## Tema

El cliente busca profesionales de su zona, les pide presupuesto eligiendo un turno libre del calendario y compara los
presupuestos que recibe. Si es algo urgente, lo pide sin elegir profesional: les aparece a todos los de ese oficio en
su zona y el primero que acepta va. Los profesionales cargan su horario de trabajo, presupuestan después de la visita
y reciben calificaciones. Los clientes pagan desde la app con Mercado Pago (tarjeta de crédito, débito o saldo), y la
app informa las promociones bancarias del mes (el reintegro lo hace el banco). Apunta a brindar rapidez, confianza y
variedad de opciones.

## Modelo de dominio

<img width="1952" height="1460" alt="Modelo de dominio" src="https://github.com/user-attachments/assets/2a46b12c-2fc9-42fa-8c27-c8afcc278906" />

[Ver el modelo en Google Drive](https://drive.google.com/file/d/1yA9dty0EUn0jITPk4veSDCFWdFEMilrt/view)

**Estados de la solicitud:** `solicitado` → el profesional acepta (`agendado`) o rechaza (`rechazado`) → visita →
`presupuestado` → el cliente acepta (`contratado`) o rechaza (`rechazado`) → paga → `finalizado` → califica al
profesional. Además: `reprogramacion` (alguno de los dos propone otro horario), `cancelado` y `expirado` (sin
respuesta a tiempo).

## Alcance funcional

### Regularidad

| Req | Detalle |
| :--- | :--- |
| **CRUD simple** | 1. CRUD Usuario (Cliente y Profesional)<br>2. CRUD Tipo de Servicio<br>3. CRUD Localidad<br>4. CRUD Método de Pago |
| **CRUD dependiente** | 1. CRUD Zona {depende de} CRUD Localidad<br>2. CRUD Profesional {depende de} CRUD Especialidad |
| **Listado + detalle** | 1. Tipo de Servicio por Especialidad<br>2. Profesional por Especialidad (y zona) |
| **CUU/Epic** | 1. Solicitar presupuesto<br>2. Calificar profesional<br>3. Informar promociones bancarias del mes<br>4. Notificar próximas visitas |

### Adicionales para Aprobación

| Req | Detalle |
| :--- | :--- |
| **CRUD** | 1. CRUD Usuario (Cliente y Profesional)<br>2. CRUD Tipo de Servicio<br>3. CRUD Localidad<br>4. CRUD Método de Pago<br>5. CRUD Zona |
| **CUU/Epic** | 1. Solicitar presupuesto<br>2. Coordinar visita (elegir y reprogramar turnos)<br>3. Confirmar servicio (aceptar el presupuesto)<br>4. Abonar servicio<br>5. Calificar profesional<br>6. Informar promociones bancarias del mes<br>7. Notificar próximas visitas |

"Solicitar servicio" se unió con "Solicitar presupuesto" (el cliente siempre pide presupuesto primero) y "Calificar
servicio" con "Calificar profesional".

**Extras:** servicio urgente, turnos con calendario, pago con Mercado Pago (modo prueba), consultas desde la sección
Ayuda y login con 3 roles (cliente, profesional y administrador).

## Tecnologías

- **Back:** NestJS 11, TypeScript, TypeORM, MySQL, JWT + bcryptjs, class-validator, Swagger y Mercado Pago (Checkout
  Pro). Se instala con **pnpm**.
- **Front:** React 19, TypeScript, Vite, Material UI y React Router. Se instala con **npm**.

## Cómo instalar y ejecutar

**Requisitos:** [Node.js](https://nodejs.org) 22 o superior, [pnpm](https://pnpm.io) (`npm install -g pnpm`) y
[MySQL](https://dev.mysql.com/downloads/) 8 o superior con una base vacía creada (por ejemplo `manitas`). Las tablas
se crean solas al levantar el back.

### 1. Back

```bash
cd manitas-backend
pnpm install
cp .env.example .env       # en Windows: copy .env.example .env
```

Completar el `.env` con los datos de MySQL, una clave para `JWT_SECRET` y el correo y la contraseña del
administrador (cada variable está explicada en el archivo). Después:

```bash
pnpm run start:dev         # API en http://localhost:3000
```

### 2. Datos de prueba (recomendado)

En `manitas-backend`, con el `.env` completo:

```bash
pnpm run seed:georef       # provincias y localidades de Argentina
pnpm run seed:demo         # oficios, zonas, clientes, profesionales, solicitudes y promociones
```

Las cuentas que crea tienen la contraseña `Manitas123` (por ejemplo `valeriagodoy.ros@gmail.com` como cliente y
`raulbustos.plomeria@gmail.com` como profesional). El administrador no se registra: entra con el correo y la
contraseña del `.env`. Más detalle en [SEED.md](manitas-backend/SEED.md).

### 3. Front

En otra terminal, con el back levantado:

```bash
cd manitas-frontend
npm install
npm run dev                # app en http://localhost:5173
```

La guía completa (variables, Mercado Pago, build de producción) está en [docs/instalacion.md](docs/instalacion.md).

## Documentación de la API

Con el back levantado: **http://localhost:3000/api** (Swagger), o la versión publicada en
https://manitas-api-hv16.onrender.com/api. Muestra todas las rutas agrupadas, qué rol puede usar cada una, los errores
y ejemplos; con el botón **Authorize** se pega el token del login y se pueden probar. Resumen en
[docs/api.md](docs/api.md).

## Tests

| Comando | Carpeta | Qué corre |
| --- | --- | --- |
| `pnpm test` | `manitas-backend` | Tests unitarios (Jest) |
| `pnpm run test:e2e` | `manitas-backend` | Test de integración de la API (Jest + Supertest) |
| `npm test` | `manitas-frontend` | Test unitario de componentes (Vitest + Testing Library) |
| `npm run test:e2e` | `manitas-frontend` | Tests end-to-end en el navegador (Playwright) |

La evidencia de la última ejecución está en [docs/evidencia-tests/](docs/tests.md).

## Documentación

Toda la documentación del TP está en [docs/](docs/README.md): propuesta, instalación, API, evidencia de los tests,
deploy, minutas y seguimiento.
