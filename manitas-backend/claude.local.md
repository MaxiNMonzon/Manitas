# Notas personales — Proyecto Manitas (DSW - UTN FRRO)

Proyecto grupal de backend para la materia Desarrollo de Software (DSW) de UTN FRRO. App que conecta usuarios con prestadores de servicios locales.

- Repo: MaxiNMonzon/Manitas
- Estructura: el repo clonado contiene una carpeta `manitas-backend` con el código real
- Stack: Node.js, pnpm, NestJS (impuesto por la cátedra, reemplaza el plan inicial de Next.js API Routes), MySQL (reemplaza el plan inicial de MongoDB), TypeORM como ORM probable
- Código migrado a TypeScript

## Git
- Rama compartida de integración: `backend` (todo el trabajo se mergea ahí, `main` queda vacía)
- Ramas personales: `maxi`, `mica`, `lauta`, `fran`

## Patrón ABM/CRUD (entidad de referencia: TiposDeServicio)

1. Generar esqueleto: `pnpm exec nest g resource nombreEntidad` (REST API, genera los endpoints CRUD)
2. Agregar decoradores de TypeORM a la entidad (`@Entity`, `@Column`, `@PrimaryGeneratedColumn`, `@ManyToOne`/`@OneToMany` para relaciones, `@DeleteDateColumn` para soft delete, `!` en cada propiedad)
3. Agregar a mano `TypeOrmModule.forFeature([Entity])` en los imports del módulo (no se genera solo)
4. Agregar decoradores de class-validator al DTO de creación (las relaciones van como el id de la entidad relacionada, un number, no el objeto completo); el DTO de update ya usa `PartialType`, no necesita cambios
5. Completar el service con `@InjectRepository` y los métodos del Repository: `save` en `create`, `find` en `findAll`, y en `findOne`/`update`/`remove` ver el patrón actualizado más abajo
6. El controller normalmente no necesita cambios

Instalado `class-validator` y `class-transformer`; `ValidationPipe` global (whitelist, forbidNonWhitelisted, transform) agregado en `main.ts`, aplica a todas las entidades. Los params `id` en los controllers usan `@Param('id', ParseIntPipe) id: number` (adoptado de Cliente/Profesional en todos los controllers el 2026-09-21; antes era `id: string` + conversión manual con `+id`).

### Patrón actualizado para `findOne` / `update` (2026-09-21, adoptado del estilo de Mica en Cliente/Profesional)
- `findOne(id)`: buscar con `findOneBy`, y si no existe tirar `NotFoundException` (antes devolvía `null` silenciosamente)
- `update(id, dto)`: reusar `findOne(id)` para traer la entidad, `repository.merge(entity, dto)`, y `repository.save(entity)` — devuelve la entidad completa actualizada (antes era `repository.update(id, dto)`, que devolvía `{affected: 1}` y no validaba que el id existiera)
- Controller: `@Param('id', ParseIntPipe) id: number` en vez de `@Param('id') id: string` + `+id` manual — corta antes con un 400 claro si el id no es numérico, en vez de propagar un `NaN` silencioso.
- Aplicado a los 10 services/controllers existentes (Usuario, TiposDeServicio, Especialidad, Provincia, Localidad, Zona, Promocion, MetodoDePago, PrecioBase, SolicitudDeServicio). Cliente y Profesional ya lo traían así. Este es ahora el patrón estándar para toda entidad nueva.
- `remove()` se dejó como estaba en cada entidad (softDelete) — la decisión de soft vs. hard delete sigue sin resolver, ver más abajo.

Las entidades viejas en `src/entities/` (clases planas sin decoradores) quedan obsoletas a medida que se migran a los archivos de entidad por módulo generados por Nest.

Cuando un módulo necesita una entidad de otro módulo (ej. TiposDeServicio necesita Especialidad), lo más simple es listar ambas en el `TypeOrmModule.forFeature([EntityA, EntityB])` de ese módulo en vez de importar el otro módulo.

