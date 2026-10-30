# Deploy

> **Estado:** pendiente. Completar los links y credenciales cuando esté publicado.

| Qué | Link |
| --- | --- |
| Frontend | _(completar)_ |
| Backend (API) | _(completar)_ |
| Documentación de la API (Swagger) | _(completar)_/api |

### Credenciales para probar la app publicada

| Rol | Correo | Contraseña |
| --- | --- | --- |
| Cliente | laura.cliente@manitas.test | Manitas123 |
| Profesional | jorge.plomero@manitas.test | Manitas123 |
| Administrador | _(el ADMIN_CORREO del servidor)_ | _(el ADMIN_CONTRASENA del servidor)_ |

(Las cuentas de cliente y profesional las crea `pnpm run seed:demo` contra la base publicada.)

## Propuesta de infraestructura (todo con planes gratuitos)

La cátedra pide que la base de datos sea un servicio externo y **no requiera ejecutarse en local**.

| Parte | Servicio sugerido | Notas |
| --- | --- | --- |
| Base de datos MySQL | [Railway](https://railway.app), [Aiven](https://aiven.io/mysql) o [Clever Cloud](https://www.clever-cloud.com) | Crear la base y copiar host, puerto, usuario, contraseña y nombre |
| Backend | [Render](https://render.com) (Web Service) o Railway | Root: `manitas-backend` · Build: `pnpm install && pnpm run build` · Start: `pnpm run start:prod` |
| Frontend | [Vercel](https://vercel.com) o [Netlify](https://netlify.com) | Root: `manitas-frontend` · Build: `npm run build` · Output: `dist` |

### Variables de entorno

**Backend** (las mismas de [`.env.example`](../manitas-backend/.env.example)):
`DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET` (uno nuevo, largo y aleatorio),
`ADMIN_CORREO`, `ADMIN_CONTRASENA`, `MERCADOPAGO_ACCESS_TOKEN` y
`MERCADOPAGO_VUELTA_URL=https://<dominio-del-front>/app/solicitudes`.

**Frontend:** `VITE_API_URL=https://<dominio-del-back>` (se usa al compilar).

### Pasos

1. Crear la base MySQL y anotar los datos de conexión.
2. Publicar el back con sus variables. Al arrancar, TypeORM crea las tablas.
3. Cargar datos: desde la máquina de un integrante, con un `.env` que apunte a la base publicada,
   `pnpm run seed:georef` y `pnpm run seed:demo`.
4. Publicar el front con `VITE_API_URL` apuntando al back.
5. En una SPA todas las rutas tienen que servir `index.html`; si no, `/app/solicitudes` da 404 al recargar o al
   volver de Mercado Pago. Ya está resuelto en el repo: [`vercel.json`](../manitas-frontend/vercel.json) (Vercel) y
   [`public/_redirects`](../manitas-frontend/public/_redirects) (Netlify).
6. Probar el login con las credenciales de arriba y completar la tabla de links.