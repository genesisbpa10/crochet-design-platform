import type { DatosCalculados } from "@/lib/calculo";
import { formatearMetros } from "@/lib/formato";

/** Datos calculados del motivo: total de puntos, puntos y metros de hilo por color (CU 2). */
export function TablaDatos({ datos }: { datos: DatosCalculados }) {
  return (
    <section className="tarjeta" aria-label="Datos calculados">
      <h2>Datos calculados</h2>
      <p>
        <strong>Total de puntos:</strong> {datos.totalPuntos}
      </p>
      <div className="tabla-scroll">
        <table>
          <thead>
            <tr>
              <th>Color</th>
              <th className="num">Puntos</th>
              <th className="num">Metros de hilo</th>
            </tr>
          </thead>
          <tbody>
            {datos.colores.map((color) => (
              <tr key={color.codigoHex}>
                <td>
                  <span className="punto-color" style={{ background: color.codigoHex }} />
                  {color.nombre}
                </td>
                <td className="num">{color.puntos}</td>
                <td className="num">{formatearMetros(color.metrosHilo)}</td>
              </tr>
            ))}
            <tr className="total">
              <td>Total</td>
              <td className="num">{datos.totalPuntos}</td>
              <td className="num">{formatearMetros(datos.totalMetros)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
