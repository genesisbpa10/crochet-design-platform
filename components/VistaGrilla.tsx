"use client";

import { useEffect, useRef } from "react";

interface Props {
  grilla: string[][];
  /** Tamaño máximo (en píxeles) del lado mayor. */
  maximo?: number;
  descripcion: string;
}

/** Vista de solo lectura de una grilla, dibujada sobre un único canvas. */
export function VistaGrilla({ grilla, maximo = 240, descripcion }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const alto = grilla.length;
  const ancho = alto > 0 ? grilla[0].length : 0;
  const celda = Math.max(1, Math.floor(maximo / Math.max(ancho, alto, 1)));

  useEffect(() => {
    const contexto = ref.current?.getContext("2d");
    if (!contexto) return;
    grilla.forEach((fila, y) => {
      fila.forEach((color, x) => {
        contexto.fillStyle = color;
        contexto.fillRect(x * celda, y * celda, celda, celda);
      });
    });
  }, [grilla, celda]);

  return (
    <canvas
      ref={ref}
      className="lienzo lienzo-lectura"
      width={ancho * celda}
      height={alto * celda}
      role="img"
      aria-label={descripcion}
    />
  );
}
