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




ENTIDADES
.
Usuario
   -Cliente
   -Profesional
Localidad
Especialidad
Zona
TipoServicio
SolicitudServicio
Metodo de Pago*
Promocion*

.
.

CRUD SIMPLE
.
Usuario cliente
Usuario profesional
Localidad
Especialidad

.
.

CRUD DEPENDIENTE
.
Zona
Servicio

.
.

CASOS DE USO
.
Solicitar servicio
Solicitar presupuesto
Confirmar servicio
Coordinar visita
Abonar servicio
Calificar profesional

.
.

EPIC
.
Informar promos bancarias del mes
Notificar próximas visitas

---------------------------------------------------------------------------------------------------------------------------------------------------