### Patrón para referenciar el service de otro módulo
Cuando un módulo necesita el service de otro módulo: el módulo dueño debe exportarlo (`exports: [Service]`) además de proveerlo, y el módulo que lo usa simplemente importa el módulo entero en `imports` — el service prestado NO se vuelve a listar en el `providers` propio, para no terminar con una instancia duplicada en vez de compartir la instancia única que inyecta Nest.

### Patrón para entidades con relaciones
En el `create()`: buscar cada entidad relacionada por su repository con `findOneBy` usando el id que viene del DTO, tirar `BadRequestException` si no se encuentra, y guardar combinando `{ ...dto, relatedEntity }`. Aplicado a TiposDeServicio→Especialidad y PrecioBase→Profesional+Especialidad.

## Estado de avance
- TiposDeServicio y Especialidad: completas
- PrecioBase: completa (relación con Profesional activada tras el merge de la rama de Mica)
- SolicitudDeServicio: completa, con relaciones activas a MetodoPago, Cliente y Profesional
- Cliente y Profesional: entidades traídas de la rama de Mica. Zona ya tiene los inversos (`clientes` OneToMany, `profesionales` ManyToMany) que hacían falta para que compile
- Bugs corregidos post-merge: `findOneBy({ id })` en cliente/profesional.service.ts apuntaba a una columna `id` que no existe (la PK heredada de Usuario es `idUsuario`); el `@JoinTable` de Profesional↔Zona tenía el mismo problema en `referencedColumnName`; el DTO de PrecioBase tenía `fechadesde` en vez de `fechaDesde` (no iba a guardar la fecha); `ClienteModule` y `ProfesionalModule` no estaban importados en `app.module.ts` (sus rutas no existían en runtime aunque compilaran); `ClienteService.create()`/`ProfesionalService.create()` pasaban el DTO directo a `.save()` sin resolver `idZonaResidencia`/`idProvinciaOperacion`/`idsZonasCobertura` a las entidades relacionadas reales — iba a romper por constraint NOT NULL apenas se probara crear un Cliente o Profesional. Se corrigió con el mismo patrón findOneBy+BadRequestException que usa el resto del proyecto
- `Profesional.provinciaOperacion` (relación directa a Provincia que no estaba en el diagrama de dominio) se sacó el 2026-09-21 por decisión del equipo — Profesional ahora solo se relaciona con geografía a través de `zonasDeCobertura` (Zona → Localidad → Provincia)
- Profesional-Zona se confirmó como `@ManyToMany` directo (decisión 2026-09-21: se queda así, no se arma la entidad intermedia `ZonaCobertura` que se había planeado originalmente)
- Nombre de atributo `matricula` del diagrama quedó como `nroMatricula` en el código — decisión 2026-09-21: se deja así, no genera problemas
- La herencia de Usuario (Cliente/Profesional) tuvo varias vueltas el 2026-09-23 — ver la sección dedicada "Herencia de Usuario" más abajo, tiene el historial completo y el estado actual real del código.
- **(2026-09-24) Bug real post-merge, encontrado probando con Thunder Client:** `tipos-de-servicio.module.ts` había perdido el `imports: [...]` completo en el merge (sin `TypeOrmModule.forFeature`), `tsc` compilaba bien pero la app se caía al arrancar (`UnknownDependenciesException`). Se corrigió listando `[TiposDeServicio, Especialidad]` en el forFeature del módulo. Lección: después de cualquier merge que toque varios módulos, no alcanza con `tsc --noEmit` — hay que levantar el server (`pnpm run start`) para confirmar que el árbol de dependencias de Nest arma bien, porque ese tipo de error es invisible para TypeScript.
- **(2026-09-24) Bug real de tipo de dato, encontrado probando `POST /cliente` con un teléfono real:** `telefono` en `usuario.entity.ts` estaba tipado `number`, que TypeORM mapea a `INT` en MySQL (límite 2.147.483.647) — un teléfono con característica (ej. `3411112222`) se pasa de ese límite y tira `ER_WARN_DATA_OUT_OF_RANGE`, devolviendo un 500 genérico sin pista del motivo real (hay que mirar el log del server, no la respuesta HTTP). Se corrigió cambiando `telefono` a `string` en la entidad y en `create-usuario.dto.ts` (`@IsString()` en vez de `@IsInt() @IsPositive()`) — es además la forma correcta de guardar teléfonos (permite ceros a la izquierda, nunca se usan para cuentas).
- **(2026-09-24) Validación de correo duplicado entre Cliente y Profesional: implementada y probada.** Ver "Preguntas abiertas" más abajo, se sacó de ahí — quedó resuelta.
- **(2026-09-30) Soft delete vs. delete físico: DECIDIDO por el profesor en clase de consulta.** Le gusta el soft delete (borrado lógico), así que se queda como estaba en la mayoría de las entidades. El desnivel real era que `Cliente` y `Profesional` (traídos de la rama de Mica) hacían delete físico (`repository.remove(entity)`) en vez de soft delete, a pesar de que la columna `deleteAt` ya existe en las dos tablas (la heredan de `Usuario` vía `@DeleteDateColumn()`). Se corrigió `ClienteService.remove()` y `ProfesionalService.remove()` para usar `repository.softDelete({ idUsuario: id })` en vez de `repository.remove()`, igual que el resto del proyecto. Probado con Thunder Client/curl: después del `DELETE`, la fila desaparece de `GET /cliente` y `GET /cliente/:id` (404), pero sigue existiendo en la tabla con `deleteAt` seteado — TypeORM filtra automáticamente las filas soft-deleted en los `find`/`findOneBy` normales. Con esto ya no queda ninguna entidad con delete físico en el proyecto.

