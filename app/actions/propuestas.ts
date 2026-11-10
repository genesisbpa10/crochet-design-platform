"use server";

import { redirect } from "next/navigation";
import { exigirUsuario } from "@/lib/auth/guard";
import { ROLES } from "@/lib/dominio";
import type { EstadoFormulario } from "@/lib/errores";
import { mensajeSeguro } from "@/lib/errores";
import { enviarPropuesta, evaluarPropuesta } from "@/services/propuestas";

export async function enviarPropuestaAccion(
  _estado: EstadoFormulario | undefined,
  formData: FormData,
): Promise<EstadoFormulario> {
  const usuario = await exigirUsuario(ROLES.CLIENTE);
  const idMotivo = Number(formData.get("idMotivo"));
  const descripcion = String(formData.get("descripcion") ?? "");

  let idPropuesta: number;
  try {
    if (!Number.isInteger(idMotivo) || idMotivo <= 0) {
      return { error: "Elegí un motivo guardado." };
    }
    idPropuesta = await enviarPropuesta(usuario.idUsuario, idMotivo, descripcion);
  } catch (error) {
    return { error: mensajeSeguro(error) };
  }
  redirect(`/mis-propuestas?id=${idPropuesta}`);
}

export async function evaluarPropuestaAccion(
  _estado: EstadoFormulario | undefined,
  formData: FormData,
): Promise<EstadoFormulario> {
  const usuario = await exigirUsuario(ROLES.ARTESANA);
  const idPropuesta = Number(formData.get("idPropuesta"));
  const montoTexto = String(formData.get("monto") ?? "").trim();

  try {
    await evaluarPropuesta(usuario.idUsuario, {
      idPropuesta,
      resultado: formData.get("resultado"),
      observaciones: String(formData.get("observaciones") ?? ""),
      ajustes: formData.getAll("ajuste").map(String),
      monto: montoTexto === "" ? undefined : Number(montoTexto),
    });
  } catch (error) {
    return { error: mensajeSeguro(error) };
  }
  redirect(`/recibidas/${idPropuesta}`);
}
