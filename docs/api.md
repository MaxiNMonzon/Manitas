# Documentación de la API

La API es REST (JSON) y está documentada con **OpenAPI 3 / Swagger**, generado automáticamente por NestJS a partir de
los controladores y los DTOs.

- **Documentación interactiva:** con el back corriendo, abrir **http://localhost:3000/api** (se pueden probar los endpoints).
  Para las rutas protegidas: hacer login (`POST /auth/login/...`), copiar el `token` y pegarlo en el botón **Authorize**.
- **Especificación completa:** [`api/openapi.json`](api/openapi.json) (se regenera con `GET http://localhost:3000/api-json`).
  Se puede abrir en [editor.swagger.io](https://editor.swagger.io) o importar en Postman / Insomnia.

## Autenticación y niveles de acceso

- Login: `POST /auth/login/cliente`, `/auth/login/profesional` o `/auth/login/admin` con `{ correo, contraseña }` → `{ token }`.
- Las rutas protegidas esperan el header `Authorization: Bearer <token>` (JWT firmado; vence a las 24 h, el del admin a las 2 h).
- Login: 3 intentos fallidos seguidos bloquean esa cuenta 15 minutos (`429`); el front vuelve a la pantalla de inicio con el aviso.
- Niveles: **cliente**, **profesional** y **admin**. Sin token → `401`; con un rol que no corresponde → `403`.
- Errores: siempre `{ statusCode, message, error }`; los errores de validación devuelven `400` con la lista de problemas en `message`.

## Endpoints (86)

La columna **Acceso** indica quién puede usar cada endpoint.

### Auth

Registrarse, iniciar sesion y ver mis datos

| Método | Ruta | Acceso | Descripción |
| --- | --- | --- | --- |
| `POST` | `/auth/register/cliente` | público | Registrarse como cliente |
| `POST` | `/auth/register/profesional` | público | Registrarse como profesional |
| `POST` | `/auth/login/cliente` | público | Iniciar sesion como cliente |
| `POST` | `/auth/login/profesional` | público | Iniciar sesion como profesional |
| `POST` | `/auth/login/admin` | público | Iniciar sesion como admin |
| `GET` | `/auth/perfil` | con sesión | Ver mis datos |
| `PATCH` | `/auth/contrasena` | con sesión | Cambiar mi contraseña |
| `POST` | `/auth/olvide-contrasena` | público | Olvidé mi contraseña: manda un mail con un link (vence en 30 min, sirve una vez) |
| `POST` | `/auth/restablecer-contrasena` | público | Crear la contraseña nueva con el código del link |

### Profesionales

Buscar profesionales, ver sus calificaciones y editar la cuenta de profesional

| Método | Ruta | Acceso | Descripción |
| --- | --- | --- | --- |
| `GET` | `/profesional` | público | Buscar profesionales |
| `GET` | `/profesional/{id}` | público | Ver un profesional |
| `PATCH` | `/profesional/{id}` | profesional | Editar mi cuenta de profesional |
| `DELETE` | `/profesional/{id}` | profesional | Dar de baja mi cuenta de profesional |
| `GET` | `/profesional/{id}/calificaciones` | público | Calificaciones de un profesional |

### Solicitudes de servicio

Todo el recorrido: solicitar presupuesto con un turno → visita → presupuesto → contratar → abonar → calificar

| Método | Ruta | Acceso | Descripción |
| --- | --- | --- | --- |
| `POST` | `/solicitud-de-servicio` | cliente | Solicitar presupuesto |
| `GET` | `/solicitud-de-servicio` | con sesión | Mis solicitudes |
| `POST` | `/solicitud-de-servicio/urgente` | cliente | Pedir un servicio urgente |
| `GET` | `/solicitud-de-servicio/urgentes` | profesional | Urgentes disponibles cerca |
| `GET` | `/solicitud-de-servicio/avisos` | con sesión | Mis avisos (notificaciones dentro de la app) |
| `GET` | `/solicitud-de-servicio/cobros` | profesional | Mis cobros (profesional) |
| `GET` | `/solicitud-de-servicio/agenda` | con sesión | Mi agenda (calendario de visitas y trabajos) |
| `GET` | `/solicitud-de-servicio/{id}` | con sesión | Ver una solicitud |
| `PATCH` | `/solicitud-de-servicio/{id}` | con sesión | Corregir la descripcion del problema |
| `PATCH` | `/solicitud-de-servicio/{id}/aceptar` | profesional | Aceptar la solicitud |
| `PATCH` | `/solicitud-de-servicio/{id}/rechazar` | profesional | Rechazar la solicitud |
| `PATCH` | `/solicitud-de-servicio/{id}/presupuestar` | profesional | Enviar presupuesto |
| `PATCH` | `/solicitud-de-servicio/{id}/aceptar-presupuesto` | cliente | Confirmar servicio (aceptar el presupuesto) |
| `PATCH` | `/solicitud-de-servicio/{id}/rechazar-presupuesto` | cliente | Rechazar el presupuesto |
| `PATCH` | `/solicitud-de-servicio/{id}/calificar` | cliente | Calificar profesional |
| `PATCH` | `/solicitud-de-servicio/{id}/reprogramar` | con sesión | Proponer otro horario (reprogramar) |
| `PATCH` | `/solicitud-de-servicio/{id}/aceptar-reprogramacion` | con sesión | Aceptar el horario propuesto |
| `PATCH` | `/solicitud-de-servicio/{id}/rechazar-reprogramacion` | con sesión | Rechazar el horario propuesto |
| `PATCH` | `/solicitud-de-servicio/{id}/cancelar` | con sesión | Cancelar |

### Turnos

Horario fijo del profesional y sus turnos libres

| Método | Ruta | Acceso | Descripción |
| --- | --- | --- | --- |
| `PUT` | `/turnos/mi-horario` | profesional | Cargar mi horario fijo |
| `GET` | `/turnos/mi-horario` | profesional | Ver mi horario fijo |
| `GET` | `/turnos/horario/{idProfesional}` | público | Ver el horario fijo de un profesional |
| `GET` | `/turnos/libres/{idProfesional}` | público | Turnos libres de un profesional (el calendario) |

### Pagos con Mercado Pago

Abonar servicio (modo prueba): ir a pagar al sitio de Mercado Pago y confirmar al volver

| Método | Ruta | Acceso | Descripción |
| --- | --- | --- | --- |
| `POST` | `/payments/create-preference` | cliente | Ir a pagar con Mercado Pago |
| `POST` | `/payments/confirmar` | cliente | Confirmar el pago al volver de Mercado Pago |

### Promociones

Promociones bancarias (reintegros por metodo de pago)

| Método | Ruta | Acceso | Descripción |
| --- | --- | --- | --- |
| `POST` | `/promocion` | admin | Crear una promocion |
| `GET` | `/promocion` | público | Listar las promociones |
| `GET` | `/promocion/del-mes` | público | Informar promociones bancarias del mes |
| `GET` | `/promocion/{id}` | público | Ver una promocion |
| `PATCH` | `/promocion/{id}` | admin | Editar una promocion |
| `DELETE` | `/promocion/{id}` | admin | Borrar una promocion |

### Clientes

La cuenta del cliente

| Método | Ruta | Acceso | Descripción |
| --- | --- | --- | --- |
| `GET` | `/cliente` | admin | Listar todos los clientes |
| `GET` | `/cliente/{id}` | cliente | Ver mi cuenta de cliente |
| `PATCH` | `/cliente/{id}` | cliente | Editar mi cuenta de cliente |
| `DELETE` | `/cliente/{id}` | cliente | Dar de baja mi cuenta de cliente |

### Especialidades

Catalogo (lo maneja el admin)

| Método | Ruta | Acceso | Descripción |
| --- | --- | --- | --- |
| `POST` | `/especialidad` | admin | Crear una especialidad |
| `GET` | `/especialidad` | público | Listar las especialidades |
| `GET` | `/especialidad/{id}` | público | Ver una especialidad |
| `PATCH` | `/especialidad/{id}` | admin | Editar una especialidad |
| `DELETE` | `/especialidad/{id}` | admin | Borrar una especialidad |

### Tipos de servicio

Catalogo (lo maneja el admin)

| Método | Ruta | Acceso | Descripción |
| --- | --- | --- | --- |
| `POST` | `/tipos-de-servicio` | admin | Crear un tipo de servicio |
| `GET` | `/tipos-de-servicio` | público | Tipos de servicio por especialidad |
| `GET` | `/tipos-de-servicio/{id}` | público | Ver un tipo de servicio |
| `PATCH` | `/tipos-de-servicio/{id}` | admin | Editar un tipo de servicio |
| `DELETE` | `/tipos-de-servicio/{id}` | admin | Borrar un tipo de servicio |

### Metodos de pago

Catalogo (lo maneja el admin)

| Método | Ruta | Acceso | Descripción |
| --- | --- | --- | --- |
| `POST` | `/metodo-de-pago` | admin | Crear un metodo de pago |
| `GET` | `/metodo-de-pago` | público | Listar los metodos de pago |
| `GET` | `/metodo-de-pago/{id}` | público | Ver un metodo de pago |
| `PATCH` | `/metodo-de-pago/{id}` | admin | Editar un metodo de pago |
| `DELETE` | `/metodo-de-pago/{id}` | admin | Borrar un metodo de pago |

### Provincias

Catalogo (lo maneja el admin)

| Método | Ruta | Acceso | Descripción |
| --- | --- | --- | --- |
| `POST` | `/provincia` | admin | Crear una provincia |
| `GET` | `/provincia` | público | Listar las provincias |
| `GET` | `/provincia/{id}` | público | Ver una provincia |
| `PATCH` | `/provincia/{id}` | admin | Editar una provincia |
| `DELETE` | `/provincia/{id}` | admin | Borrar una provincia |

### Localidades

Catalogo (lo maneja el admin)

| Método | Ruta | Acceso | Descripción |
| --- | --- | --- | --- |
| `POST` | `/localidad` | admin | Crear una localidad |
| `GET` | `/localidad` | público | Listar las localidades (con filtro) |
| `GET` | `/localidad/{id}` | público | Ver una localidad |
| `PATCH` | `/localidad/{id}` | admin | Editar una localidad |
| `DELETE` | `/localidad/{id}` | admin | Borrar una localidad |

### Zonas

Catalogo (lo maneja el admin)

| Método | Ruta | Acceso | Descripción |
| --- | --- | --- | --- |
| `POST` | `/zona` | admin | Crear una zona |
| `GET` | `/zona` | público | Listar las zonas (con filtro) |
| `GET` | `/zona/{id}` | público | Ver una zona |
| `PATCH` | `/zona/{id}` | admin | Editar una zona |
| `DELETE` | `/zona/{id}` | admin | Borrar una zona |

### Consultas (ayuda)

| Método | Ruta | Acceso | Descripción |
| --- | --- | --- | --- |
| `POST` | `/consulta` | con sesión | Enviar una consulta (cliente o profesional) |
| `GET` | `/consulta` | admin | Ver las consultas |
| `PATCH` | `/consulta/{id}/respondida` | admin | Marcar una consulta como respondida |