# Seguimiento de features, bugs e issues

> Requisito de la cátedra (regularidad y aprobación). La recomendación es usar **GitHub Projects** sobre el mismo
> repositorio, con un *issue* por feature o bug, asignado a un integrante y enlazado a su PR.

**Tablero:** _(completar con el link al GitHub Project o la herramienta usada)_

## Features implementadas

Para completar con el link al issue/PR de cada una y su responsable.

| Feature | Parte | Responsable | Issue / PR |
| --- | --- | --- | --- |
| Registro y login con JWT (3 roles) | back + front | | |
| Catálogo geográfico (provincia, localidad, zona) + seed Georef | back + front | | |
| Perfil del profesional (especialidades, habilidades, matrículas, zonas, CBU) | back + front | | |
| Perfil del cliente (edición y baja) | back + front | | |
| Horario laboral y turnos libres | back + front | | |
| Buscar profesionales y pedir presupuesto con turno | back + front | | |
| Servicio urgente | back + front | | |
| Aceptar / rechazar / reprogramar solicitudes | back + front | | |
| Presupuesto y confirmación del servicio | back + front | | |
| Pago con Mercado Pago (sandbox) | back + front | | |
| Calificaciones y reseñas | back + front | | |
| Promociones bancarias del mes | back + front | | |
| Avisos (notificaciones dentro de la app) | back + front | | |
| Agenda y cobros del profesional | back + front | | |
| Ayuda: preguntas frecuentes y consultas | back + front | | |
| Panel de administración (CRUD de catálogos) | front | | |
| Tests automáticos (unitarios, integración, componente, e2e) | back + front | | |
| Documentación (API, instalación, evidencia de tests) | docs | | |

## Bugs corregidos (ejemplos para registrar)

| Bug | Causa | Solución | Issue / PR |
| --- | --- | --- | --- |
| El back no arrancaba en carpetas con espacios o "ñ" | El plugin de Swagger generaba rutas absolutas | `controllerFileNameSuffix: []` en `nest-cli.json` | |
| Al volver de Mercado Pago se perdían los datos del pago | La URL de vuelta apuntaba a una ruta inexistente del front | Ruta `/app/solicitudes` que confirma el pago (y redirección desde `/solicitudes`) | |
| Jest no cargaba `@nestjs/typeorm` / `@nestjs/config` (ESM) | Paquetes publicados como ESM | `moduleNameMapper` a stubs de test + transformación de `@nestjs/jwt` | |