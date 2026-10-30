// Perfil de la persona logueada. Con la sesión demo (provisoria) usa datos mock.
import { api, tokenStorage } from './client'
import type { CambiosPerfilCliente, CambiosPerfilProfesional, PerfilCliente, PerfilProfesional } from '../types'
import { guardarPerfilClienteDemo, guardarPerfilDemo, perfilClienteDemo, perfilDemo } from '../mocks/perfil'

export interface UbicacionCliente {
  direccion: string // "Calle 123, piso 2, depto B, Zona": donde son las visitas
  idZona: number | null // para buscar profesionales que trabajan en su zona
  nombreZona: string | null
}

// ---------- Cliente ----------

export async function traerPerfilCliente(): Promise<PerfilCliente> {
  if (tokenStorage.esDemo()) return perfilClienteDemo
  return api.get<PerfilCliente>('/auth/perfil')
}

// `zona`: la zona elegida con su localidad y provincia, solo para que la demo pueda mostrarla
export async function guardarPerfilCliente(id: number, cambios: CambiosPerfilCliente, zona: PerfilCliente['zonaResidencia']): Promise<void> {
  if (tokenStorage.esDemo()) return guardarPerfilClienteDemo(cambios, zona)
  await api.patch(`/cliente/${id}`, cambios)
}

// Cliente: dónde vive (sale de su perfil)
export async function traerUbicacionCliente(): Promise<UbicacionCliente> {
  if (tokenStorage.esDemo()) {
    const p = perfilClienteDemo
    return { direccion: armarDireccion(p), idZona: null, nombreZona: p.zonaResidencia.nombreZona }
  }
  const p = await api.get<PerfilCliente>('/auth/perfil')
  return {
    direccion: armarDireccion(p),
    idZona: p.zonaResidencia?.idZona ?? null,
    nombreZona: p.zonaResidencia?.nombreZona ?? null,
  }
}

function armarDireccion(p: PerfilCliente): string {
  const partes = [`${p.calle} ${p.altura}`]
  if (p.piso) partes.push(`piso ${p.piso}`)
  if (p.depto) partes.push(`depto ${p.depto}`)
  if (p.zonaResidencia?.nombreZona) partes.push(p.zonaResidencia.nombreZona)
  return partes.join(', ')
}

export async function traerPerfilProfesional(): Promise<PerfilProfesional> {
  if (tokenStorage.esDemo()) return perfilDemo
  return api.get<PerfilProfesional>('/auth/perfil')
}

// `nombres`: lo elegido con su nombre, solo para que la demo pueda mostrarlo (la API lo arma sola)
export async function guardarPerfilProfesional(
  id: number,
  cambios: CambiosPerfilProfesional,
  nombres: Parameters<typeof guardarPerfilDemo>[1],
): Promise<void> {
  if (tokenStorage.esDemo()) return guardarPerfilDemo(cambios, nombres)
  await api.patch(`/profesional/${id}`, cambios)
}

// Pide la actual: el back la verifica antes de cambiarla
export async function cambiarContraseña(contraseñaActual: string, contraseñaNueva: string): Promise<void> {
  if (tokenStorage.esDemo()) {
    if (contraseñaActual.length < 8) throw new Error('La contraseña actual no es correcta')
    return
  }
  await api.patch('/auth/contrasena', { contraseñaActual, contraseñaNueva })
}

// Dar de baja la propia cuenta (borrado lógico: el correo queda bloqueado)
export async function darDeBajaCuenta(rol: 'cliente' | 'profesional', id: number): Promise<void> {
  if (tokenStorage.esDemo()) return
  await api.delete(`/${rol}/${id}`)
}