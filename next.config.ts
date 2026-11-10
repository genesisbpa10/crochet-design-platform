import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Módulo nativo (Argon2id): se carga desde node_modules en el servidor.
  serverExternalPackages: ["@node-rs/argon2"],
};

export default nextConfig;
