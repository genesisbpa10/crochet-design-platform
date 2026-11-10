"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export interface EnlaceNavegacion {
  href: string;
  texto: string;
}

export function NavegacionPrincipal({ enlaces }: { enlaces: EnlaceNavegacion[] }) {
  const ruta = usePathname();
  return (
    <nav className="navegacion" aria-label="Principal">
      {enlaces.map((enlace) => {
        const activo = ruta === enlace.href || ruta.startsWith(`${enlace.href}/`);
        return (
          <Link key={enlace.href} href={enlace.href} aria-current={activo ? "page" : undefined}>
            {enlace.texto}
          </Link>
        );
      })}
    </nav>
  );
}
