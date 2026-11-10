import { redirect } from "next/navigation";
import { rutaInicio, usuarioActual } from "@/lib/auth/guard";

export default async function LayoutPublico({ children }: { children: React.ReactNode }) {
  const usuario = await usuarioActual();
  if (usuario) redirect(rutaInicio(usuario.rol));
  return (
    <>
      <header>
        <div className="encabezado">
          <span className="marca">Laboratorio de crochet</span>
        </div>
        <div className="franja" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
      </header>
      <main className="pagina">{children}</main>
    </>
  );
}
