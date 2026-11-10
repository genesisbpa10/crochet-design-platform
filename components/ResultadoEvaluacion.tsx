import { formatearMoneda } from "@/lib/formato";
import type { DetalleEvaluacion } from "@/services/propuestas";

/** Evaluación, ajustes y presupuesto registrados por la artesana (solo lectura). */
export function ResultadoEvaluacion({ evaluacion }: { evaluacion: DetalleEvaluacion }) {
  return (
    <>
      <section className="tarjeta" aria-label="Evaluación de la artesana">
        <h2>Evaluación de la artesana</h2>
        <p>
          <strong>Resultado:</strong> {evaluacion.resultado}
        </p>
        {evaluacion.observaciones && (
          <p style={{ marginTop: "0.6rem" }}>
            <strong>Observaciones:</strong> {evaluacion.observaciones}
          </p>
        )}
      </section>

      {evaluacion.ajustes.length > 0 && (
        <section className="tarjeta" aria-label="Ajustes necesarios">
          <h2>Ajustes necesarios</h2>
          <ul style={{ paddingLeft: "1.2rem", listStyle: "disc" }}>
            {evaluacion.ajustes.map((ajuste, i) => (
              <li key={i}>{ajuste}</li>
            ))}
          </ul>
        </section>
      )}

      {evaluacion.presupuesto && (
        <section className="tarjeta" aria-label="Presupuesto">
          <h2>Presupuesto</h2>
          <p>
            <strong>Monto:</strong> {formatearMoneda(evaluacion.presupuesto.monto)}
          </p>
          {evaluacion.presupuesto.observaciones && (
            <p style={{ marginTop: "0.6rem" }}>{evaluacion.presupuesto.observaciones}</p>
          )}
        </section>
      )}
    </>
  );
}
