import { redirect } from "next/navigation";
import { rutaInicio, usuarioActual } from "@/lib/auth/guard";

export default async function Inicio() {
  const usuario = await usuarioActual();
  redirect(usuario ? rutaInicio(usuario.rol) : "/login");
}
