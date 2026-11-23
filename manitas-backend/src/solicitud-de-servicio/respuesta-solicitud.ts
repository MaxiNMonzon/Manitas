import type { Cliente } from '../cliente/entities/cliente.entity';
import type { Profesional } from '../profesional/entities/profesional.entity';

// Lo que se manda de cada persona en una solicitud: solo lo que usa el front.
// DNI, correo, fecha de nacimiento, CBU y demás datos de la cuenta no salen nunca acá
// (cada uno los ve en su propio perfil). El servicio trabaja con las entidades completas;
// esto se aplica recién al responder, en el controlador.

// Del profesional, el cliente ve con quién trata y su teléfono (para escribirle por WhatsApp)
function profesionalPublico(profesional: Profesional) {
  return {
    idUsuario: profesional.idUsuario,
    nombre: profesional.nombre,
    apellido: profesional.apellido,
    telefono: profesional.telefono,
  };
}

// Del cliente, el profesional ve su teléfono y dónde es la visita
function clientePublico(cliente: Cliente) {
  return {
    idUsuario: cliente.idUsuario,
    nombre: cliente.nombre,
    apellido: cliente.apellido,
    telefono: cliente.telefono,
    calle: cliente.calle,
    altura: cliente.altura,
    piso: cliente.piso,
    depto: cliente.depto,
    zonaResidencia: cliente.zonaResidencia
      ? { idZona: cliente.zonaResidencia.idZona, nombreZona: cliente.zonaResidencia.nombreZona }
      : cliente.zonaResidencia,
  };
}

// Devuelve la solicitud igual, pero con el profesional y el cliente recortados.
// Si la relación no se cargó (o es una urgente sin profesional), la deja como está
export function sinDatosPrivados<T extends { profesional?: Profesional | null; cliente?: Cliente | null }>(solicitud: T | null) {
  if (!solicitud) return null;
  return {
    ...solicitud,
    profesional: solicitud.profesional ? profesionalPublico(solicitud.profesional) : solicitud.profesional,
    cliente: solicitud.cliente ? clientePublico(solicitud.cliente) : solicitud.cliente,
  };
}
