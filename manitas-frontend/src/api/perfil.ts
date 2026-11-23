// Perfil de la persona logueada
import { api } from './client'
import type { CambiosPerfilCliente, CambiosPerfilProfesional, PerfilCliente, PerfilProfesional } from '../types'

export interface UbicacionCliente {
  direccion: string // "Calle 123, piso 2, depto B, Zona": donde son las visitas
  idZona: number | null // para buscar profesionales que trabajan en su zona
  nombreZona: string | null
}

// ---------- Cliente ----------

export async function traerPerfilCliente(): Promise<PerfilCliente> {
  return api.get<PerfilCliente>('/auth/perfil')
}

export async function guardarPerfilCliente(id: number, cambios: CambiosPerfilCliente): Promise<void> {
  await api.patch(`/cliente/${id}`, cambios)
}

// Cliente: dónde vive (sale de su perfil)
export async function traerUbicacionCliente(): Promise<UbicacionCliente> {
  const perfil = await api.get<PerfilCliente>('/auth/perfil')
  return {
    direccion: armarDireccion(perfil),
    idZona: perfil.zonaResidencia?.idZona ?? null,
    nombreZona: perfil.zonaResidencia?.nombreZona ?? null,
  }
}

function armarDireccion(perfil: PerfilCliente): string {
  const partes = [`${perfil.calle} ${perfil.altura}`]
  if (perfil.piso) partes.push(`piso ${perfil.piso}`)
  if (perfil.depto) partes.push(`depto ${perfil.depto}`)
  if (perfil.zonaResidencia?.nombreZona) partes.push(perfil.zonaResidencia.nombreZona)
  return partes.join(', ')
}

export async function traerPerfilProfesional(): Promise<PerfilProfesional> {
  return api.get<PerfilProfesional>('/auth/perfil')
}

export async function guardarPerfilProfesional(id: number, cambios: CambiosPerfilProfesional): Promise<void> {
  await api.patch(`/profesional/${id}`, cambios)
}

// Pide la actual: el back la verifica antes de cambiarla
export async function cambiarContraseña(contraseñaActual: string, contraseñaNueva: string): Promise<void> {
  await api.patch('/auth/contrasena', { contraseñaActual, contraseñaNueva })
}

// Dar de baja la propia cuenta (borrado lógico: el correo queda bloqueado)
export async function darDeBajaCuenta(rol: 'cliente' | 'profesional', id: number): Promise<void> {
  await api.delete(`/${rol}/${id}`)
}