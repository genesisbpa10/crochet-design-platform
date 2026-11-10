# Plataforma web para diseño computacional y comercialización de prendas de crochet personalizadas

**Prototipo del Trabajo Final de Grado** · Licenciatura en Informática · Universidad Siglo 21
**Autora:** Génesis Pérez

La aplicación se llama **Laboratorio de crochet**. Permite que un cliente diseñe un motivo de tapestry crochet en una grilla, obtenga al instante los puntos y los metros de hilo, y envíe una propuesta de prenda. La artesana evalúa la factibilidad, registra los ajustes y carga el presupuesto.

Este repositorio contiene el código del prototipo. Las pantallas siguen las Figuras 10 a 17 y el modelo de datos sigue el DER de la Figura 9.

## Qué incluye

| Función | Casos de uso / figura |
| --- | --- |
| Inicio de sesión de cliente y artesana; registro del cliente | Figuras 10 y 11 |
| Laboratorio de diseño: grilla de 1 a 100 puntos por lado dibujada con Canvas API, paleta de colores (hasta 16), total de puntos, puntos por color y metros de hilo (0,04 m por punto) | CU 1 y CU 2, Figura 12 |
| Envío de la propuesta con el motivo elegido y la descripción de la prenda | CU 3, Figura 13 |
| Consulta del estado y del resultado de las propuestas del cliente | CU 4, Figura 14 |
| Propuestas recibidas con filtro por estado | CU 6, Figura 15 |
| Evaluación de factibilidad, ajustes necesarios y presupuesto | CU 5, 7 y 8, Figura 16 |
| Analítica de pedidos: propuestas por estado, promedios y colores más usados | Figura 17 |

Las propuestas pasan por los estados **Enviada → Evaluada → Presupuestada**. La cuenta de la artesana no se registra desde la pantalla: la crea el responsable técnico con el comando `npm run db:seed`.

## Tecnologías y relación con el documento

| Componente | En el documento | En este prototipo |
| --- | --- | --- |
| Aplicación | Next.js, TypeScript, Canvas API | Next.js 16, React 19, TypeScript, Canvas API |
| Acceso a datos | Prisma ORM | Prisma ORM 6 |
| Base de datos | PostgreSQL en Amazon RDS | **PostgreSQL administrado en Neon** (ver nota) |
| Alojamiento | Vercel | Vercel, con despliegue automático desde GitHub |
| Código fuente | Git y GitHub | Git y GitHub, con verificación automática (GitHub Actions) |
| Contraseñas | Argon2id con sal | Argon2id con sal |

**Nota sobre la base de datos.** El documento propone Amazon RDS for PostgreSQL para el despliegue final. Para este prototipo se usó **Neon**, un servicio administrado de PostgreSQL con plan gratuito y conexión cifrada con SSL, para no depender de un servicio con costo durante la etapa de demostración. Como la aplicación accede a los datos mediante Prisma ORM y el motor es el mismo (PostgreSQL), pasar a Amazon RDS solo requiere cambiar las variables de entorno `DATABASE_URL` y `DIRECT_URL`; el código y el esquema no se modifican.

También se usan bibliotecas de apoyo que el documento no detalla: `zod` (validación de datos), `jose` (sesión firmada), `@node-rs/argon2` (Argon2id), `vitest` (pruebas) y Tailwind CSS (estilos base).

## Cómo ejecutarlo en forma local

**Requisitos:** Node.js 20.9 o superior (se recomienda la 22), npm y una base de datos PostgreSQL (por ejemplo, un proyecto gratuito de [Neon](https://neon.tech)).

> En Windows, clonar el repositorio dentro de WSL (por ejemplo, en `~/repos`) y no en una carpeta de OneDrive o de `/mnt/c`, porque en esas rutas `npm` puede fallar con errores de permisos.

1. Instalar las dependencias:

   ```bash
   npm install
   ```

2. Copiar `.env.example` como `.env` y completar los valores:

   | Variable | Qué es |
   | --- | --- |
   | `DATABASE_URL` | Conexión a la base (con `pooler`, en Neon) |
   | `DIRECT_URL` | Conexión directa a la base, que Prisma usa para crear las tablas |
   | `SESSION_SECRET` | Texto aleatorio de al menos 32 caracteres para firmar la sesión |
   | `ARTESANA_EMAIL` | Correo de la cuenta de la artesana |
   | `ARTESANA_PASSWORD` | Contraseña de la artesana (al menos 12 caracteres; conviene usar solo letras y números) |

3. Crear las tablas y la cuenta de la artesana:

   ```bash
   npm run db:push
   npm run db:seed
   ```

4. Iniciar la aplicación:

   ```bash
   npm run dev
   ```

   Abrir http://localhost:3000.

## Cómo probar el flujo completo

1. **Cliente:** en el inicio de sesión tocar *Registrarme* y crear una cuenta (contraseña de al menos 12 caracteres). Se abre el laboratorio de diseño.
2. En **Diseñar motivo**: pintar la grilla, ponerle un nombre y tocar *Guardar motivo*.
3. En **Enviar propuesta**: elegir el motivo, escribir la descripción y tocar *Enviar propuesta*.
4. Tocar el chip **Cliente** (arriba a la derecha) para cerrar la sesión.
5. **Artesana:** ingresar con `ARTESANA_EMAIL` y `ARTESANA_PASSWORD`. En **Propuestas recibidas** abrir la propuesta con *Ver detalle*, elegir el resultado, cargar ajustes si corresponde, ingresar el monto y tocar *Registrar evaluación*.
6. En **Analítica de pedidos** se ven los indicadores.
7. Volver a ingresar como cliente: en **Mis propuestas** se ve el resultado, los ajustes y el presupuesto.

## Verificaciones

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Las mismas verificaciones se ejecutan automáticamente en GitHub Actions en cada cambio.

## Despliegue en Vercel

1. Importar el repositorio en Vercel.
2. Cargar `DATABASE_URL`, `DIRECT_URL` y `SESSION_SECRET` como variables de entorno del proyecto.
3. Cada cambio que se une a la rama `main` se despliega automáticamente. El comando de build ejecuta `prisma generate` antes de `next build`.
4. Las tablas se crean una sola vez con `npm run db:push` desde un equipo con el `.env` configurado.

## Seguridad

Las credenciales y las claves se configuran como variables de entorno y no se incluyen en el repositorio. Las contraseñas se guardan solo como hash Argon2id, y los permisos de cada perfil se verifican en el servidor.
