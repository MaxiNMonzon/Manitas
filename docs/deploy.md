# Deploy

> **Estado:** publicado (30/10/2026).

| Qué | Link |
| --- | --- |
| Frontend (la página) | https://manitas-sigma.vercel.app |
| Backend (API) | https://manitas-api-hv16.onrender.com |
| Documentación de la API (Swagger) | https://manitas-api-hv16.onrender.com/api |

> El back está en el plan gratis de Render: si nadie lo usa por un rato se apaga, y la primera consulta
> después tarda alrededor de un minuto en responder. Conviene abrir la página un minuto antes de probarla.

### Credenciales para probar la app publicada

| Rol | Correo | Contraseña |
| --- | --- | --- |
| Cliente | laura.cliente@manitas.test | Manitas123 |
| Profesional | jorge.plomero@manitas.test | Manitas123 |
| Administrador | admin@manitas.com | tuhogarenbuenasmanos |

Hay más cuentas de prueba (todas con la contraseña `Manitas123`): clientes `martin`, `sofia`, `diego` y `carla`
(`<nombre>.cliente@manitas.test`) y profesionales `oscar.electricista`, `marta.pintora`, `lucia.carpintera`,
`julian.gasista`, `ramon.cerrajero`, `ana.limpieza`, `pablo.jardinero` y `nicolas.clima` (`@manitas.test`).
Para pagar con Mercado Pago (modo prueba) se usa un usuario comprador de prueba de Mercado Pago.

## Qué usamos

| Parte | Servicio | Detalle |
| --- | --- | --- |
| Base de datos | [Aiven](https://aiven.io) (MySQL 8.4, plan Free) | Servicio externo en la nube, con conexión segura (SSL verificando el certificado de Aiven) |
| Backend | [Render](https://render.com) (Web Service, plan Free) | Rama `maxi`, carpeta `manitas-backend`. Se vuelve a publicar solo con cada `git push` |
| Frontend | [Vercel](https://vercel.com) (plan Hobby) | Rama `maxi`, carpeta `manitas-frontend`. Se vuelve a publicar solo con cada `git push` |
| Datos iniciales | `pnpm run seed:georef` y `pnpm run seed:demo` | Corridos desde la compu de un integrante contra la base de Aiven |

## Propuesta de infraestructura (todo con planes gratuitos)

La cátedra pide que la base de datos sea un servicio externo y **no requiera ejecutarse en local**.

| Parte | Servicio sugerido | Notas |
| --- | --- | --- |
| Base de datos MySQL | [Railway](https://railway.app), [Aiven](https://aiven.io/mysql) o [Clever Cloud](https://www.clever-cloud.com) | Crear la base y copiar host, puerto, usuario, contraseña y nombre |
| Backend | [Render](https://render.com) (Web Service) o Railway | Root: `manitas-backend` · Build: `corepack pnpm install --frozen-lockfile && corepack pnpm run build` · Start: `node dist/main` · variable `COREPACK_ENABLE_DOWNLOAD_PROMPT=0` (en Render no se puede usar `corepack enable`: la carpeta del sistema es de solo lectura) |
| Frontend | [Vercel](https://vercel.com) o [Netlify](https://netlify.com) | Root: `manitas-frontend` · Build: `npm run build` · Output: `dist` |

### Variables de entorno

**Backend** (las mismas de [`.env.example`](../manitas-backend/.env.example)):
`DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME`, `DB_SSL=true` y `DB_SSL_CA` (el certificado CA del
proveedor de la base, si pide conexión segura), `JWT_SECRET` (uno nuevo, largo y aleatorio),
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
