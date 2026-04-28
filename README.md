# Manitas

---------------------------------------------------------------------------------------------------------------------------------------------------
INTEGRANTES
---------------------------------------------------------------------------------------------------------------------------------------------------

56821 - Arias, Francisco Jose  
52098 - Monzon, Maximiliano Nicolas  
54456 - Baremboum, Micaela  
42062 - Coria, Lautaro  

---------------------------------------------------------------------------------------------------------------------------------------------------
REPOSITORIOS
---------------------------------------------------------------------------------------------------------------------------------------------------

(mas adelante backend-frontend)

---------------------------------------------------------------------------------------------------------------------------------------------------
TEMA
---------------------------------------------------------------------------------------------------------------------------------------------------

Aplicación que conecta clientes con profesionales de distintos oficios para resolver tareas del hogar.
Ofrece servicios urgentes con geolocalización y trabajos programados con comparación de precios.
Cada profesional define sus tarifas y recibe calificaciones.
Los clientes pueden pagar con tarjeta, billeteras virtuales o efectivo.
Incluye promociones según método de pago.
Apunta a brindar rapidez, confianza y variedad de opciones.}

---------------------------------------------------------------------------------------------------------------------------------------------------
MODELO
---------------------------------------------------------------------------------------------------------------------------------------------------

<img width="1301" height="752" alt="MD - DSW-MD drawio (1)" src="https://github.com/user-attachments/assets/c6a9bd41-b077-4243-87ec-42b62b63b720" />

https://drive.google.com/file/d/1yA9dty0EUn0jITPk4veSDCFWdFEMilrt/view

---------------------------------------------------------------------------------------------------------------------------------------------------
ALCANCE FUNCIONAL
---------------------------------------------------------------------------------------------------------------------------------------------------
Alcance Minimo


| Req | Detalle |
| :--- | :--- |
| **CRUD simple** | 1. CRUD Usuario <br>2. CRUD Tipo de Servicio <br>3. CRUD Localidad<br>4. CRUD Metodo de Pago|
| **CRUD dependiente** | 1. CRUD Zona {depende de} CRUD Localidad <br>2. CRUD Profesional {depende de} CRUD Especialidad|
| **Listado + detalle** | 1. Servicio por Tipo de Servicio <br>2. Profesional por Especialidad|
| **CUU/Epic** | 1. Informar promociones bancarias del mes <br>2. Notificar próximas visitas <br>3. Solicitud de Servicio  <br>4. Calificar Servicio|

Adicionales
| Req | Detalle |
| :--- | :--- |
| **CRUD** | 1. CRUD Usuario  <br>2. CRUD Tipo de Servicio <br>3. CRUD Localidad<br>4. CRUD Metodo de Pago <br>5. CRUD Zona|
| **CUU/Epic** | 1. Solicitar servicio<br>2. Calificar Servicio <br>3. Confirmar servicio<br>4. Coordinar visita<br>5. Abonar servicio<br>6. Calificar profesional<br>7. Informar promociones bancarias del mes<br>8. Notificar próximas visitas <br>9. Solicitar Presupuesto|

---------------------------------------------------------------------------------------------------------------------------------------------------


