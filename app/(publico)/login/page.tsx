import { FormularioLogin } from "@/components/FormularioAcceso";

export default function PaginaLogin() {
  return (
    <section className="tarjeta tarjeta-centrada" aria-labelledby="titulo-login">
      <h1 id="titulo-login">Iniciar sesión</h1>
      <p className="ayuda">Ingresá con tu correo electrónico y tu contraseña.</p>
      <FormularioLogin />
    </section>
  );
}
