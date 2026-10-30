// Preguntas frecuentes de la sección "Ayuda", separadas por rol y agrupadas por tema.
// Las respuestas siguen las reglas que aplica el back (plazos, cancelaciones, pagos...)
import type { Rol } from '../../types'

export interface Pregunta {
  pregunta: string
  respuesta: string
}

export interface TemaAyuda {
  tema: string
  preguntas: Pregunta[]
}

const cliente: TemaAyuda[] = [
  {
    tema: 'Pedir un servicio',
    preguntas: [
      {
        pregunta: '¿Cómo pido un presupuesto?',
        respuesta:
          'Desde Inicio o desde "Mis solicitudes → Nueva solicitud" buscá un profesional por oficio o por nombre, abrí su perfil y tocá "Pedir turno". Contale el problema y elegí uno de sus turnos libres para que vaya a verlo. La solicitud le llega al instante.',
      },
      {
        pregunta: '¿Qué pasa después de enviar la solicitud?',
        respuesta:
          'El profesional tiene 48 horas para responder. Si la acepta, la visita queda confirmada en el horario que elegiste. También puede proponerte otro horario o rechazarla. Si no responde a tiempo, la solicitud vence y el turno se libera.',
      },
      {
        pregunta: '¿Qué es una solicitud urgente?',
        respuesta:
          'Es para algo que no puede esperar (una pérdida de agua, quedarte afuera de casa). Tocá "Es urgente", elegí el oficio y contá qué pasó: le llega a todos los profesionales de ese oficio en tu zona y el primero que la toma te dice a qué hora llega. Si nadie la toma en 1 hora, se cancela sola.',
      },
      {
        pregunta: '¿Por qué no veo profesionales cerca?',
        respuesta:
          'Te mostramos los que trabajan en la zona de tu domicilio. Revisá que tu zona esté bien cargada en "Mi perfil", o desactivá "Solo en mi zona" en el buscador para ver todos.',
      },
    ],
  },
  {
    tema: 'Visita y presupuesto',
    preguntas: [
      {
        pregunta: '¿Se cobra la visita?',
        respuesta:
          'Depende del profesional: en su perfil figura el costo de visita (o "Visita sin cargo"). Solo se cobra si después rechazás el presupuesto. Si lo aceptás, pagás únicamente el trabajo.',
      },
      {
        pregunta: '¿Cómo acepto un presupuesto?',
        respuesta:
          'Después de la visita, el profesional te manda el precio y cuántas horas lleva el trabajo. En "Mis solicitudes" abrí la solicitud y tocá "Aceptar presupuesto": elegí desde qué turno libre arranca (se reservan las horas seguidas) o, si es un trabajo de hasta 1 hora, que lo haga en el momento.',
      },
      {
        pregunta: '¿Puedo cambiar el día u horario?',
        respuesta:
          'Sí, desde el detalle de la solicitud con "Cambiar horario", hasta 12 horas antes de la visita o del trabajo. El profesional tiene que aceptar el horario nuevo; mientras tanto sigue valiendo el anterior. Si es una solicitud nueva todavía sin respuesta, cancelala y pedí de nuevo.',
      },
      {
        pregunta: '¿Puedo cancelar?',
        respuesta:
          'Podés cancelar mientras el profesional no respondió, y una visita confirmada en cualquier momento. Un trabajo ya contratado solo se puede cancelar dentro de las 6 horas de aceptar el presupuesto y antes de que empiece. Una urgencia, solo mientras nadie la tomó.',
      },
    ],
  },
  {
    tema: 'Pagos',
    preguntas: [
      {
        pregunta: '¿Cómo pago?',
        respuesta:
          'Cuando el trabajo empieza aparece el botón "Pagar" en la solicitud (y en la pestaña Pagos). Te lleva a Mercado Pago, donde elegís el medio y las cuotas. Al terminar tocá "Volver al sitio": la solicitud queda pagada y finalizada.',
      },
      {
        pregunta: 'Pagué pero la solicitud sigue sin pagar',
        respuesta:
          'Seguramente cerraste Mercado Pago sin tocar "Volver al sitio". Escribinos desde el formulario de abajo con el número de solicitud y el comprobante de Mercado Pago y lo revisamos.',
      },
      {
        pregunta: '¿Hay promociones con mi banco?',
        respuesta: 'En Inicio están las promos bancarias del mes. El reintegro lo hace tu banco según las condiciones de cada promo.',
      },
    ],
  },
  {
    tema: 'Mi cuenta',
    preguntas: [
      {
        pregunta: '¿Cómo cambio mis datos o mi dirección?',
        respuesta:
          'En "Mi perfil" tocá "Editar perfil". Tu dirección es donde van los profesionales, y la zona define a quiénes ves cerca. El DNI y la fecha de nacimiento no se pueden cambiar.',
      },
      {
        pregunta: '¿Cómo califico a un profesional?',
        respuesta: 'Cuando el trabajo queda pagado, en la solicitud aparece "Calificar": de 1 a 5 estrellas y una reseña opcional. Se puede calificar una sola vez.',
      },
    ],
  },
]

