// Constantes y reglas del dominio, según el documento del TFG.

export const ROLES = {
  CLIENTE: "CLIENTE",
  ARTESANA: "ARTESANA",
} as const;
export type Rol = (typeof ROLES)[keyof typeof ROLES];

export const ETIQUETA_ROL: Record<Rol, string> = {
  CLIENTE: "Cliente",
  ARTESANA: "Artesana",
};

// Estados de la propuesta (Enviada -> Evaluada -> Presupuestada).
export const ESTADOS = ["Enviada", "Evaluada", "Presupuestada"] as const;
export type Estado = (typeof ESTADOS)[number];

// Resultados de la evaluación de factibilidad (RF 10).
export const RESULTADOS = [
  "Factible",
  "Factible con ajustes",
  "No factible",
] as const;
export type Resultado = (typeof RESULTADOS)[number];

// RF 1: la grilla admite de 1 a 100 celdas por lado.
export const LADO_MINIMO = 1;
export const LADO_MAXIMO = 100;

// RF 5: rendimiento de referencia fijo (metros de hilo por punto).
export const RENDIMIENTO_METROS_POR_PUNTO = 0.04;

// Paleta inicial fija (CU 1, comentarios).
export const COLOR_FONDO = "#fff8ea";
export const PALETA_INICIAL = [
  { nombre: "Crudo", codigoHex: "#fff8ea" },
  { nombre: "Terracota", codigoHex: "#d9622b" },
  { nombre: "Verde oliva", codigoHex: "#6b7a2a" },
  { nombre: "Mostaza", codigoHex: "#e3a81f" },
] as const;

export const MAX_COLORES = 16;
export const MIN_CONTRASENA = 12;
