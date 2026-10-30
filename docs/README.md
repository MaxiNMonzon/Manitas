# Documentación — Manitas

Punto de entrada de la documentación del TP (formato pedido por la cátedra en
[utnfrrodsw/tp › docs](https://github.com/utnfrrodsw/tp/blob/main/docs.md)).

| Contenido | Documento | Estado |
| --- | --- | --- |
| Propuesta actualizada | [proposal.md](proposal.md) | ✅ (faltan los links de los PR) |
| Links a los PR | [proposal.md › Repositorios](proposal.md#repositorios) | ⬜ completar al abrir los PR de entrega |
| Instrucciones de instalación | [instalacion.md](instalacion.md) | ✅ |
| Minutas de reunión y avance | [minutas.md](minutas.md) | ⬜ completar con las reuniones del grupo |
| Tracking de features, bugs e issues | [tracking.md](tracking.md) | ⬜ completar responsables y links (GitHub Projects) |
| Documentación de la API | [api.md](api.md) · [openapi.json](api/openapi.json) · Swagger en `/api` | ✅ |
| Evidencia de ejecución de tests automáticos | [tests.md](tests.md) · [evidencia-tests/](evidencia-tests/) | ✅ |
| Demo de la app en video | _(link al video)_ | ⬜ grabar |
| Deploy (links y credenciales) | [deploy.md](deploy.md) | ⬜ publicar |

## Cumplimiento de requisitos para Aprobación Directa

Requisitos del [enunciado](https://github.com/utnfrrodsw/tp/blob/main/README.md). ✅ cumplido · ⬜ pendiente del grupo.

### Backend

| Requisito | Cómo se cumple |
| --- | --- |
| ✅ JavaScript/TypeScript con un framework web | NestJS (sobre Express), con módulos, middlewares, pipes y guards |
| ✅ API web | REST + JSON, documentada con OpenAPI ([api.md](api.md)) |
| ✅ Base de datos persistente externa | MySQL como servicio |
| ✅ Persistencia con ORM | TypeORM (entidades y repositorios) |
| ✅ Capas | Controlador → Servicio → Repositorio/Entidad, por módulo de negocio |
| ✅ Validación y errores informados por la API | DTOs con `class-validator` + `ValidationPipe` global (*whitelist*); excepciones HTTP con mensaje |
| ✅ Dependencias registradas | `package.json` (ejecución, desarrollo y test) |
| ✅ 1 test automatizado por integrante | 4 tests unitarios ([tests.md](tests.md)) |
| ✅ 1 test de integración | `test/turnos.e2e-spec.ts` (HTTP + validación + JWT + roles) |
| ✅ Login con autenticación propia y ≥ 2 niveles de acceso | JWT propio (bcrypt + firma HS256); roles cliente, profesional y administrador |
| ✅ Rutas protegidas por nivel de acceso | `@Auth(Rol.X)` = `AuthGuard` + `RolesGuard`; control de pertenencia en los servicios |
| ✅ Ambientes | `.env` + `ConfigModule` ([`.env.example`](../manitas-backend/.env.example)) |

### Frontend

| Requisito | Cómo se cumple |
| --- | --- |
| ✅ Framework de frontend + HTML5 | React 19 + Vite (SPA) |
| ✅ Biblioteca de componentes / estilos | Material UI con un tema propio |
| ✅ Mobile first y 3 breakpoints (SM, MD, LG) | Estilos con `sx` partiendo de `xs` y ajustando en `sm`/`md`; navegación inferior en celular y superior en escritorio |
| ✅ UX/UI sin manual | Textos en lenguaje del usuario, estados vacíos, confirmaciones y avisos; sección Ayuda |
| ✅ Eventos, errores amigables, reactividad, input y output properties | Formularios y botones; `Alert`/`Snackbar` con el mensaje del back; estado con hooks; props de datos (`solicitud`) y de eventos (`onVerDetalles`) |
| ✅ Al menos un servicio | Capa `src/api/*` (cliente HTTP único + una función por endpoint) |
| ✅ Modelos tipados | Interfaces y tipos en `src/types/index.ts` |
| ✅ Patrones de diseño | Contexto/proveedor de sesión (`AuthContext`), *custom hooks* (`useCarga`), componentes configurables por datos (panel de administración), adaptador de datos de la API |
| ✅ 1 test unitario de componente | `TarjetaSolicitudCliente.test.tsx` (Vitest + Testing Library) |
| ✅ 1 test end-to-end | `e2e/cliente.spec.ts` (Playwright, escritorio y celular) |
| ✅ Login y acceso según nivel | Sesión con JWT; `Layout` exige sesión y `SoloRol` separa las pantallas de cliente, profesional y administrador |
| ✅ Ambientes | `VITE_API_URL` ([`.env.example`](../manitas-frontend/.env.example)) |

### Funcionales

| Requisito | Cómo se cumple |
| --- | --- |
| ✅ CRUDs de todas las clases de negocio desde la app | Panel de administración (Especialidad, Tipo de servicio, Provincia, Localidad, Zona, Método de pago, Promoción; consulta de Clientes y Profesionales), Mi perfil (Usuario: ver, editar, dar de baja), Agenda (Horario laboral) |
| ✅ Listados con filtro + detalle | Profesionales por especialidad/zona → perfil; tipos de servicio por especialidad → detalle; solicitudes por estado → detalle |
| ✅ 1 CUU por integrante (≥ 2 relacionados) | Solicitar → Coordinar visita → Confirmar servicio → Abonar → Calificar (encadenados); además Informar promociones y Notificar próximas visitas ([proposal.md](proposal.md)) |

### Entrega

| Requisito | Estado |
| --- | --- |
| ⬜ Video explicando el funcionamiento | Grabar (sugerencia: recorrer el camino feliz con las cuentas de prueba + el panel de admin) |
| ✅ Documentación de la API | [api.md](api.md) |
| ✅ Evidencia de los tests | [tests.md](tests.md) |
| ⬜ Proposal con links a los PR | Abrir los PR al repo de la cátedra y completar [proposal.md](proposal.md) |
| ✅ README con instrucciones de instalación | [instalacion.md](instalacion.md), enlazado desde el README del proyecto |
| ⬜ Links de deploy y credenciales | [deploy.md](deploy.md) |
| ⬜ Contacto para coordinar la defensa | Completar en el formulario de entrega |
| ⬜ Minutas y tracking | [minutas.md](minutas.md), [tracking.md](tracking.md) |