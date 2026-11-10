import Link from "next/link";
import { exigirUsuario } from "@/lib/auth/guard";
import { ESTADOS, ROLES, type Estado } from "@/lib/dominio";
import { formatearFecha } from "@/lib/formato";
import { listarPropuestasRecibidas } from "@/services/propuestas";
import { FiltroEstado } from "@/components/FiltroEstado";

export const metadata = { title: "Propuestas recibidas | Laboratorio de crochet" };

function esEstado(valor: unknown): valor is Estado {
  return typeof valor === "string" && (ESTADOS as readonly string[]).includes(valor);
}

export default async function PaginaRecibidas({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string | string[] }>;
}) {
  await exigirUsuario(ROLES.ARTESANA);
  const { estado } = await searchParams;
  const filtro = esEstado(estado) ? estado : undefined;
  const propuestas = await listarPropuestasRecibidas(filtro);

  return (
    <>
      <h1>Propuestas recibidas</h1>

      <FiltroEstado actual={filtro} />

      <section className="tarjeta" style={{ marginTop: "1rem" }} aria-label="Listado de propuestas">
        {propuestas.length === 0 ? (
          // CU 6, curso alternativo 1a.
          <p className="vacio">No hay propuestas para el filtro elegido.</p>
        ) : (
          <div className="tabla-scroll">
            <table>
              <thead>
                <tr>
                  <th>N.º</th>
                  <th>Cliente</th>
                  <th>Motivo</th>
                  <th>Enviada</th>
                  <th>Estado</th>
                  <th>
                    <span className="sr-only">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {propuestas.map((p) => (
                  <tr key={p.idPropuesta}>
                    <td>{p.idPropuesta}</td>
                    <td>{p.cliente}</td>
                    <td>{p.motivo}</td>
                    <td>{formatearFecha(p.fechaEnvio)}</td>
                    <td>
                      <span className="insignia">{p.estado}</span>
                    </td>
                    <td>
                      <Link href={`/recibidas/${p.idPropuesta}`} className="boton boton-claro">
                        Ver detalle
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
