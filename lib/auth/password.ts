import { hash, verify } from "@node-rs/argon2";

// Argon2id con salt aleatorio (el algoritmo por defecto de @node-rs/argon2 es Argon2id).
// Parámetros mínimos recomendados por OWASP: 19 MiB de memoria, 2 iteraciones, 1 hilo.
const OPCIONES = { memoryCost: 19456, timeCost: 2, parallelism: 1 } as const;

export function hashearContrasena(contrasena: string): Promise<string> {
  return hash(contrasena, OPCIONES);
}

export async function verificarContrasena(
  contrasenaHash: string,
  contrasena: string,
): Promise<boolean> {
  try {
    return await verify(contrasenaHash, contrasena);
  } catch {
    return false;
  }
}

// Hash de relleno para que el tiempo de respuesta no revele si el correo existe.
let hashDeRelleno: Promise<string> | undefined;
export function obtenerHashDeRelleno(): Promise<string> {
  hashDeRelleno ??= hashearContrasena("relleno-sin-uso-0123456789");
  return hashDeRelleno;
}
