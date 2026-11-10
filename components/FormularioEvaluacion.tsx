"use client";

import { useActionState, useState } from "react";
import { evaluarPropuestaAccion } from "@/app/actions/propuestas";
import { RESULTADOS, type Resultado } from "@/lib/dominio";

export function FormularioEvaluacion({ idPropuesta }: { idPropuesta: number }) {
  const [estado, accion, pendiente] = useActionState(evaluarPropuestaAccion, undefined);
  const [resultado, setResultado] = useState<Resultado>("Factible");
  const [ajustes, setAjustes] = useState<string[]>([""]);

  const conAjustes = resultado === "Factible con ajustes";
  const conPresupuesto = resultado !== "No factible";

  return (
    <form action={accion} className="pila">
      <input type="hidden" name="idPropuesta" value={idPropuesta} />

      <section className="tarjeta" aria-label="Evaluación de factibilidad">
        <h2>Evaluación de factibilidad</h2>
        {RESULTADOS.map((opcion) => (
          <label key={opcion} className="opcion">
            <input
              type="radio"
              name="resultado"
              value={opcion}
              checked={resultado === opcion}
              onChange={() => setResultado(opcion)}
            />
            {opcion}
          </label>
        ))}
        <label htmlFor="observaciones">Observaciones</label>
        <textarea id="observaciones" name="observaciones" maxLength={2000} />
      </section>

      {conAjustes && (
        <section className="tarjeta" aria-label="Ajustes necesarios">
          <h2>Ajustes necesarios</h2>
          {ajustes.map((texto, i) => (
            <div key={i} style={{ marginBottom: "0.5rem" }}>
              <input
                type="text"
                name="ajuste"
                aria-label={`Ajuste ${i + 1}`}
                maxLength={500}
                value={texto}
                onChange={(e) =>
                  setAjustes((previos) => previos.map((a, j) => (j === i ? e.target.value : a)))
                }
              />
            </div>
          ))}
          <button
            type="button"
            className="boton"
            onClick={() => setAjustes((previos) => [...previos, ""])}
            disabled={ajustes.length >= 20}
          >
            + Agregar ajuste
          </button>
        </section>
      )}

      {conPresupuesto && (
        <section className="tarjeta" aria-label="Presupuesto">
          <h2>Presupuesto</h2>
          <div className="fila">
            <div className="campo-monto">
              <span aria-hidden="true">$</span>
              <input
                id="monto"
                name="monto"
                type="number"
                inputMode="decimal"
                min="0.01"
                step="0.01"
                required
                aria-label="Monto en pesos"
              />
            </div>
            <span className="ayuda" style={{ margin: 0 }}>
              monto en pesos
            </span>
          </div>
        </section>
      )}

      {estado?.error && (
        <p className="error" role="alert">
          {estado.error}
        </p>
      )}

      <div>
        <button type="submit" className="boton boton-principal" disabled={pendiente}>
          {pendiente ? "Registrando…" : "Registrar evaluación"}
        </button>
      </div>
    </form>
  );
}
