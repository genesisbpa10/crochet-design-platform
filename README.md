# Laboratorio de crochet

Prototipo del Trabajo Final de Grado (Licenciatura en Informática): plataforma web para diseñar y gestionar propuestas de prendas de crochet personalizadas (tapestry crochet).

## Qué incluye

- **Acceso:** registro del cliente e inicio de sesión de cliente y artesana. Contraseñas con Argon2id, sesión firmada y permisos por perfil verificados en el servidor.
- **Laboratorio de diseño (CU 1 y CU 2):** grilla de 1 a 100 celdas por lado dibujada con Canvas API, paleta de colores, total de puntos, puntos por color y metros de hilo estimados. Guardar y recuperar motivos.
- **Envío de propuestas (CU 3) y consulta del resultado (CU 4).**
- **Artesana (CU 5 a CU 8):** listado con filtro por estado, evaluación de factibilidad, ajustes y presupuesto. Estados: Enviada, Evaluada y Presupuestada.

Tecnologías: Next.js, TypeScript, Canvas API, PostgreSQL con Prisma ORM, Vercel.

## Cómo ejecutarlo en forma local

Requisitos: Node.js 20.9 o superior (se recomienda la versión 22), npm y una base de datos PostgreSQL (por ejemplo, un proyecto gratuito de Neon).

1. Instalar las dependencias:

   ```bash
   npm install
   ```

2. Copiar `.env.example` como `.env` y completar los valores (`DATABASE_URL`, `DIRECT_URL`, `SESSION_SECRET`, `ARTESANA_EMAIL`, `ARTESANA_PASSWORD`).

3. Crear las tablas y la cuenta de la artesana:

   ```bash
   npm run db:push
   npm run db:seed
   ```

4. Iniciar la aplicación:

   ```bash
   npm run dev
   ```

   Abrir http://localhost:3000. La artesana ingresa con el correo y la contraseña definidos en `.env`; el cliente se registra desde la pantalla de registro (contraseña de al menos 12 caracteres).

## Verificaciones

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Despliegue en Vercel

Cargar `DATABASE_URL`, `DIRECT_URL` y `SESSION_SECRET` como variables de entorno del proyecto. El comando de build ejecuta `prisma generate` antes de `next build`. Las tablas se crean una sola vez con `npm run db:push` desde un equipo con el `.env` configurado.
