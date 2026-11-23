-- Pasa las columnas de dinero de INT a DECIMAL(12,2) sin perder los montos guardados.
--
-- Correrlo UNA vez en cada base que ya existía (local y producción) ANTES de levantar el back
-- con la versión nueva. Si no se corre, synchronize de TypeORM ve el cambio de tipo y resuelve
-- borrando la columna y creándola de nuevo: se pierden todos los costos.
-- En una base nueva no hace falta (synchronize ya crea las columnas como DECIMAL).
-- Se puede correr más de una vez: si ya son DECIMAL(12,2), no cambia nada.

ALTER TABLE solicitud_de_servicio
  MODIFY costoVisita DECIMAL(12,2) NULL,
  MODIFY costoEstimado DECIMAL(12,2) NULL,
  MODIFY costoFinal DECIMAL(12,2) NULL;

ALTER TABLE profesionales
  MODIFY costoVisita DECIMAL(12,2) NULL;