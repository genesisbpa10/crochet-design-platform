import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { ROLES, type Rol } from "@/lib/dominio";
import { leerSesion } from "@/lib/auth/session";

export interface UsuarioActual {
  idUsuario: number;
  nombre: string;
  rol: Rol;
}

/** Usuario de la sesión vigente, o null si no hay sesión válida. */
export async function usuarioActual(): Promise<UsuarioActual | null> {
  const sesion = await leerSesion();
  if (!sesion) return null;
  const usuario = await prisma.usuario.findUnique({
    where: { idUsuario: sesion.idUsuario },
    select: { idUsuario: true, nombre: true, rol: true },
  });
  if (!usuario) return null;
  if (usuario.rol !== ROLES.CLIENTE && usuario.rol !== ROLES.ARTESANA) return null;
  return { idUsuario: usuario.idUsuario, nombre: usuario.nombre, rol: usuario.rol };
}

/** Pantalla de inicio de cada perfil. */
export function rutaInicio(rol: Rol): string {
  return rol === ROLES.ARTESANA ? "/recibidas" : "/disenar";
}

/**
 * Autorización en el servidor: exige sesión y, si se indica, un perfil determinado.
 * Se debe llamar en cada página y en cada acción de servidor.
 */
export async function exigirUsuario(rol?: Rol): Promise<UsuarioActual> {
  const usuario = await usuarioActual();
  if (!usuario) redirect("/login");
  if (rol && usuario.rol !== rol) redirect(rutaInicio(usuario.rol));
  return usuario;
}
