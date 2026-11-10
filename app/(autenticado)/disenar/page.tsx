import Link from "next/link";
import { exigirUsuario } from "@/lib/auth/guard";
import { ROLES } from "@/lib/dominio";
import { formatearFecha } from "@/lib/formato";
import { listarMotivos, obtenerMotivo } from "@/services/motivos";
import { EditorMotivo } from "@/components/EditorMotivo";
import { VistaGrilla } from "@/components/VistaGrilla";

export const metadata = { title: "Diseñar motivo | Laboratorio de crochet" };

export default async function PaginaDisenar({
  searchParams,
}: {
  searchParams: Promise<{ id?: string | string[] }>;
}) {
  const usuario = await exigirUsuario(ROLES.CLIENTE);
  const { id } = await searchParams;
  const idMotivo = typeof id === "string" ? Number(id) : NaN;

  const [motivo, motivos] = await Promise.all([
    Number.isInteger(idMotivo) && idMotivo > 0
      ? obtenerMotivo(usuario.idUsuario, idMotivo)
      : Promise.resolve(null),
    listarMotivos(usuario.idUsuario),
  ]);

  return (
    <>
      <h1>Diseñar motivo</h1>
      <EditorMotivo
        key={motivo?.idMotivo ?? "nuevo"}
        inicial={
          motivo
            ? {
                id: motivo.idMotivo,
                nombre: motivo.nombre,
                ancho: motivo.ancho,
                alto: motivo.alto,
                grilla: motivo.grilla,
                paleta: motivo.paleta,
              }
            : undefined
        }
      />

      <section className="tarjeta" style={{ marginTop: "1.5rem" }} aria-label="Motivos guardados">
        <h2>Mis motivos guardados</h2>
        {motivos.length === 0 ? (
          <p className="vacio">Todavía no guardaste ningún motivo.</p>
        ) : (
          <>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {motivos.map((m) => (
                <li key={m.idMotivo}>
                  <Link
                    href={`/disenar?id=${m.idMotivo}`}
                    className="miniatura-lista"
                    aria-current={m.idMotivo === motivo?.idMotivo ? "true" : undefined}
                  >
                    <VistaGrilla
                      grilla={m.grilla}
                      maximo={72}
                      descripcion={`Vista previa del motivo ${m.nombre}`}
                    />
                    <span>
                      <strong>{m.nombre}</strong>
                      <br />
                      {m.ancho} × {m.alto} puntos
                      <br />
                      <small>Modificado: {formatearFecha(m.fechaModificacion)}</small>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="acciones">
              <Link href="/disenar" className="boton">
                Nuevo motivo
              </Link>
            </div>
          </>
        )}
      </section>
    </>
  );
}
