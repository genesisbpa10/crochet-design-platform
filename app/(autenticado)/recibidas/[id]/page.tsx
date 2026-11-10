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
    <div className="columnas columnas-3">
      <div className="pila">
        <h1 style={{ marginBottom: 0 }}>Propuesta N.º {propuesta.idPropuesta}</h1>
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

      {propuesta.evaluacion ? (
        <div className="pila">
          <ResultadoEvaluacion evaluacion={propuesta.evaluacion} />
        </div>
      ) : (
        <FormularioEvaluacion idPropuesta={propuesta.idPropuesta} />
      )}
    </div>
  );
}
