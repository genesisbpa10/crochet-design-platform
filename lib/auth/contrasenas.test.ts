import { describe, expect, it } from "vitest";
import { esContrasenaProhibida } from "@/lib/auth/contrasenas";

describe("esContrasenaProhibida", () => {
  it("rechaza contraseñas comunes sin distinguir mayúsculas", () => {
    expect(esContrasenaProhibida("Password1234")).toBe(true);
    expect(esContrasenaProhibida("123456789012")).toBe(true);
  });

  it("acepta una contraseña que no figura en la lista", () => {
    expect(esContrasenaProhibida("tapiz-lana-9Xq2")).toBe(false);
  });
});
