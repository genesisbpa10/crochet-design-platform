"use client";

import { useRouter } from "next/navigation";
import { ESTADOS } from "@/lib/dominio";

/** Filtro por estado de la Figura 15: se aplica al elegir una opción. */
export function FiltroEstado({ actual }: { actual?: string }) {
  const router = useRouter();
  return (
    <section className="tarjeta" aria-label="Filtro por estado">
      <label htmlFor="estado" style={{ marginTop: 0 }}>
        Filtrar por estado
      </label>
      <select
        id="estado"
        value={actual ?? ""}
        style={{ width: "auto", minWidth: "14rem" }}
        onChange={(e) => router.push(e.target.value ? `/recibidas?estado=${e.target.value}` : "/recibidas")}
      >
        <option value="">Todos</option>
        {ESTADOS.map((e) => (
          <option key={e} value={e}>
            {e}
          </option>
        ))}
      </select>
    </section>
  );
}
