# Manitas

---------------------------------------------------------------------------------------------------------------------------------------------------
INTEGRANTES
---------------------------------------------------------------------------------------------------------------------------------------------------

56821 - Arias, Francisco Jose  
52098 - Monzon, Maximiliano Nicolas  
54456 - Baremboum, Micaela  
42062 - Coria, Lautaro  

---------------------------------------------------------------------------------------------------------------------------------------------------
REPOSITORIOS
---------------------------------------------------------------------------------------------------------------------------------------------------

Un solo repositorio con el back y el front en carpetas separadas, que se comunican por una API REST:

- [manitas-backend](manitas-backend) — API con NestJS
- [manitas-frontend](manitas-frontend) — app web con React

---------------------------------------------------------------------------------------------------------------------------------------------------
APP PUBLICADA
---------------------------------------------------------------------------------------------------------------------------------------------------

- Pagina: https://manitas-sigma.vercel.app
- API: https://manitas-api-hv16.onrender.com (documentacion en /api)
- Credenciales de prueba y servicios usados: [docs/deploy.md](docs/deploy.md)

---------------------------------------------------------------------------------------------------------------------------------------------------
TEMA
---------------------------------------------------------------------------------------------------------------------------------------------------

Aplicación que conecta clientes con profesionales de distintos oficios (plomería, electricidad, gas, pintura, etc.) para resolver tareas del hogar.
El cliente busca profesionales de su zona, les pide presupuesto eligiendo un turno de su calendario, y compara los presupuestos que recibe.
Si es algo urgente, lo pide sin elegir profesional: les aparece a todos los de ese oficio en su zona y el primero que acepta va.
Los profesionales cargan su horario de trabajo, presupuestan después de la visita y reciben calificaciones.
Los clientes pagan desde la app con Mercado Pago (con tarjeta de crédito, débito o saldo).
Informa las promociones bancarias del mes: el reintegro lo hace el banco (crédito: en el resumen · débito: en la cuenta).
Apunta a brindar rapidez, confianza y variedad de opciones.

---------------------------------------------------------------------------------------------------------------------------------------------------
MODELO
---------------------------------------------------------------------------------------------------------------------------------------------------

<img width="1301" height="752" alt="MD - DSW-MD drawio (1)" src="https://github.com/user-attachments/assets/c6a9bd41-b077-4243-87ec-42b62b63b720" />

https://drive.google.com/file/d/1yA9dty0EUn0jITPk4veSDCFWdFEMilrt/view

Estados de la solicitud:

`solicitado` → el profesional acepta (`agendado`) o rechaza (`rechazado`) → visita → `presupuestado` → el cliente acepta (`contratado`) o rechaza (`rechazado`) → paga → `finalizado` → califica al profesional.
Ademas: `reprogramacion` (alguno de los dos propone otro horario), `cancelado` y `expirado` (sin respuesta a tiempo).

---------------------------------------------------------------------------------------------------------------------------------------------------
ALCANCE FUNCIONAL
---------------------------------------------------------------------------------------------------------------------------------------------------
Alcance Mínimo
------------------------------------------------------------------------------
Regularidad:

| Req | Detalle |
| :--- | :--- |
| **CRUD simple** | 1. CRUD Usuario (Cliente y Profesional) <br>2. CRUD Tipo de Servicio <br>3. CRUD Localidad<br>4. CRUD Metodo de Pago|
| **CRUD dependiente** | 1. CRUD Zona {depende de} CRUD Localidad <br>2. CRUD Profesional {depende de} CRUD Especialidad|
| **Listado + detalle** | 1. Tipo de Servicio por Especialidad <br>2. Profesional por Especialidad (y zona)|
| **CUU/Epic** | 1. Solicitar presupuesto <br>2. Calificar profesional <br>3. Informar promociones bancarias del mes <br>4. Notificar próximas visitas|

