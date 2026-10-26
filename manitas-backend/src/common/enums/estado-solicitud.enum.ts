export enum EstadoSolicitud {
  SOLICITADO = 'solicitado', // el cliente pidio y eligio el turno de la visita
  AGENDADO = 'agendado', // el profesional acepto: la visita esta confirmada
  PRESUPUESTADO = 'presupuestado', // el profesional paso el precio y las horas del trabajo
  CONTRATADO = 'contratado', // el cliente acepto y el trabajo tiene su horario
  REPROGRAMACION = 'reprogramacion', // alguien propuso otro horario y el otro tiene que contestar
  FINALIZADO = 'finalizado', // pagado por la app
  RECHAZADO = 'rechazado',
  CANCELADO = 'cancelado',
  EXPIRADO = 'expirado',
}
