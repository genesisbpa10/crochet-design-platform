import { exigirUsuario } from "@/lib/auth/guard";
import { Encabezado } from "@/components/Encabezado";

export default async function LayoutAutenticado({ children }: { children: React.ReactNode }) {
  const usuario = await exigirUsuario();
  return (
    <>
      <Encabezado rol={usuario.rol} nombre={usuario.nombre} />
      <main className="pagina">{children}</main>
    </>
  );
}
