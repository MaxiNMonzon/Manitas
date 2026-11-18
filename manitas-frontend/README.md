# manitas-frontend

Frontend de Manitas: React + TypeScript (Vite) con Material UI.

## Uso

```bash
npm install
npm run dev     # http://localhost:5173
npm run build
```

El front le pega directo al backend NestJS en `http://localhost:3000` (tiene CORS habilitado).
Para apuntar a otro backend, definir `VITE_API_URL` en un `.env.local`.

## Estructura

- `src/pages` — Bienvenida (`/`), Login (`/login`), Registro (`/registro/cliente|profesional`), Panel (`/app`, requiere sesión)
- `src/components/AuthLayout.tsx` — pantalla dividida (panel ilustrado + formulario) de bienvenida/login/registro
- `src/components/Layout.tsx` — barra superior de la parte privada
- `src/auth` — sesión (token JWT en localStorage) y hook `useAuth()`
- `src/api/client.ts` — cliente HTTP (`api.get`, `api.post`, ...), agrega el token automáticamente
- `src/types` — tipos de las respuestas del backend
- `src/theme.ts` — tema de Material UI
