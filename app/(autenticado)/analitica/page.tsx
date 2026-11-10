import { exigirUsuario } from "@/lib/auth/guard";
import { ROLES } from "@/lib/dominio";
import { obtenerAnalitica } from "@/services/analitica";

export const metadata = { title: "Analítica de pedidos | Laboratorio de crochet" };

const COLOR_BARRA: Record<string, string> = {
  Enviada: "var(--mostaza)",
  Evaluada: "var(--oliva)",
  Presupuestada: "var(--terracota)",
};

const numero = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 });
const decimal = new Intl.NumberFormat("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** Figura 17: analítica de pedidos (solo artesana). */
export default async function PaginaAnalitica() {
  await exigirUsuario(ROLES.ARTESANA);
  const datos = await obtenerAnalitica();
  const maximo = Math.max(1, ...datos.porEstado.map((fila) => fila.cantidad));

  return (
    <>
      <h1>Analítica de pedidos</h1>
      {datos.totalPropuestas === 0 ? (
        <section className="tarjeta">
          <p className="vacio">Todavía no hay propuestas recibidas.</p>
        </section>
      ) : (
        <div className="pila">
          <div className="columnas columnas-iguales">
            <section className="tarjeta" aria-label="Propuestas por estado">
              <h2>Propuestas por estado</h2>
              <p className="ayuda" style={{ marginTop: 0 }}>
                Total: {datos.totalPropuestas} propuestas
              </p>
              {datos.porEstado.map((fila) => (
                <div key={fila.estado} className="barra-fila">
                  <span>{fila.estado}</span>
                  <div className="barra-fondo">
                    <div
                      className="barra"
                      style={{
                        width: `${(fila.cantidad / maximo) * 90}%`,
                        background: COLOR_BARRA[fila.estado],
                      }}
                    />
                  </div>
                  <strong>{fila.cantidad}</strong>
                </div>
              ))}
            </section>

            <section className="tarjeta" aria-label="Promedios por propuesta">
              <h2>Promedios por propuesta</h2>
              <table>
                <thead>
                  <tr>
                    <th>Indicador</th>
                    <th className="num">Promedio</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Puntos por motivo</td>
                    <td className="num">
                      <strong>{numero.format(datos.promedioPuntos)}</strong>
                    </td>
                  </tr>
                  <tr>
                    <td>Metros de hilo por motivo</td>
                    <td className="num">
                      <strong>{decimal.format(datos.promedioMetros)}</strong>
                    </td>
                  </tr>
                </tbody>
              </table>
              <p className="ayuda">Calculados sobre todas las propuestas recibidas.</p>
            </section>
          </div>

          <section className="tarjeta" aria-label="Colores más utilizados">
            <h2>Colores más utilizados</h2>
            <table>
              <thead>
                <tr>
                  <th>Color</th>
                  <th className="num">Veces utilizado</th>
                </tr>
              </thead>
              <tbody>
                {datos.colores.map((color) => (
                  <tr key={color.codigoHex}>
                    <td>
                      <span className="punto-color" style={{ background: color.codigoHex }} />
                      {color.nombre}
                    </td>
                    <td className="num">{color.veces}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
      )}
    </>
  );
}
