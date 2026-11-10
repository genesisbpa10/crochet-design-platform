import { describe, expect, it } from "vitest";
import { contarColores } from "@/services/analitica";

const verde = { nombre: "Verde oliva", codigoHex: "#6b7a2a" };
const crudo = { nombre: "Crudo", codigoHex: "#fff8ea" };

describe("contarColores", () => {
  it("cuenta propuestas distintas por color y ordena de mayor a menor", () => {
    const resultado = contarColores([
      { idPropuesta: 1, puntos: 10, color: crudo },
      { idPropuesta: 1, puntos: 5, color: verde },
      { idPropuesta: 2, puntos: 7, color: verde },
    ]);
    expect(resultado).toEqual([
      { nombre: "Verde oliva", codigoHex: "#6b7a2a", veces: 2 },
      { nombre: "Crudo", codigoHex: "#fff8ea", veces: 1 },
    ]);
  });

  it("ignora los colores sin puntos", () => {
    expect(contarColores([{ idPropuesta: 1, puntos: 0, color: verde }])).toEqual([]);
  });
});
