// Lista reducida de contraseñas no permitidas (documento, sección Seguridad: contraseñas
// muy comunes o filtradas en incidentes). Se comparan en minúsculas y solo las de 12 o más
// caracteres, que es el mínimo exigido.
const PROHIBIDAS = new Set([
  "123456789012",
  "1234567890123",
  "12345678901234",
  "123456789abc",
  "abcdefghijkl",
  "qwertyuiop12",
  "qwertyuiopas",
  "qwertyuiop123",
  "asdfghjkl123",
  "asdfghjklñ12",
  "password1234",
  "password12345",
  "passw0rd1234",
  "p@ssw0rd1234",
  "contraseña123",
  "contrasena123",
  "contraseña1234",
  "contrasena1234",
  "administrator",
  "iloveyou1234",
  "letmein123456",
  "welcome12345",
  "welcome123456",
  "changeme1234",
  "000000000000",
  "111111111111",
  "aaaaaaaaaaaa",
  "bienvenido123",
  "argentina1234",
  "bocajuniors12",
  "riverplate123",
  "mipassword123",
  "micontraseña1",
]);

export function esContrasenaProhibida(contrasena: string): boolean {
  return PROHIBIDAS.has(contrasena.toLowerCase());
}
