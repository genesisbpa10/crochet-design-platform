import { FormularioRegistro } from "@/components/FormularioAcceso";

export default function PaginaRegistro() {
  return (
    <section className="tarjeta tarjeta-centrada" aria-labelledby="titulo-registro">
      <h1 id="titulo-registro">Crear cuenta de cliente</h1>
      <p className="ayuda">El correo electrónico debe ser único en la plataforma.</p>
      <FormularioRegistro />
    </section>
  );
}
