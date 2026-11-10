"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { MIN_CONTRASENA, ROLES } from "@/lib/dominio";
import type { EstadoFormulario } from "@/lib/errores";
import { mensajeSeguro } from "@/lib/errores";
import {
  hashearContrasena,
  obtenerHashDeRelleno,
  verificarContrasena,
} from "@/lib/auth/password";
import { cerrarSesion, crearSesion } from "@/lib/auth/session";
import { rutaInicio } from "@/lib/auth/guard";

const esquemaRegistro = z.object({
  nombre: z.string().trim().min(1, "Ingresá tu nombre.").max(100, "El nombre es demasiado largo."),
  correo: z
    .string()
    .trim()
    .toLowerCase()
    .email("Ingresá un correo electrónico válido.")
    .max(254, "El correo es demasiado largo."),
  contrasena: z
    .string()
    .min(MIN_CONTRASENA, `La contraseña debe tener al menos ${MIN_CONTRASENA} caracteres.`)
    .max(128, "La contraseña es demasiado larga."),
});

const esquemaLogin = z.object({
  correo: z.string().trim().toLowerCase().email().max(254),
  contrasena: z.string().min(1).max(128),
});

const ERROR_CREDENCIALES = "Correo o contraseña incorrectos.";

export async function registrarCliente(
  _estado: EstadoFormulario | undefined,
  formData: FormData,
): Promise<EstadoFormulario> {
  const datos = esquemaRegistro.safeParse({
    nombre: formData.get("nombre"),
    correo: formData.get("correo"),
    contrasena: formData.get("contrasena"),
  });
  if (!datos.success) return { error: datos.error.issues[0].message };

  try {
    const existente = await prisma.usuario.findUnique({
      where: { correo: datos.data.correo },
      select: { idUsuario: true },
    });
    if (existente) return { error: "Ese correo electrónico ya está registrado." };

    const usuario = await prisma.usuario.create({
      data: {
        nombre: datos.data.nombre,
        correo: datos.data.correo,
        contrasenaHash: await hashearContrasena(datos.data.contrasena),
        rol: ROLES.CLIENTE,
      },
      select: { idUsuario: true },
    });
    await crearSesion(usuario.idUsuario, ROLES.CLIENTE);
  } catch (error) {
    // Dos registros simultáneos con el mismo correo: la restricción única de la base lo detecta.
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
      return { error: "Ese correo electrónico ya está registrado." };
    }
    return { error: mensajeSeguro(error) };
  }
  redirect(rutaInicio(ROLES.CLIENTE));
}

export async function iniciarSesion(
  _estado: EstadoFormulario | undefined,
  formData: FormData,
): Promise<EstadoFormulario> {
  const datos = esquemaLogin.safeParse({
    correo: formData.get("correo"),
    contrasena: formData.get("contrasena"),
  });
  if (!datos.success) return { error: ERROR_CREDENCIALES };

  let destino: string;
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { correo: datos.data.correo },
      select: { idUsuario: true, contrasenaHash: true, rol: true },
    });
    // Se verifica siempre contra un hash para no revelar si el correo existe.
    const hashAComparar = usuario?.contrasenaHash ?? (await obtenerHashDeRelleno());
    const coincide = await verificarContrasena(hashAComparar, datos.data.contrasena);
    if (!usuario || !coincide) return { error: ERROR_CREDENCIALES };
    if (usuario.rol !== ROLES.CLIENTE && usuario.rol !== ROLES.ARTESANA) {
      return { error: ERROR_CREDENCIALES };
    }
    await crearSesion(usuario.idUsuario, usuario.rol);
    destino = rutaInicio(usuario.rol);
  } catch (error) {
    return { error: mensajeSeguro(error) };
  }
  redirect(destino);
}

export async function cerrarSesionAccion(): Promise<void> {
  await cerrarSesion();
  redirect("/login");
}
