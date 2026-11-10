import { z } from "zod";
import { prisma } from "@/lib/db";
import { calcular, type DatosCalculados } from "@/lib/calculo";
import { RESULTADOS, type Estado } from "@/lib/dominio";
import { ErrorDeNegocio } from "@/lib/errores";
import { leerGrilla } from "@/services/motivos";

const LIMITE_DESCRIPCION = 2000;

// ---------------------------------------------------------------- Cliente (CU 3 y CU 4)

/** CU 3: registra la propuesta con estado Enviada y el detalle por color. */
export async function enviarPropuesta(
  idCliente: number,
  idMotivo: number,
  descripcion: string,
): Promise<number> {
  const texto = descripcion.trim();
  if (!texto) throw new ErrorDeNegocio("La descripción es obligatoria.");
  if (texto.length > LIMITE_DESCRIPCION) {
    throw new ErrorDeNegocio(`La descripción no puede superar los ${LIMITE_DESCRIPCION} caracteres.`);
  }

  const motivo = await prisma.motivo.findFirst({
    where: { idMotivo, idUsuario: idCliente },
    include: { colores: { orderBy: { idColor: "asc" } } },
  });
  if (!motivo) throw new ErrorDeNegocio("Elegí un motivo guardado.");

  const datos = calcular(
    leerGrilla(motivo.grilla),
    motivo.colores.map((c) => ({ nombre: c.nombre, codigoHex: c.codigoHex })),
  );

  const propuesta = await prisma.propuesta.create({
    data: {
      idMotivo: motivo.idMotivo,
      idCliente,
      descripcion: texto,
      estado: "Enviada",
      totalPuntos: datos.totalPuntos,
      detalles: {
        create: motivo.colores.map((color, i) => ({
          idColor: color.idColor,
          puntos: datos.colores[i].puntos,
          metrosHilo: datos.colores[i].metrosHilo,
        })),
      },
    },
    select: { idPropuesta: true },
  });
  return propuesta.idPropuesta;
}

export interface ResumenPropuestaCliente {
  idPropuesta: number;
  motivo: string;
  fechaEnvio: Date;
  estado: string;
}

export async function listarPropuestasCliente(
  idCliente: number,
): Promise<ResumenPropuestaCliente[]> {
  const propuestas = await prisma.propuesta.findMany({
    where: { idCliente },
    orderBy: { idPropuesta: "desc" },
    include: { motivo: { select: { nombre: true } } },
  });
  return propuestas.map((p) => ({
    idPropuesta: p.idPropuesta,
    motivo: p.motivo.nombre,
    fechaEnvio: p.fechaEnvio,
    estado: p.estado,
  }));
}

export interface DetalleEvaluacion {
  resultado: string;
  observaciones: string | null;
  ajustes: string[];
  presupuesto: { monto: number; observaciones: string | null } | null;
}

export interface DetallePropuestaCliente {
  idPropuesta: number;
  estado: string;
  evaluacion: DetalleEvaluacion | null;
}

/** CU 4: solo lectura; el cliente únicamente accede a sus propias propuestas. */
export async function detallePropuestaCliente(
  idCliente: number,
  idPropuesta: number,
): Promise<DetallePropuestaCliente | null> {
  const p = await prisma.propuesta.findFirst({
    where: { idPropuesta, idCliente },
    include: {
      evaluacion: { include: { ajustes: { orderBy: { idAjuste: "asc" } } } },
      presupuesto: true,
    },
  });
  if (!p) return null;
  return {
    idPropuesta: p.idPropuesta,
    estado: p.estado,
    evaluacion: p.evaluacion
      ? {
          resultado: p.evaluacion.resultado,
          observaciones: p.evaluacion.observaciones,
          ajustes: p.evaluacion.ajustes.map((a) => a.descripcion),
          presupuesto: p.presupuesto
            ? {
                monto: p.presupuesto.monto.toNumber(),
                observaciones: p.presupuesto.observaciones,
              }
            : null,
        }
      : null,
  };
}

// ---------------------------------------------------------------- Artesana (CU 5 a CU 8)

export interface ResumenPropuestaRecibida extends ResumenPropuestaCliente {
  cliente: string;
}

/** CU 6: listado de propuestas recibidas, con filtro por estado. */
export async function listarPropuestasRecibidas(
  estado?: Estado,
): Promise<ResumenPropuestaRecibida[]> {
  const propuestas = await prisma.propuesta.findMany({
    where: estado ? { estado } : undefined,
    orderBy: { idPropuesta: "desc" },
    include: {
      motivo: { select: { nombre: true } },
      cliente: { select: { nombre: true } },
    },
  });
  return propuestas.map((p) => ({
    idPropuesta: p.idPropuesta,
    motivo: p.motivo.nombre,
    cliente: p.cliente.nombre,
    fechaEnvio: p.fechaEnvio,
    estado: p.estado,
  }));
}

