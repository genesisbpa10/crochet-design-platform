import Link from "next/link";
import { calcular } from "@/lib/calculo";
import { exigirUsuario } from "@/lib/auth/guard";
import { ROLES } from "@/lib/dominio";
import { formatearFecha } from "@/lib/formato";
import { listarMotivos } from "@/services/motivos";
import { FormularioEnvio } from "@/components/FormularioEnvio";
import { TablaDatos } from "@/components/TablaDatos";
import { VistaGrilla } from "@/components/VistaGrilla";

export const metadata = { title: "Enviar propuesta | Laboratorio de crochet" };

export default async function PaginaEnviar({
  searchParams,
}: {
  searchParams: Promise<{ motivo?: string | string[] }>;
}) {
  const usuario = await exigirUsuario(ROLES.CLIENTE);
  const motivos = await listarMotivos(usuario.idUsuario);
  const { motivo: parametro } = await searchParams;

  // CU 3, curso alternativo 2a: el cliente no tiene motivos guardados.
  if (motivos.length === 0) {
    return (
      <>
        <h1>Enviar propuesta</h1>
        <section className="tarjeta">
          <p>Todavía no tenés motivos guardados. Diseñá un motivo para poder enviar una propuesta.</p>
          <div className="acciones">
            <Link href="/disenar" className="boton boton-principal">
              Diseñar un motivo
            </Link>
          </div>
        </section>
      </>
    );
  }

  const idElegido = typeof parametro === "string" ? Number(parametro) : NaN;
  const elegido = motivos.find((m) => m.idMotivo === idElegido) ?? motivos[0];
  const datos = calcular(elegido.grilla, elegido.paleta);

  return (
    <div className="columnas columnas-2">
      <div>
        <h1>Enviar propuesta</h1>
        <section className="tarjeta" aria-label="Elegir motivo guardado">
          <h2>1. Elegir motivo guardado</h2>
          <ul className="lista-motivos">
            {motivos.map((m) => (
              <li key={m.idMotivo}>
                <Link
                  href={`/enviar?motivo=${m.idMotivo}`}
                  className="miniatura-lista"
                  aria-current={m.idMotivo === elegido.idMotivo ? "true" : undefined}
                >
                  <VistaGrilla
                    grilla={m.grilla}
                    maximo={160}
                    descripcion={`Vista previa del motivo ${m.nombre}`}
                  />
                  <span>
                    <strong>{m.nombre}</strong>
                    <br />
                    {m.ancho} × {m.alto} puntos
                    <br />
                    <small>Modificado: {formatearFecha(m.fechaModificacion)}</small>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="pila">
        <section className="tarjeta" aria-label="Resumen del motivo seleccionado">
          <h2>2. Resumen del motivo seleccionado</h2>
          <TablaDatos datos={datos} />
        </section>
        <FormularioEnvio key={elegido.idMotivo} idMotivo={elegido.idMotivo} />
      </div>
    </div>
  );
}
