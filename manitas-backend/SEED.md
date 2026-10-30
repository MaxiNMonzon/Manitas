# Seed de provincias y localidades (Georef)

Carga en la base todas las provincias y localidades de Argentina usando la
[API Georef](https://apis.datos.gob.ar/georef) del Gobierno (gratis, sin clave).
El script está en `src/seeds/georef.seed.ts`.

## Cómo correrlo

1. Tener MySQL levantado y el `.env` del backend configurado (`DB_HOST`, `DB_PORT`,
   `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME`, etc.), igual que para levantar el back.
2. Tener conexión a internet (consultar la API de Georef).
3. Desde `manitas-backend/`:

   ```bash
   pnpm install          # si todavía no están las dependencias
   pnpm run seed:georef  # o: npm run seed:georef
   ```

Tarda alrededor de un minuto. Muestra una línea por provincia, por ejemplo:

```
Georef: 24 provincias. Cargando...
- Buenos Aires: 895 localidades (895 nuevas)
- Catamarca: ...
Listo.
```

## Qué hace

- Crea/actualiza las **24 provincias** (23 + CABA) y sus **localidades** (~4000 en total).
  En CABA las "localidades" son los barrios (Palermo, Caballito, ...).
- Guarda el id oficial de Georef en la columna `idGeoref`, así que **se puede correr
  más de una vez sin duplicar** nada.
- Si ya había provincias o localidades cargadas a mano con el mismo nombre, las reutiliza
  (les completa el `idGeoref`), así no se pierden las zonas que cuelgan de ellas.
- Las localidades con nombre repetido dentro de una provincia se guardan con el
  departamento entre paréntesis, ej: `San José (Coronel Suárez)`.
- Lo que fue dado de baja (borrado lógico) no se revive.
- **No carga zonas** ni códigos postales (Georef no los tiene; `codigoPostal` quedó opcional).

## Cambios en el esquema

Con `synchronize: true`, TypeORM aplica estos cambios solo al levantar el back o el seed:

- `provincia.idGeoref` y `localidad.idGeoref`: nuevas columnas (únicas, opcionales).
- `localidad.codigoPostal`: pasa a ser opcional (`NULL`).

---

# Seed de datos iniciales (`seed:demo`)

Carga datos para mostrar el sistema de punta a punta. El script está en `src/seeds/demo.seed.ts`.

```bash
pnpm run seed:demo   # o: npm run seed:demo
```

- **Se puede correr varias veces**: busca por nombre/correo y no duplica. No modifica ni borra nada que ya exista.
- Agrega lo que falte de: los **10 oficios** (Electricidad, Plomería, Gas, Pintura, Albañilería, Carpintería,
  Cerrajería, Climatización, Limpieza, Jardinería) con algunas habilidades cada uno, y las **zonas de Rosario**
  (los 6 distritos oficiales: Centro, Norte, Noroeste, Oeste, Sudoeste y Sur). Si no existen Santa Fe / Rosario, las crea. Si encuentra las zonas viejas Echesortu o Fisherton, pasa su gente a Centro y Noroeste y las da de baja.
- Crea **6 clientes y 9 profesionales** (con horario de trabajo, zonas, oficios y CBU).
- Crea una vez **solicitudes de ejemplo en todos los estados** (finalizadas con reseñas, presupuesto para aceptar,
  trabajo para pagar, visita para presupuestar, nuevas para aceptar, cambio de horario...).

**Contraseña de las cuentas: `Manitas123`**, menos la de Maxi (`maxi.rp002@gmail.com`), que se toma de
`SEED_CONTRASENA_MAXI` en el `.env` (si no está, también usa `Manitas123`).

| Rol | Correo | Para probar |
| --- | --- | --- |
| Cliente | maxi.rp002@gmail.com | Una solicitud en cada estado: aceptar presupuesto, pagar con Mercado Pago, responder un cambio de horario, calificar |
| Cliente | valeriagodoy.ros@gmail.com | Presupuesto para responder, trabajo para pagar, visita esperando el presupuesto de Raúl |
| Cliente | fede.ibarra88@gmail.com / gusmolina.rosario@gmail.com / nati.herrera.82@gmail.com / camirossi.95@gmail.com | Nuevas pendientes, historial |
| Profesional | raulbustos.plomeria@gmail.com | Plomería y Gas: nuevas para aceptar y una visita para presupuestar |
| Profesional | sergioledesma.electricista@gmail.com | Una nueva y trabajos por cobrar |
| Profesional | silviaortiz.pinturas@gmail.com, leandrocabrera.clima@gmail.com, marceloquiroga.gasista@gmail.com | Visita confirmada / propuso otro horario / presupuesto enviado |
| Profesional | damianaguirre.carpinteria@, cerrajeriavillalba@, graciela.romero.limpieza@, ezequieltoledo.jardines@ (gmail.com) | Un profesional por oficio |

## Borrar las cuentas de prueba viejas (`seed:limpiar`)

```bash
pnpm run seed:limpiar
```

Borra las cuentas de prueba (correos `@manitas.test`, `@test.com` y `@t.com`) con sus solicitudes, turnos, horarios,
matrículas y consultas de Ayuda. Las demás cuentas no se tocan. Después, `pnpm run seed:demo` carga la gente nueva.
Si falla por las tablas viejas `precio_base` o `tarjeta` (de antes de sacar PrecioBase y la tarjeta guardada),
borrarlas a mano: ya no se usan.
