const ZONA = "America/Argentina/Buenos_Aires";

export function formatearFecha(fecha: Date): string {
  return fecha.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    timeZone: ZONA,
  });
}

export function formatearMoneda(monto: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(monto);
}

export function formatearMetros(metros: number): string {
  return metros.toFixed(2);
}
