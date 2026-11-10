// Crea (o actualiza) la cuenta de la artesana. La cuenta no se crea desde la interfaz
// porque el emprendimiento es unipersonal (sección Seguridad del TFG).
import { PrismaClient } from "@prisma/client";
import { hashearContrasena } from "../lib/auth/password";

const prisma = new PrismaClient();

async function main() {
  const correo = process.env.ARTESANA_EMAIL?.trim().toLowerCase();
  const contrasena = process.env.ARTESANA_PASSWORD;
  const nombre = process.env.ARTESANA_NOMBRE?.trim() || "Artesana";

  if (!correo || !contrasena) {
    throw new Error("Definí ARTESANA_EMAIL y ARTESANA_PASSWORD en el archivo .env.");
  }
  if (contrasena.length < 12) {
    throw new Error("ARTESANA_PASSWORD debe tener al menos 12 caracteres.");
  }

  const contrasenaHash = await hashearContrasena(contrasena);
  await prisma.usuario.upsert({
    where: { correo },
    update: { nombre, contrasenaHash, rol: "ARTESANA" },
    create: { nombre, correo, contrasenaHash, rol: "ARTESANA" },
  });
  console.log(`Cuenta de la artesana lista: ${correo}`);
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