## Herencia de Usuario — historial completo y estado actual (última actualización 2026-09-23)

Este tema se discutió mucho el 23/09, con varias vueltas. Leer esto entero antes de tocar `Usuario`, `Cliente` o `Profesional`.

### Cómo llegamos acá (orden cronológico)

1. **Post-merge de la rama de Mica (estado inicial del 23/09):** `Usuario` tenía `@Entity()` con `idUsuario` como PK. `Cliente`/`Profesional` hacían `extends Usuario` con su propio `@Entity('clientes')`/`@Entity('profesionales')` — esto es "Concrete Table Inheritance": 3 tablas reales (`usuario`, `clientes`, `profesionales`), cada una de las últimas dos con las columnas de Usuario **duplicadas**, sin relación entre sí. Esto no compilaba: `cliente.service.ts`/`profesional.service.ts` hacían `findOneBy({ id })`, pero la entidad real del repo usa `idUsuario`, no `id` (se corrigió en su momento).
2. **Se implementó Class Table Inheritance real (2026-09-21):** `idUsuario` pasó a ser PK propia y a la vez FK a `usuario.idUsuario` en Cliente/Profesional (con `@OneToOne` + `@JoinColumn`). `create()` pasó a crear primero el Usuario base y después el Cliente/Profesional enganchado a ese id. Funcionaba y compilaba bien.
3. **El equipo (Mica) planteó que le parecía más simple su propio enfoque** (mensajes de WhatsApp del 2026-09-21). Se discutió el trade-off: con CTI+FK, un mismo Usuario puede ser Cliente y Profesional a la vez sin duplicar datos, y no se pueden repetir ids entre las dos tablas. Con el enfoque de Mica (tablas separadas sin relación), el id se puede repetir entre Cliente y Profesional (son contadores independientes), no hay unicidad de mail entre las dos tablas, y para ser las dos cosas hay que registrarse dos veces con datos duplicados. **El equipo decidió aceptar ese trade-off a propósito** — no es un error, es una decisión consciente para simplificar el código.
4. **(2026-09-23) Se volvió al esquema original de Mica:** `Cliente`/`Profesional` otra vez `extends Usuario` con tablas separadas duplicadas (paso 1, sin el FK del paso 2). Los services volvieron a operar sobre una sola tabla cada uno. Se mantuvo la corrección real de bug de los lookups de `idZonaResidencia`/`idsZonasCobertura` (eso no era parte de la herencia, era un bug aparte).
5. **Se comparó con el código real de `Usuario` que tenía Mica localmente** (nunca se había mergeado al repo — por eso el bug del paso 1: su `Cliente`/`Profesional` estaban escritos contra una versión de `Usuario` distinta a la que había en el repo). Su versión: `id` en vez de `idUsuario`, `dni: string` con `unique: true`, `telefono: string` opcional, agrega `fechaNacimiento`, no tiene `rol`, y **no tiene `@Entity()` (es `abstract class`)**.
6. **Decisiones tomadas sobre esos puntos (2026-09-23):**
   - `idUsuario` se mantiene (NO se cambia a `id`) — cambiarlo afecta el nombre de columna FK que ya usan `PrecioBase`, `SolicitudDeServicio` y la tabla intermedia Zona↔Profesional
   - `dni` se mantiene sin `unique` — un DNI puede repetirse entre países, forzar unicidad rompería altas legítimas
   - Se agregó `fechaNacimiento` (`type: 'date'`, obligatoria) a la entidad y al DTO de creación
   - Se sacó `rol` de la entidad y del DTO — con Cliente/Profesional como tablas reales, el rol ya está implícito en qué tabla tiene la fila; guardarlo aparte era información duplicada. Se confirmó con grep que no lo usaba nada más en el código antes de sacarlo
   - **Se sacó `@Entity()` de `Usuario`, ahora es `export abstract class Usuario`** (sin `@Entity()`, sin decorador `Entity` importado)

