import { describe, expect, it } from "vitest";
import {
  calcular,
  crearGrillaVacia,
  dimensionesValidas,
  redimensionarGrilla,
  validarMotivo,
} from "@/lib/calculo";
import { PALETA_INICIAL } from "@/lib/dominio";

const paleta = PALETA_INICIAL.map((c) => ({ ...c }));

describe("calcular", () => {
  it("calcula puntos y metros de una grilla de 16 x 16 con un solo color", () => {
    const grilla = crearGrillaVacia(16, 16);
    const datos = calcular(grilla, paleta);
    expect(datos.totalPuntos).toBe(256);
    expect(datos.totalMetros).toBe(10.24);
    expect(datos.colores.find((c) => c.nombre === "Crudo")?.puntos).toBe(256);
  });

  it("cuenta los puntos por color y muestra cero para los colores sin usar", () => {
    const grilla = crearGrillaVacia(2, 2);
    grilla[0][0] = "#d9622b";
    grilla[1][1] = "#d9622b";
    grilla[0][1] = "#e3a81f";
    const datos = calcular(grilla, paleta);
    const por = Object.fromEntries(datos.colores.map((c) => [c.nombre, c.puntos]));
    expect(por).toEqual({ Crudo: 1, Terracota: 2, "Verde oliva": 0, Mostaza: 1 });
    expect(datos.totalPuntos).toBe(4);
    expect(datos.colores.find((c) => c.nombre === "Terracota")?.metrosHilo).toBe(0.08);
  });
});

describe("dimensiones", () => {
  it("acepta de 1 a 100 y rechaza lo demás", () => {
    expect(dimensionesValidas(1, 100)).toBe(true);
    expect(dimensionesValidas(0, 10)).toBe(false);
    expect(dimensionesValidas(10, 101)).toBe(false);
    expect(dimensionesValidas(1.5, 10)).toBe(false);
  });

  it("conserva lo dibujado al redimensionar", () => {
    const grilla = crearGrillaVacia(2, 2);
    grilla[0][0] = "#d9622b";
    const nueva = redimensionarGrilla(grilla, 3, 3);
    expect(nueva[0][0]).toBe("#d9622b");
    expect(nueva[2][2]).toBe("#fff8ea");
    expect(nueva).toHaveLength(3);
  });
});

describe("validarMotivo", () => {
  it("acepta un motivo consistente", () => {
    expect(validarMotivo(crearGrillaVacia(3, 2), 3, 2, paleta)).toBeNull();
  });

  it("rechaza colores fuera de la paleta y tamaños inconsistentes", () => {
    const grilla = crearGrillaVacia(3, 2);
    grilla[0][0] = "#000000";
    expect(validarMotivo(grilla, 3, 2, paleta)).not.toBeNull();
    expect(validarMotivo(crearGrillaVacia(3, 2), 4, 2, paleta)).not.toBeNull();
    expect(validarMotivo(crearGrillaVacia(101, 1), 101, 1, paleta)).not.toBeNull();
  });
});
