# Tests automáticos

Requisito de Aprobación Directa: 1 test automatizado por integrante y 1 test de integración en el back;
al menos 1 test unitario de un componente y 1 test end-to-end en el front.

| Requisito | Archivo | Herramientas | Casos | Resultado |
| --- | --- | --- | --- | --- |
| Back: test unitario 1 | [`auth/guard/auth.guard.spec.ts`](../manitas-backend/src/auth/guard/auth.guard.spec.ts) | Jest | 5 | ✅ |
| Back: test unitario 2 | [`auth/guard/roles.guard.spec.ts`](../manitas-backend/src/auth/guard/roles.guard.spec.ts) | Jest | 4 | ✅ |
| Back: test unitario 3 | [`turno/turno.service.spec.ts`](../manitas-backend/src/turno/turno.service.spec.ts) | Jest + Nest Testing | 5 | ✅ |
| Back: test unitario 4 | [`payments/payments.service.spec.ts`](../manitas-backend/src/payments/payments.service.spec.ts) | Jest + Nest Testing (Mercado Pago simulado) | 5 | ✅ |
| Back: test de integración | [`test/turnos.e2e-spec.ts`](../manitas-backend/test/turnos.e2e-spec.ts) | Jest + Supertest | 6 | ✅ |
| Front: test unitario de componente | [`TarjetaSolicitudCliente.test.tsx`](../manitas-frontend/src/components/solicitudes/TarjetaSolicitudCliente.test.tsx) | Vitest + Testing Library | 4 | ✅ |
| Front: test end-to-end | [`e2e/cliente.spec.ts`](../manitas-frontend/e2e/cliente.spec.ts) | Playwright (Chrome, escritorio y celular) | 4 × 2 | ✅ |

> **Asignación sugerida (1 por integrante):** cada integrante se queda con uno de los cuatro tests unitarios del back
> para explicarlo en la defensa. Completar acá: auth.guard → _____, roles.guard → _____, turno.service → _____,
> payments.service → _____.

## Qué prueba cada uno

- **`AuthGuard`** (autenticación): deja pasar un JWT válido y guarda el usuario en la petición; rechaza sin token,
  con un token firmado con otra clave (alterado), vencido o con un header que no es `Bearer`.
- **`RolesGuard`** (niveles de acceso): un profesional entra a rutas de profesional; un cliente no entra a rutas de
  profesional ni de administrador; una ruta sin rol requerido deja pasar a cualquier usuario logueado.
- **`TurnoService.guardarHorario`** (regla de negocio): guarda el horario reemplazando el anterior, admite dos rangos
  el mismo día sin pisarse, rechaza horas invertidas o rangos superpuestos, y falla si el profesional no existe.
- **`PaymentsService.confirmar`** (Mercado Pago, con el SDK simulado): registra el pago solo si Mercado Pago lo
  aprobó y por el monto de la solicitud; no lo registra dos veces (idempotencia); rechaza pagos inexistentes.
- **Integración (Turnos)**: levanta la app HTTP con el controlador real, la validación global (`ValidationPipe` con
  *whitelist*), el JWT real y los guards, y verifica: 401 sin token, 403 con rol equivocado, 400 con datos inválidos
  o con campos de más, 200 en el caso correcto (con el id tomado del token) y validación de una ruta pública.
- **Componente `TarjetaSolicitudCliente`**: muestra los datos que recibe (*input*), avisa al tocar "Ver detalles"
  (*output*) y presenta bien una urgencia sin profesional y una solicitud pagada.
- **End-to-end**: sin sesión, las pantallas privadas mandan al login; el cliente ve sus solicitudes, abre y cierra el
  detalle y cambia de pestaña; busca en Ayuda y el formulario de consulta valida; y no puede entrar al panel del
  administrador escribiendo la URL. Se corre en tamaño escritorio y celular.

## Cómo correrlos

```bash
cd manitas-backend
pnpm test              # unitarios
pnpm run test:e2e      # integración

cd manitas-frontend
npm test               # componente
npm run test:e2e       # end-to-end (levanta el front solo si no está corriendo)
```

Ninguno necesita MySQL: en el back los repositorios y Mercado Pago se simulan, y el end-to-end usa la sesión demo.

> **Nota técnica:** `@nestjs/typeorm` y `@nestjs/config` se publican como módulos ESM que Jest no puede cargar.
> En los tests se reemplazan por versiones mínimas equivalentes ([`test/stubs`](../manitas-backend/test/stubs))
> mediante `moduleNameMapper`; `@nestjs/jwt` sí se usa real (se transforma con [`tsconfig.spec.json`](../manitas-backend/tsconfig.spec.json)).

## Evidencia de la ejecución

- [Back — unitarios](evidencia-tests/backend-unitarios.txt) — 4 suites, 19 tests OK
- [Back — integración](evidencia-tests/backend-integracion.txt) — 1 suite, 6 tests OK
- [Front — componente](evidencia-tests/frontend-unitarios.txt) — 1 archivo, 4 tests OK
- [Front — end-to-end](evidencia-tests/frontend-e2e.txt) — 8 ejecuciones OK (4 escenarios × escritorio y celular)