### Estado ACTUAL del código (2026-09-23)

- `Usuario` (`src/usuario/entities/usuario.entity.ts`) es una clase abstracta, **sin tabla propia**. Solo define columnas que se copian a cada subclase.
- `Cliente` y `Profesional` siguen con `extends Usuario` + su propio `@Entity()`. Ahora son las **únicas** tablas que realmente tienen los datos de una persona (dni, nombre, apellido, fechaNacimiento, correo, contraseña, telefono) — duplicados entre las dos, sin relación entre ellas.
- **El módulo standalone `/usuario` quedó desconectado, no borrado.** Los archivos (`usuario.controller.ts`, `usuario.service.ts`, `usuario.module.ts`, DTOs, specs) siguen existiendo en `src/usuario/` tal cual estaban, pero se sacó el `import { UsuarioModule }` de `app.module.ts`. Esto era obligatorio: si `UsuarioModule` sigue registrado, la app **se cae al arrancar**, porque `TypeOrmModule.forFeature([Usuario])` necesita que `Usuario` tenga `@Entity()`, y ya no lo tiene. TypeScript no avisa de esto en tiempo de compilación (compila bien), el error es en runtime al levantar el server.
- **Punto de decisión pendiente, sin resolver todavía:** ¿se borran directamente los archivos de `src/usuario/` (controller/service/module/dto), ya que no se van a volver a usar? ¿O se dejan ahí por si en algún futuro hace falta un Usuario genérico? Por ahora quedaron sin tocar, solo desconectados.
- Como el proyecto usa `synchronize: true`, si en MySQL ya existía una tabla `usuario` de pruebas anteriores, TypeORM ya no la va a tocar (no hay entidad que la describa) — queda huérfana en la base, se puede borrar a mano si molesta.

### Qué falta probar (con Thunder Client, según lo charlado)

1. Confirmar que MySQL está levantado y correr el server (`pnpm run start:dev` o el script que usen)
2. Probar `POST /cliente` con un body completo: `dni`, `nombre`, `apellido`, `fechaNacimiento`, `correo`, `contraseña`, `telefono`, `direccion`, `idZonaResidencia` — confirmar que crea bien la fila en `clientes`
3. Probar `POST /profesional` igual, con `idsZonasCobertura` como array
4. Confirmar que `/usuario` ya NO responde nada (404 de ruta no encontrada) — es esperado, es standalone y quedó desconectado
5. ~~Si quieren ver en la práctica el trade-off aceptado en el punto 3 del historial: probar crear un Cliente y un Profesional con el mismo `correo` y confirmar que la base lo deja (no hay validación cruzada)~~ — probado el 2026-09-24, y a partir de ese mismo día ya NO se deja: se agregó validación cruzada (ver abajo)

