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
