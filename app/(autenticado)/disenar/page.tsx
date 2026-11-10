import { exigirUsuario } from "@/lib/auth/guard";
import { ROLES } from "@/lib/dominio";
import { EditorMotivo } from "@/components/EditorMotivo";

export const metadata = { title: "Diseñar motivo | Laboratorio de crochet" };

/** Figura 12: laboratorio de diseño (CU 1 y CU 2). */
export default async function PaginaDisenar() {
  await exigirUsuario(ROLES.CLIENTE);
  return <EditorMotivo />;
}
