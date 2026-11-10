import Link from "next/link";
import { exigirUsuario } from "@/lib/auth/guard";
import { ROLES } from "@/lib/dominio";
import { formatearFecha } from "@/lib/formato";
import { detallePropuestaCliente, listarPropuestasCliente } from "@/services/propuestas";
import { ResultadoEvaluacion } from "@/components/ResultadoEvaluacion";

export const metadata = { title: "Mis propuestas | Laboratorio de crochet" };

export default async function PaginaMisPropuestas({
  searchParams,
}: {
  searchParams: Promise<{ id?: string | string[] }>;
}) {
  const usuario = await exigirUsuario(ROLES.CLIENTE);
  const propuestas = await listarPropuestasCliente(usuario.idUsuario);
  const { id } = await searchParams;
  // Si no se eligió ninguna, se muestra la primera del listado (la más reciente).
  const idElegido = typeof id === "string" ? Number(id) : (propuestas[0]?.idPropuesta ?? NaN);
  const detalle =
    Number.isInteger(idElegido) && idElegido > 0
      ? await detallePropuestaCliente(usuario.idUsuario, idElegido)
      : null;

  return (
    <>
      {propuestas.length === 0 ? (
        <div>
          <h1>Mis propuestas</h1>
          <section className="tarjeta">
            <p>Todavía no enviaste ninguna propuesta.</p>
            <div className="acciones">
              <Link href="/enviar" className="boton boton-principal">
                Enviar una propuesta
              </Link>
            </div>
          </section>
        </div>
      ) : (
        <div className="columnas columnas-2">
          <div>
            <h1>Mis propuestas</h1>
          <section className="tarjeta" aria-label="Listado de propuestas">
            <div className="tabla-scroll">
              <table>
                <thead>
                  <tr>
                    <th>N.º</th>
                    <th>Motivo</th>
                    <th>Enviada</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {propuestas.map((p) => (
                    <tr
                      key={p.idPropuesta}
                      className={p.idPropuesta === detalle?.idPropuesta ? "seleccionada" : undefined}
                    >
                      <td>
                        <Link href={`/mis-propuestas?id=${p.idPropuesta}`} className="enlace">
                          {p.idPropuesta}
                        </Link>
                      </td>
                      <td>{p.motivo}</td>
                      <td>{formatearFecha(p.fechaEnvio)}</td>
                      <td>
                        <span className="insignia">{p.estado}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          </div>

          <div className="pila">
            {detalle ? (
              <>
                <h2 className="titulo">Propuesta N.º {detalle.idPropuesta}</h2>
                {detalle.evaluacion ? (
                  <ResultadoEvaluacion evaluacion={detalle.evaluacion} />
                ) : (
                  // CU 4, curso alternativo 4a: la propuesta todavía no fue evaluada.
                  <section className="tarjeta">
                    <p>Esta propuesta aún no fue evaluada por la artesana.</p>
                  </section>
                )}
              </>
            ) : null}
          </div>
        </div>
      )}
    </>
  );
}
