import { cerrarSesionAccion } from "@/app/actions/auth";
import { ETIQUETA_ROL, ROLES, type Rol } from "@/lib/dominio";
import { NavegacionPrincipal, type EnlaceNavegacion } from "@/components/NavegacionPrincipal";

const ENLACES: Record<Rol, EnlaceNavegacion[]> = {
  [ROLES.CLIENTE]: [
    { href: "/disenar", texto: "Diseñar motivo" },
    { href: "/enviar", texto: "Enviar propuesta" },
    { href: "/mis-propuestas", texto: "Mis propuestas" },
  ],
  [ROLES.ARTESANA]: [{ href: "/recibidas", texto: "Propuestas recibidas" }],
};

export function Encabezado({ rol, nombre }: { rol: Rol; nombre: string }) {
  return (
    <header>
      <div className="encabezado">
        <span className="marca">Laboratorio de crochet</span>
        <NavegacionPrincipal enlaces={ENLACES[rol]} />
        <div className="usuario">
          <span className="chip" title={nombre}>
            {ETIQUETA_ROL[rol]}
          </span>
          <form action={cerrarSesionAccion}>
            <button type="submit" className="boton boton-claro">
              Cerrar sesión
            </button>
          </form>
        </div>
      </div>
      <div className="franja" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
    </header>
  );
}
