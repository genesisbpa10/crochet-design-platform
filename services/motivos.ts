import { z } from "zod";
import { prisma } from "@/lib/db";
import { MAX_COLORES } from "@/lib/dominio";
import { validarMotivo, type ColorPaleta, type Grilla } from "@/lib/calculo";
import { ErrorDeNegocio } from "@/lib/errores";

const hex = z
  .string()
  .max(7)
  .transform((valor) => valor.toLowerCase());

export const esquemaMotivo = z.object({
  id: z.number().int().positive().optional(),
  nombre: z
    .string()
    .trim()
    .min(1, "Ingresá un nombre para el motivo.")
    .max(80, "El nombre del motivo es demasiado largo."),
  ancho: z.number().int(),
  alto: z.number().int(),
  grilla: z.array(z.array(hex).max(100)).max(100),
  paleta: z
    .array(
      z.object({
        nombre: z.string().trim().min(1).max(40),
        codigoHex: hex,
      }),
    )
    .min(1)
    .max(MAX_COLORES),
});

const esquemaGrillaGuardada = z.array(z.array(z.string()));

export function leerGrilla(valor: unknown): Grilla {
  return esquemaGrillaGuardada.parse(valor);
}

export interface MotivoGuardado {
  idMotivo: number;
  nombre: string;
  ancho: number;
  alto: number;
  grilla: Grilla;
  paleta: ColorPaleta[];
  fechaModificacion: Date;
}

/** CU 1: guarda un motivo nuevo o actualiza uno propio que aún no se haya enviado como propuesta. */
export async function guardarMotivo(idUsuario: number, entrada: unknown): Promise<number> {
  const datos = esquemaMotivo.safeParse(entrada);
  if (!datos.success) throw new ErrorDeNegocio(datos.error.issues[0].message);
  const { id, nombre, ancho, alto, grilla, paleta } = datos.data;

  const error = validarMotivo(grilla, ancho, alto, paleta);
  if (error) throw new ErrorDeNegocio(error);

  if (id !== undefined) {
    const existente = await prisma.motivo.findFirst({
      where: { idMotivo: id, idUsuario },
      select: { idMotivo: true, _count: { select: { propuestas: true } } },
    });
    if (!existente) throw new ErrorDeNegocio("No se encontró el motivo.");

    // Un motivo ya enviado en una propuesta no se modifica: así la propuesta conserva su diseño.
    if (existente._count.propuestas === 0) {
      await prisma.$transaction([
        prisma.colorMotivo.deleteMany({ where: { idMotivo: id } }),
        prisma.motivo.update({
          where: { idMotivo: id },
          data: { nombre, ancho, alto, grilla, colores: { create: paleta } },
        }),
      ]);
      return id;
    }
  }

  const creado = await prisma.motivo.create({
    data: { idUsuario, nombre, ancho, alto, grilla, colores: { create: paleta } },
    select: { idMotivo: true },
  });
  return creado.idMotivo;
}

export async function listarMotivos(idUsuario: number): Promise<MotivoGuardado[]> {
  const motivos = await prisma.motivo.findMany({
    where: { idUsuario },
    orderBy: { fechaModificacion: "desc" },
    include: { colores: { orderBy: { idColor: "asc" } } },
  });
  return motivos.map((m) => ({
    idMotivo: m.idMotivo,
    nombre: m.nombre,
    ancho: m.ancho,
    alto: m.alto,
    grilla: leerGrilla(m.grilla),
    paleta: m.colores.map((c) => ({ nombre: c.nombre, codigoHex: c.codigoHex })),
    fechaModificacion: m.fechaModificacion,
  }));
}

export async function obtenerMotivo(
  idUsuario: number,
  idMotivo: number,
): Promise<MotivoGuardado | null> {
  const m = await prisma.motivo.findFirst({
    where: { idMotivo, idUsuario },
    include: { colores: { orderBy: { idColor: "asc" } } },
  });
  if (!m) return null;
  return {
    idMotivo: m.idMotivo,
    nombre: m.nombre,
    ancho: m.ancho,
    alto: m.alto,
    grilla: leerGrilla(m.grilla),
    paleta: m.colores.map((c) => ({ nombre: c.nombre, codigoHex: c.codigoHex })),
    fechaModificacion: m.fechaModificacion,
  };
}
