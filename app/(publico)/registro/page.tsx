import { FormularioRegistro } from "@/components/FormularioAcceso";

export default function PaginaRegistro() {
  return (
    <section className="tarjeta tarjeta-centrada" aria-labelledby="titulo-registro">
      <h1 id="titulo-registro">Crear cuenta de cliente</h1>
      <p className="ayuda">
        Ingresá tus datos para diseñar motivos y enviar propuestas. La cuenta de la artesana la
        crea el responsable técnico del sistema.
      </p>
      <FormularioRegistro />
    </section>
  );
}