**(2026-09-24) Validación de correo duplicado — implementada, y después afinada el mismo día.** Primera versión: `ClienteService.create()`/`ProfesionalService.create()` bloqueaban cualquier correo repetido entre las dos tablas, sin excepción. Mica hizo una observación correcta: eso bloqueaba también el caso legítimo de una misma persona que quiere ser Cliente y Profesional a la vez (el trade-off que el equipo ya había aceptado a propósito, ver historial de Herencia de Usuario). Se afinó la regla:
- Correo repetido **en la misma tabla** (dos Clientes, o dos Profesionales) → siempre se bloquea, no depende de nada más.
- Correo repetido **en la tabla contraria** → se permite si el `dni` de la fila encontrada coincide con el `dni` del nuevo registro (es la misma persona registrándose como las dos cosas); se bloquea si el `dni` es distinto (dos personas distintas peleándose por el mismo correo).
- Ambos casos de bloqueo tiran `ConflictException` (409) — es el código HTTP correcto para "ya existe un recurso", a diferencia del 400 que se usa para "el id referenciado no existe".
- Cuando la misma persona se registra en las dos tablas, quedan como dos filas totalmente independientes (cada una con su propio `idUsuario`, que pueden incluso coincidir en número sin problema) — no hay ninguna FK ni relación real entre ellas, comparten correo y dni nada más porque son la misma persona.
- Probado con Thunder Client/curl: mismo dni+correo entre Cliente y Profesional → `201` en ambos; dni distinto con correo ya usado → `409` con `"Ese correo ya está en uso por otra persona"`; correo repetido en la misma tabla → `409` con `"Ya existe un cliente/profesional registrado con ese correo"`.
- Sigue sin existir ninguna restricción `unique` a nivel de columna para `correo` ni `dni` — esto es solo una validación de aplicación, no de base de datos.

**(2026-09-30) DECISIÓN DEL PROFESOR — se revirtió la excepción por DNI.** El profesor definió que si alguien se registra como Cliente y después quiere ser Profesional (o al revés), tiene que usar **otro correo**. Así que la regla ahora es estricta: el correo no se puede repetir ni en la misma tabla ni entre Cliente y Profesional, sin importar el DNI. En `ClienteService.create()`/`ProfesionalService.create()` se sacó la comparación de `dni`; si el correo existe en la otra tabla tira `409` con `"Ese correo ya está registrado como profesional/cliente, usá otro correo"`. Probado: registrar como Profesional a un Cliente existente con el mismo correo y mismo DNI → `409`.

**(2026-09-30) `correo` con `unique: true` en `usuario.entity.ts`.** Por la herencia, crea un índice único por tabla (`clientes` y `profesionales` por separado), no entre las dos; el cruce lo sigue cubriendo el service. Choque encontrado con el soft delete: la validación buscaba con `findOneBy`, que ignora las filas dadas de baja, pero la fila sigue en la tabla y el `unique` de MySQL la ve → registrar con el correo de alguien dado de baja pasaba la validación y explotaba con `ER_DUP_ENTRY` (500 genérico). Se corrigió buscando con `findOne({ where: { correo }, withDeleted: true })` en los 4 chequeos de correo (Cliente y Profesional). Ahora da `409` y un correo usado queda bloqueado aunque la cuenta se dé de baja.

### Preguntas abiertas para el equipo / el profesor

- Confirmar con el profesor si este esquema (Concrete Table Inheritance, sin relación real entre Usuario/Cliente/Profesional) es aceptable para la entrega — el diagrama original que habían compartido pedía Class Table Inheritance con FK
- Decidir definitivamente qué hacer con los archivos muertos de `src/usuario/`

