"use server";

import { exigirUsuario } from "@/lib/auth/guard";
import { ROLES } from "@/lib/dominio";
import { mensajeSeguro } from "@/lib/errores";
import { guardarMotivo } from "@/services/motivos";

export type ResultadoGuardado = { ok: true; id: number } | { ok: false; error: string };

export async function guardarMotivoAccion(entrada: unknown): Promise<ResultadoGuardado> {
  const usuario = await exigirUsuario(ROLES.CLIENTE);
  try {
    const id = await guardarMotivo(usuario.idUsuario, entrada);
    return { ok: true, id };
  } catch (error) {
    return { ok: false, error: mensajeSeguro(error) };
  }
}
