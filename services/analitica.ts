import { prisma } from "@/lib/db";
import { ESTADOS, type Estado } from "@/lib/dominio";

export interface ColorUtilizado {
  nombre: string;
  codigoHex: string;
  veces: number;
}

export interface Analitica {
  totalPropuestas: number;
  porEstado: { estado: Estado; cantidad: number }[];
  promedioPuntos: number;
  promedioMetros: number;
  colores: ColorUtilizado[];
}

interface DetalleColorLeido {
  idPropuesta: number;
  puntos: number;
  color: { nombre: string; codigoHex: string };
}

/** Cuenta en cuántas propuestas se utilizó cada color (puntos > 0), de mayor a menor. */
export function contarColores(detalles: DetalleColorLeido[]): ColorUtilizado[] {
  const usados = new Map<string, { nombre: string; propuestas: Set<number> }>();
  for (const d of detalles) {
    if (d.puntos <= 0) continue;
    const clave = d.color.codigoHex.toLowerCase();
    const actual = usados.get(clave) ?? { nombre: d.color.nombre, propuestas: new Set<number>() };
    actual.propuestas.add(d.idPropuesta);
    usados.set(clave, actual);
  }
  return [...usados.entries()]
    .map(([codigoHex, { nombre, propuestas }]) => ({ nombre, codigoHex, veces: propuestas.size }))
    .sort((a, b) => b.veces - a.veces || a.nombre.localeCompare(b.nombre, "es"));
}

/** Indicadores definidos en los alcances (Figura 17), sobre todas las propuestas recibidas. */
export async function obtenerAnalitica(): Promise<Analitica> {
  const [porEstado, promedios, metros, detalles] = await Promise.all([
    prisma.propuesta.groupBy({ by: ["estado"], _count: { _all: true } }),
    prisma.propuesta.aggregate({ _avg: { totalPuntos: true }, _count: { _all: true } }),
    prisma.detalleColor.aggregate({ _sum: { metrosHilo: true } }),
    prisma.detalleColor.findMany({
      where: { puntos: { gt: 0 } },
      select: {
        idPropuesta: true,
        puntos: true,
        color: { select: { nombre: true, codigoHex: true } },
      },
    }),
  ]);

  const totalPropuestas = promedios._count._all;
  return {
    totalPropuestas,
    porEstado: ESTADOS.map((estado) => ({
      estado,
      cantidad: porEstado.find((fila) => fila.estado === estado)?._count._all ?? 0,
    })),
    promedioPuntos: promedios._avg.totalPuntos ?? 0,
    promedioMetros: totalPropuestas > 0 ? Number(metros._sum.metrosHilo ?? 0) / totalPropuestas : 0,
    colores: contarColores(detalles),
  };
}