## Modelo de dominio (diagrama compartido 2026-09-16)

- `Usuario` (dni, nombre, apellido, correo, contraseña, telefono, rol) es la superclase; hereda a `Cliente` y `Profesional` únicamente — se descartó el rol Admin. **Actualizado 2026-09-23:** se sacó `rol` y se agregó `fechaNacimiento` (ver "Estado de avance" para el motivo)
- `Cliente` (atributo propio: direccion) se relaciona con `SolicitudServicio` (1 cliente : * solicitudes); NO tiene relación con `MetodoPago` (corrección indicada por el profesor)
- `Profesional` (atributo propio: matricula) se relaciona con `SolicitudServicio` (1 profesional : * solicitudes) y con `Especialidad` a través de `PrecioBase`
- `PrecioBase` (precio, fechaDesde) es la entidad intermedia entre `Profesional` y `Especialidad`
- `Especialidad` (idEspecialidad, nombreEspecialidad, descripcionEspecialidad) 1..1 : `TipoServicio` 1..*
- `TipoServicio`: idServicio, descripcionServicio, nombreServicio
- `Provincia` (idProvincia, nombreProvincia) 1..1 : `Localidad` 1..*
- `Localidad` (idLocalidad, codigoPostal, nombreLocalidad) 1..1 : `Zona` 1..*
- `Zona` (idZona, nombreZona): Cliente-Zona es 1..1 Zona : 1..* Cliente; Profesional-Zona es N..N (el profesional puede cubrir varias zonas). Por la diferencia de cardinalidad se decidió NO unificarlas en Usuario y mantenerlas separadas: Cliente-Zona queda como relación simple. **Nota:** originalmente se había planeado resolver Profesional-Zona con una entidad intermedia tipo `ZonaCobertura` (mismo patrón que `PrecioBase`), pero Mica lo implementó como `@ManyToMany` directo con `@JoinTable` en Profesional — no hay entidad intermedia. Queda usable así, pero es una desviación del plan original, evaluar si vale la pena unificar criterio.
- `MetodoPago` (idFormaPago, tipo, estado) se relaciona con `SolicitudServicio` (no con Cliente)
- `Promocion` (codigo, fechaInicioVigencia, fechaFinVigencia, porcentajeDescuento, descripcion) se relaciona con `MetodoPago`
- `SolicitudServicio`: idSolicitud, estadoServicio, visitaPrevia, fechaSolicitud, fechaVisita, horaInicio, horaFinEstimada, duracionEstimada, horaFinReal, costoEstimado, costoFinal, calificacionServicio, reseñaServicio

## Puntos pendientes / abiertos

- Sin resolver en el equipo: si hace falta una entidad `Turnos` aparte. Una anotación dice que `SolicitudServicio` ya cumple ese rol (sugerido por una IA, salvo que se planee que el profesional tenga una agenda de turnos vacía para que los clientes reserven); otra anotación en el mismo diagrama sostiene que sí hace falta crear `Turnos` porque ocupa un lugar propio en la base de datos. Falta charlarlo con el equipo.
- Evaluar agregar el atributo "disponibilidad" directamente a `Profesional`; Mica anotó que según una IA no sería necesario plasmar los días y horarios en que trabaja el profesional para el alcance del proyecto, pero quieren pedirle opinión a Arnold antes de decidir.
- Mica preguntó qué significa el campo `visitaPrevia` en `SolicitudServicio` — sin resolver todavía.

## Equipo
Lautaro y Mica son compañeros de equipo en este proyecto.

## Recordatorios para mí
- Vengo de JS, estoy afianzando TypeScript de a poco — si algo no cierra, repasar tipos antes de asumir bug de lógica.
- Las dos máquinas no comparten este archivo automáticamente (está en .gitignore, no viaja por git) — si actualizo notas importantes en una máquina, pasarle el contenido a Claude en la otra para que lo recree acá a mano.
