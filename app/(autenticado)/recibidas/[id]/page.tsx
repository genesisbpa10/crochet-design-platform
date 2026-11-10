import Link from "next/link";
import { notFound } from "next/navigation";
import { exigirUsuario } from "@/lib/auth/guard";
import { ROLES } from "@/lib/dominio";
import { detallePropuestaRecibida } from "@/services/propuestas";
import { FormularioEvaluacion } from "@/components/FormularioEvaluacion";
import { ResultadoEvaluacion } from "@/components/ResultadoEvaluacion";
import { TablaDatos } from "@/components/TablaDatos";
import { VistaGrilla } from "@/components/VistaGrilla";

export const metadata = { title: "Evaluar propuesta | Laboratorio de crochet" };

export default async function PaginaEvaluacion({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await exigirUsuario(ROLES.ARTESANA);
  const { id } = await params;
  const idPropuesta = Number(id);
  if (!Number.isInteger(idPropuesta) || idPropuesta <= 0) notFound();

  const propuesta = await detallePropuestaRecibida(idPropuesta);
  if (!propuesta) notFound();

  return (
    <>
      <h1>Propuesta N.º {propuesta.idPropuesta}</h1>
      <p className="ayuda" style={{ marginTop: "-0.5rem", marginBottom: "1rem" }}>
        Cliente: {propuesta.cliente} · Motivo: {propuesta.motivo.nombre} ·{" "}
        <span className="insignia">{propuesta.estado}</span>
      </p>

      <div className="columnas columnas-3">
        <div className="pila">
          <VistaGrilla
            grilla={propuesta.motivo.grilla}
            maximo={280}
            descripcion={`Grilla del motivo ${propuesta.motivo.nombre}`}
          />
          <section className="tarjeta" aria-label="Descripción del cliente">
            <h2>Descripción del cliente</h2>
            <p style={{ whiteSpace: "pre-wrap" }}>{propuesta.descripcion}</p>
          </section>
        </div>

        <TablaDatos datos={propuesta.datos} />

        <div className="pila">
          {propuesta.evaluacion ? (
            <ResultadoEvaluacion evaluacion={propuesta.evaluacion} />
          ) : (
            <FormularioEvaluacion idPropuesta={propuesta.idPropuesta} />
          )}
          <div>
            <Link href="/recibidas" className="boton">
              Volver al listado
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
