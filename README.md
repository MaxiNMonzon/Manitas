# Manitas

Aplicación web que conecta a clientes con profesionales de oficios (plomería, electricidad, gas, pintura y más) para
resolver arreglos del hogar.

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

## Tecnologías

- **Back:** NestJS 11, TypeScript, TypeORM, MySQL, JWT + bcryptjs, class-validator, Swagger y Mercado Pago (Checkout
  Pro). Se instala con **pnpm**.
- **Front:** React 19, TypeScript, Vite, Material UI y React Router. Se instala con **npm**.

## Documentación

- [Cómo instalar y ejecutar](docs/instalacion.md)
- [Documentación de la API](docs/api.md) · Swagger: https://manitas-api-hv16.onrender.com/api
- [Tests y evidencia](docs/tests.md)
- [Deploy y credenciales](docs/deploy.md)
- [Todo el TP (propuesta, minutas, seguimiento)](docs/README.md)
