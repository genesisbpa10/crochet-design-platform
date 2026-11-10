import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";
import { ROLES, type Rol } from "@/lib/dominio";

const NOMBRE_COOKIE = "sesion";
const DURACION_SEGUNDOS = 60 * 60 * 8;

export interface DatosSesion {
  idUsuario: number;
  rol: Rol;
}

function clave(): Uint8Array {
  const secreto = process.env.SESSION_SECRET;
  if (!secreto || secreto.length < 32) {
    throw new Error("SESSION_SECRET no está configurada (mínimo 32 caracteres).");
  }
  return new TextEncoder().encode(secreto);
}

function esRol(valor: unknown): valor is Rol {
  return valor === ROLES.CLIENTE || valor === ROLES.ARTESANA;
}

export async function crearSesion(idUsuario: number, rol: Rol): Promise<void> {
  const token = await new SignJWT({ rol })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(idUsuario))
    .setIssuedAt()
    .setExpirationTime(`${DURACION_SEGUNDOS}s`)
    .sign(clave());

  (await cookies()).set(NOMBRE_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: DURACION_SEGUNDOS,
  });
}

export async function leerSesion(): Promise<DatosSesion | null> {
  const token = (await cookies()).get(NOMBRE_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, clave(), { algorithms: ["HS256"] });
    const idUsuario = Number(payload.sub);
    if (!Number.isInteger(idUsuario) || !esRol(payload.rol)) return null;
    return { idUsuario, rol: payload.rol };
  } catch {
    return null;
  }
}

export async function cerrarSesion(): Promise<void> {
  (await cookies()).delete(NOMBRE_COOKIE);
}
