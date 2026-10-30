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

Monorepo: https://github.com/MaxiNMonzon/Manitas

- `manitas-backend`: API REST (NestJS + TypeORM + MySQL)
- `manitas-frontend`: SPA (React + Vite + Material UI)

---------------------------------------------------------------------------------------------------------------------------------------------------
TEMA
---------------------------------------------------------------------------------------------------------------------------------------------------

Aplicación que conecta clientes con profesionales de distintos oficios para resolver tareas del hogar.
Ofrece servicios urgentes con geolocalización y trabajos programados con comparación de precios.
Cada profesional define sus tarifas y recibe calificaciones.
Los clientes pueden pagar con tarjeta, billeteras virtuales o efectivo.
Incluye promociones según método de pago.
Apunta a brindar rapidez, confianza y variedad de opciones.}

---------------------------------------------------------------------------------------------------------------------------------------------------
MODELO
---------------------------------------------------------------------------------------------------------------------------------------------------

<img width="1301" height="752" alt="MD - DSW-MD drawio (1)" src="https://github.com/user-attachments/assets/c6a9bd41-b077-4243-87ec-42b62b63b720" />

https://drive.google.com/file/d/1yA9dty0EUn0jITPk4veSDCFWdFEMilrt/view

---------------------------------------------------------------------------------------------------------------------------------------------------
ALCANCE FUNCIONAL
---------------------------------------------------------------------------------------------------------------------------------------------------
Alcance Mínimo
------------------------------------------------------------------------------
Regularidad:

| Req | Detalle |
| :--- | :--- |
| **CRUD simple** | 1. CRUD Usuario <br>2. CRUD Tipo de Servicio <br>3. CRUD Localidad<br>4. CRUD Metodo de Pago|
| **CRUD dependiente** | 1. CRUD Zona {depende de} CRUD Localidad <br>2. CRUD Profesional {depende de} CRUD Especialidad|
| **Listado + detalle** | 1. Servicio por Tipo de Servicio <br>2. Profesional por Especialidad|
| **CUU/Epic** | 1. Informar promociones bancarias del mes <br>2. Notificar próximas visitas <br>3. Solicitud de Servicio  <br>4. Calificar Servicio|

Adicionales para Aprobación
| Req | Detalle |
| :--- | :--- |
| **CRUD** | 1. CRUD Usuario  <br>2. CRUD Tipo de Servicio <br>3. CRUD Localidad<br>4. CRUD Metodo de Pago <br>5. CRUD Zona|
| **CUU/Epic** | 1. Solicitar servicio<br>2. Calificar Servicio <br>3. Confirmar servicio<br>4. Coordinar visita<br>5. Abonar servicio<br>6. Calificar profesional<br>7. Informar promociones bancarias del mes<br>8. Notificar próximas visitas <br>9. Solicitar Presupuesto|

---------------------------------------------------------------------------------------------------------------------------------------------------

---------------------------------------------------------------------------------------------------------------------------------------------------
INSTALACIÓN Y EJECUCIÓN
---------------------------------------------------------------------------------------------------------------------------------------------------

Requisitos: Node.js 22+ y MySQL 8+. Guía completa: [docs/instalacion.md](docs/instalacion.md).

```bash
# Backend (API en http://localhost:3000, Swagger en http://localhost:3000/api)
cd manitas-backend
npm install
cp .env.example .env        # completar la conexión a MySQL, JWT_SECRET, admin y Mercado Pago
npm run start:dev
npm run seed:demo           # opcional: datos y cuentas de prueba (contraseña Manitas123)

# Frontend (http://localhost:5173)
cd manitas-frontend
npm install
npm run dev
```

Tests: `npm test` y `npm run test:e2e` en cada carpeta ([docs/tests.md](docs/tests.md)).

---------------------------------------------------------------------------------------------------------------------------------------------------
DOCUMENTACIÓN
---------------------------------------------------------------------------------------------------------------------------------------------------

Toda la documentación del TP está en [docs/](docs/README.md): propuesta actualizada, instalación, API, evidencia de tests,
deploy, minutas y seguimiento, con el estado de cada requisito para la Aprobación Directa.
