/** Error esperado de las reglas de negocio; su mensaje se puede mostrar al usuario. */
export class ErrorDeNegocio extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = "ErrorDeNegocio";
  }
}

export interface EstadoFormulario {
  error?: string;
}

/** Convierte cualquier error en un mensaje seguro para el usuario, sin filtrar detalles internos. */
export function mensajeSeguro(error: unknown): string {
  if (error instanceof ErrorDeNegocio) return error.message;
  console.error("Error inesperado:", error instanceof Error ? error.name : "desconocido");
  return "Ocurrió un error inesperado. Intentá de nuevo.";
}