export interface DetallePropuestaRecibida {
  idPropuesta: number;
  estado: string;
  cliente: string;
  descripcion: string;
  motivo: { nombre: string; grilla: string[][] };
  datos: DatosCalculados;
  evaluacion: DetalleEvaluacion | null;
}

export async function detallePropuestaRecibida(
  idPropuesta: number,
): Promise<DetallePropuestaRecibida | null> {
  const p = await prisma.propuesta.findUnique({
    where: { idPropuesta },
    include: {
      cliente: { select: { nombre: true } },
      motivo: { select: { nombre: true, grilla: true } },
      detalles: { include: { color: true }, orderBy: { idDetalle: "asc" } },
      evaluacion: { include: { ajustes: { orderBy: { idAjuste: "asc" } } } },
      presupuesto: true,
    },
  });
  if (!p) return null;

  const colores = p.detalles.map((d) => ({
    nombre: d.color.nombre,
    codigoHex: d.color.codigoHex,
    puntos: d.puntos,
    metrosHilo: d.metrosHilo.toNumber(),
  }));
  const totalMetros = Math.round(colores.reduce((suma, c) => suma + c.metrosHilo, 0) * 100) / 100;

  return {
    idPropuesta: p.idPropuesta,
    estado: p.estado,
    cliente: p.cliente.nombre,
    descripcion: p.descripcion,
    motivo: { nombre: p.motivo.nombre, grilla: leerGrilla(p.motivo.grilla) },
    datos: { totalPuntos: p.totalPuntos, totalMetros, colores },
    evaluacion: p.evaluacion
      ? {
          resultado: p.evaluacion.resultado,
          observaciones: p.evaluacion.observaciones,
          ajustes: p.evaluacion.ajustes.map((a) => a.descripcion),
          presupuesto: p.presupuesto
            ? {
                monto: p.presupuesto.monto.toNumber(),
                observaciones: p.presupuesto.observaciones,
              }
            : null,
        }
      : null,
  };
}

const esquemaEvaluacion = z.object({
  idPropuesta: z.number().int().positive(),
  resultado: z.enum(RESULTADOS),
  observaciones: z.string().trim().max(2000).optional(),
  ajustes: z.array(z.string().trim().max(500)).max(20),
  monto: z.number().finite().optional(),
});

export type EntradaEvaluacion = z.input<typeof esquemaEvaluacion>;

const MONTO_MAXIMO = 999_999_999.99;

/**
 * CU 5, CU 7 y CU 8: registra la evaluación de factibilidad, los ajustes (si es factible con
 * ajustes) y el presupuesto (si es factible o factible con ajustes). El estado de la propuesta
 * pasa a Evaluada y, cuando hay presupuesto, a Presupuestada.
 */
export async function evaluarPropuesta(idArtesana: number, entrada: unknown): Promise<void> {
  const datos = esquemaEvaluacion.safeParse(entrada);
  if (!datos.success) throw new ErrorDeNegocio("Revisá los datos de la evaluación.");
  const { idPropuesta, resultado, observaciones } = datos.data;

  const conAjustes = resultado === "Factible con ajustes";
  const conPresupuesto = resultado !== "No factible";
  const ajustes = conAjustes ? datos.data.ajustes.filter((a) => a.length > 0) : [];

  if (conAjustes && ajustes.length === 0) {
    throw new ErrorDeNegocio("Registrá al menos un ajuste necesario.");
  }

  let monto: number | undefined;
  if (conPresupuesto) {
    monto = datos.data.monto;
    if (monto === undefined || !(monto > 0) || monto > MONTO_MAXIMO) {
      throw new ErrorDeNegocio("El monto debe ser un número mayor que cero.");
    }
    monto = Math.round(monto * 100) / 100;
  }

  await prisma.$transaction(async (tx) => {
    // Solo se evalúa una propuesta en estado Enviada (evita evaluaciones duplicadas).
    const cambio = await tx.propuesta.updateMany({
      where: { idPropuesta, estado: "Enviada" },
      data: { estado: "Evaluada" },
    });
    if (cambio.count !== 1) {
      throw new ErrorDeNegocio("La propuesta no existe o ya fue evaluada.");
    }

    await tx.evaluacion.create({
      data: {
        idPropuesta,
        idArtesana,
        resultado,
        observaciones: observaciones || null,
        ajustes: { create: ajustes.map((descripcion) => ({ descripcion })) },
      },
    });

    if (monto !== undefined) {
      await tx.presupuesto.create({ data: { idPropuesta, monto } });
      await tx.propuesta.update({
        where: { idPropuesta },
        data: { estado: "Presupuestada" },
      });
    }
  });
}