Adicionales para Aprobación
| Req | Detalle |
| :--- | :--- |
| **CRUD** | 1. CRUD Usuario (Cliente y Profesional) <br>2. CRUD Tipo de Servicio <br>3. CRUD Localidad<br>4. CRUD Metodo de Pago <br>5. CRUD Zona|
| **CUU/Epic** | 1. Solicitar presupuesto<br>2. Coordinar visita (elegir y reprogramar turnos) <br>3. Confirmar servicio (aceptar el presupuesto)<br>4. Abonar servicio<br>5. Calificar profesional<br>6. Informar promociones bancarias del mes<br>7. Notificar próximas visitas|

"Solicitar servicio" se unio con "Solicitar presupuesto" (el cliente siempre pide presupuesto primero) y "Calificar servicio" con "Calificar profesional".

Extras que agregamos: servicio urgente, turnos con calendario, pago con Mercado Pago (sandbox), consultas desde la seccion Ayuda, login con 3 roles (cliente, profesional y administrador).

---------------------------------------------------------------------------------------------------------------------------------------------------
TECNOLOGIAS
---------------------------------------------------------------------------------------------------------------------------------------------------

- **Back:** NestJS 11, TypeScript, TypeORM, MySQL, JWT + bcryptjs para el login, class-validator, Swagger para documentar la API, Mercado Pago (Checkout Pro). Usa **pnpm**.
- **Front:** React 19, TypeScript, Vite, Material UI, React Router. Usa **npm**.

---------------------------------------------------------------------------------------------------------------------------------------------------
COMO LEVANTAR EL PROYECTO
---------------------------------------------------------------------------------------------------------------------------------------------------

Hace falta Node.js, pnpm y MySQL. Crear una base vacia (por ejemplo `manitas`): las tablas las crea TypeORM solo al levantar el back.

**1. Back** — crear el archivo `manitas-backend/.env`:

```
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=tu_contraseña
DB_NAME=manitas
JWT_SECRET=un_texto_largo_y_aleatorio
ADMIN_CORREO=admin@manitas.com
ADMIN_CONTRASENA=una_contraseña
# Opcional, para pagar con Mercado Pago (token TEST de una cuenta de prueba de Mercado Pago Developers)
MERCADOPAGO_ACCESS_TOKEN=
```

El administrador no se registra: entra con el correo y la contraseña del `.env`.

```bash
cd manitas-backend
pnpm install
pnpm run start:dev        # http://localhost:3000
```

**2. Datos de prueba** (opcional, con el back configurado):

```bash
pnpm run seed:georef      # todas las provincias y localidades de Argentina (API Georef)
pnpm run seed:demo        # oficios, zonas de Rosario, clientes, profesionales y solicitudes en todos los estados
```

Todas las cuentas de prueba tienen la contraseña `Manitas123` (ej: `laura.cliente@manitas.test`, `jorge.plomero@manitas.test`). Mas detalle en [SEED.md](manitas-backend/SEED.md).

**3. Front** (en otra terminal, con el back levantado):

```bash
cd manitas-frontend
npm install
npm run dev               # http://localhost:5173
```

En el login hay botones para entrar directo con las cuentas de prueba (solo en desarrollo).

---------------------------------------------------------------------------------------------------------------------------------------------------
DOCUMENTACION DE LA API
---------------------------------------------------------------------------------------------------------------------------------------------------

Con el back levantado: **http://localhost:3000/api** (Swagger). Estan todas las rutas agrupadas, que rol puede usar cada una, de que estado a que estado pasa cada paso de la solicitud, los errores y ejemplos. Con el boton "Authorize" se pega el token del login y se pueden probar desde ahi.

---------------------------------------------------------------------------------------------------------------------------------------------------
TESTS
---------------------------------------------------------------------------------------------------------------------------------------------------

```bash
cd manitas-backend
pnpm test                 # unitarios
pnpm run test:e2e         # integracion

cd manitas-frontend
npm test                  # unitarios
npm run test:e2e          # end-to-end (Playwright)
```

---------------------------------------------------------------------------------------------------------------------------------------------------
DOCUMENTACION
---------------------------------------------------------------------------------------------------------------------------------------------------

Toda la documentacion del TP esta en [docs/](docs/README.md): propuesta, instalacion, API, evidencia de los tests, deploy, minutas y seguimiento.
