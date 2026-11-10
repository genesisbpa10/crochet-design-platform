"use client";

import Link from "next/link";
import { useActionState } from "react";
import { iniciarSesion, registrarCliente } from "@/app/actions/auth";
import { MIN_CONTRASENA } from "@/lib/dominio";

export function FormularioLogin() {
  const [estado, accion, pendiente] = useActionState(iniciarSesion, undefined);
  return (
    <form action={accion} noValidate>
      <label htmlFor="correo">Correo electrónico</label>
      <input id="correo" name="correo" type="email" autoComplete="email" required />
      <label htmlFor="contrasena">Contraseña</label>
      <input
        id="contrasena"
        name="contrasena"
        type="password"
        autoComplete="current-password"
        required
      />
      {estado?.error && (
        <p className="error" role="alert">
          {estado.error}
        </p>
      )}
      <div className="acciones">
        <button type="submit" className="boton boton-principal" disabled={pendiente}>
          {pendiente ? "Ingresando…" : "Ingresar"}
        </button>
        <span className="ayuda">
          ¿Sos cliente y no tenés cuenta?{" "}
          <Link href="/registro" className="enlace">
            Registrarme
          </Link>
        </span>
      </div>
    </form>
  );
}

export function FormularioRegistro() {
  const [estado, accion, pendiente] = useActionState(registrarCliente, undefined);
  return (
    <form action={accion} noValidate>
      <label htmlFor="nombre">Nombre y apellido</label>
      <input id="nombre" name="nombre" type="text" autoComplete="name" required maxLength={100} />
      <label htmlFor="correo">Correo electrónico</label>
      <input id="correo" name="correo" type="email" autoComplete="email" required />
      <label htmlFor="contrasena">Contraseña (al menos {MIN_CONTRASENA} caracteres)</label>
      <input
        id="contrasena"
        name="contrasena"
        type="password"
        autoComplete="new-password"
        required
        minLength={MIN_CONTRASENA}
      />
      {estado?.error && (
        <p className="error" role="alert">
          {estado.error}
        </p>
      )}
      <div className="acciones">
        <button type="submit" className="boton boton-principal" disabled={pendiente}>
          {pendiente ? "Creando cuenta…" : "Crear cuenta"}
        </button>
        <Link href="/login" className="boton">
          Volver a iniciar sesión
        </Link>
      </div>
    </form>
  );
}
