// Cálculo de datos de producción (CU 2). Funciones puras, sin acceso a la base de datos.
import {
  COLOR_FONDO,
  LADO_MAXIMO,
  LADO_MINIMO,
  MAX_COLORES,
  RENDIMIENTO_METROS_POR_PUNTO,
} from "@/lib/dominio";

export type Grilla = string[][];

export interface ColorPaleta {
  nombre: string;
  codigoHex: string;
}

export interface DatosColor extends ColorPaleta {
  puntos: number;
  metrosHilo: number;
}

export interface DatosCalculados {
  totalPuntos: number;
  totalMetros: number;
  colores: DatosColor[];
}

const HEX = /^#[0-9a-f]{6}$/;

function redondear2(valor: number): number {
  return Math.round(valor * 100) / 100;
}

/** RF 3, RF 4 y RF 5: total de puntos, puntos por color y metros de hilo por color. */
export function calcular(
  grilla: Grilla,
  paleta: ColorPaleta[],
  rendimiento: number = RENDIMIENTO_METROS_POR_PUNTO,
): DatosCalculados {
  const alto = grilla.length;
  const ancho = alto > 0 ? grilla[0].length : 0;
  const totalPuntos = ancho * alto;

  const cuenta = new Map<string, number>();
  for (const color of paleta) cuenta.set(color.codigoHex, 0);
  for (const fila of grilla) {
    for (const celda of fila) {
      const actual = cuenta.get(celda);
      if (actual !== undefined) cuenta.set(celda, actual + 1);
    }
  }

  const colores = paleta.map((color) => {
    const puntos = cuenta.get(color.codigoHex) ?? 0;
    return { ...color, puntos, metrosHilo: redondear2(puntos * rendimiento) };
  });

  return {
    totalPuntos,
    totalMetros: redondear2(totalPuntos * rendimiento),
    colores,
  };
}

export function crearGrillaVacia(
  ancho: number,
  alto: number,
  fondo: string = COLOR_FONDO,
): Grilla {
  return Array.from({ length: alto }, () => Array<string>(ancho).fill(fondo));
}

/** Cambia las dimensiones conservando lo ya dibujado. */
export function redimensionarGrilla(
  grilla: Grilla,
  ancho: number,
  alto: number,
  fondo: string = COLOR_FONDO,
): Grilla {
  return Array.from({ length: alto }, (_, y) =>
    Array.from({ length: ancho }, (_, x) => grilla[y]?.[x] ?? fondo),
  );
}

export function dimensionesValidas(ancho: number, alto: number): boolean {
  return (
    Number.isInteger(ancho) &&
    Number.isInteger(alto) &&
    ancho >= LADO_MINIMO &&
    ancho <= LADO_MAXIMO &&
    alto >= LADO_MINIMO &&
    alto <= LADO_MAXIMO
  );
}

/** Devuelve un mensaje de error o null si el motivo es consistente. */
export function validarMotivo(
  grilla: Grilla,
  ancho: number,
  alto: number,
  paleta: ColorPaleta[],
): string | null {
  if (!dimensionesValidas(ancho, alto)) {
    return `Las dimensiones deben estar entre ${LADO_MINIMO} y ${LADO_MAXIMO} celdas por lado.`;
  }
  if (paleta.length < 1 || paleta.length > MAX_COLORES) {
    return `La paleta debe tener entre 1 y ${MAX_COLORES} colores.`;
  }
  const hexPaleta = new Set<string>();
  for (const color of paleta) {
    if (!HEX.test(color.codigoHex)) return "Hay un color con formato inválido.";
    if (hexPaleta.has(color.codigoHex)) return "Hay colores repetidos en la paleta.";
    hexPaleta.add(color.codigoHex);
  }
  if (grilla.length !== alto) return "La grilla no coincide con el alto indicado.";
  for (const fila of grilla) {
    if (fila.length !== ancho) return "La grilla no coincide con el ancho indicado.";
    for (const celda of fila) {
      if (!hexPaleta.has(celda)) return "La grilla usa un color que no está en la paleta.";
    }
  }
  return null;
}