const profesional: TemaAyuda[] = [
  {
    tema: 'Solicitudes',
    preguntas: [
      {
        pregunta: '¿Por qué no me llegan solicitudes?',
        respuesta:
          'Los clientes eligen la visita entre tus turnos libres. Revisá que cargaste tu horario de trabajo en "Agenda → Mi horario de trabajo", y tus oficios y zonas en "Mi perfil". Sin horario, nadie te puede pedir una visita.',
      },
      {
        pregunta: '¿Cómo respondo una solicitud nueva?',
        respuesta:
          'En "Solicitudes → Nuevas" abrí la solicitud: podés aceptarla (la visita queda confirmada en el horario que eligió el cliente), proponer otro horario o rechazarla. Tenés 48 horas para responder; si no, vence.',
      },
      {
        pregunta: '¿Cómo funcionan las urgencias?',
        respuesta:
          'Las urgencias de tus oficios y zonas aparecen arriba de todo en Inicio y en "Solicitudes → Nuevas". La primera persona que la acepta se la queda: elegís en cuántos minutos llegás y al cliente le avisamos la hora. Duran 1 hora.',
      },
      {
        pregunta: '¿Puedo cambiar el horario de una visita o trabajo?',
        respuesta:
          'Sí, con "Proponer otro horario" en el detalle, hasta 12 horas antes. El cliente lo acepta o lo rechaza; mientras tanto sigue el horario anterior. Si el cliente propone uno, te aparece "Responder horario".',
      },
    ],
  },
  {
    tema: 'Presupuestos',
    preguntas: [
      {
        pregunta: '¿Cuándo mando el presupuesto?',
        respuesta:
          'Después de la visita (antes no se puede). En la solicitud tocá "Enviar presupuesto" con el precio y las horas que lleva el trabajo: con esas horas el cliente elige desde qué turno arranca y se reservan seguidas en tu agenda.',
      },
      {
        pregunta: '¿Puedo cambiar el precio a mitad del trabajo?',
        respuesta: 'Sí, con "Cambiar precio" en un trabajo contratado. El cliente lo tiene que volver a aceptar; el horario no cambia.',
      },
      {
        pregunta: '¿Y si el cliente rechaza el presupuesto?',
        respuesta: 'Si cobrás la visita (costo de visita en tu perfil), el cliente paga solo eso. Si no, la solicitud termina sin cargo.',
      },
    ],
  },
  {
    tema: 'Cobros',
    preguntas: [
      {
        pregunta: '¿Cómo y cuándo cobro?',
        respuesta:
          'El cliente paga por la app cuando empieza el trabajo. El dinero se deposita en tu CBU/CVU a los 3 días hábiles del pago. En la pestaña Cobros ves lo pendiente y lo ya depositado.',
      },
      {
        pregunta: '¿Dónde cargo mi CBU?',
        respuesta: 'En "Mi perfil → Datos para cobrar". Sin CBU/CVU no podemos depositarte.',
      },
    ],
  },
  {
    tema: 'Mi cuenta',
    preguntas: [
      {
        pregunta: '¿Cómo mejoro mi perfil?',
        respuesta:
          'Completá "Sobre mí", tus habilidades y matrículas en "Mi perfil". Los clientes ven tu calificación y las reseñas de trabajos anteriores al elegirte.',
      },
      {
        pregunta: '¿Puedo cambiar mis zonas u oficios?',
        respuesta: 'Sí, en "Mi perfil → Editar perfil". Las solicitudes y turnos que ya tenés no cambian.',
      },
    ],
  },
]

export const preguntasDe = (rol: Rol | undefined): TemaAyuda[] => (rol === 'profesional' ? profesional : cliente)