"use client";

import Link from "next/link";
import { useActionState } from "react";
import { enviarPropuestaAccion } from "@/app/actions/propuestas";

export function FormularioEnvio({ idMotivo }: { idMotivo: number }) {
  const [estado, accion, pendiente] = useActionState(enviarPropuestaAccion, undefined);
  return (
    <form action={accion}>
      <input type="hidden" name="idMotivo" value={idMotivo} />
      <section className="tarjeta" aria-label="Descripción de la prenda deseada">
        <h2>3. Descripción de la prenda deseada</h2>
        <textarea
          id="descripcion"
          aria-label="Descripción de la prenda deseada"
          name="descripcion"
          maxLength={2000}
          required
          placeholder="Ejemplo: bolso tipo tote, 30 × 35 cm, con este motivo repetido en el frente."
        />
        {estado?.error && (
          <p className="error" role="alert">
            {estado.error}
          </p>
        )}
      </section>
      <div className="acciones">
        <button type="submit" className="boton boton-principal" disabled={pendiente}>
          {pendiente ? "Enviando…" : "Enviar propuesta"}
        </button>
        <Link href="/disenar" className="boton">
          Cancelar
        </Link>
      </div>
    </form>
  );
}
