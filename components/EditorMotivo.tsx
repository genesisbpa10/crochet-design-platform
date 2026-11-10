"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import type { PointerEvent } from "react";
import { guardarMotivoAccion } from "@/app/actions/motivos";
import {
  calcular,
  crearGrillaVacia,
  dimensionesValidas,
  redimensionarGrilla,
  type ColorPaleta,
  type Grilla,
} from "@/lib/calculo";
import { COLOR_FONDO, LADO_MAXIMO, LADO_MINIMO, MAX_COLORES, PALETA_INICIAL } from "@/lib/dominio";
import { TablaDatos } from "@/components/TablaDatos";

interface Inicial {
  id?: number;
  nombre: string;
  ancho: number;
  alto: number;
  grilla: Grilla;
  paleta: ColorPaleta[];
}

const TAMANO_LIENZO = 480;
const INICIAL_NUEVO: Inicial = {
  nombre: "",
  ancho: 16,
  alto: 16,
  grilla: crearGrillaVacia(16, 16),
  paleta: PALETA_INICIAL.map((c) => ({ ...c })),
};

type Herramienta = "pintar" | "borrar";

export function EditorMotivo({ inicial }: { inicial?: Inicial }) {
  const base = inicial ?? INICIAL_NUEVO;
  const [idMotivo, setIdMotivo] = useState(base.id);
  const [nombre, setNombre] = useState(base.nombre);
  const [ancho, setAncho] = useState(base.ancho);
  const [alto, setAlto] = useState(base.alto);
  const [textoAncho, setTextoAncho] = useState(String(base.ancho));
  const [textoAlto, setTextoAlto] = useState(String(base.alto));
  const [grilla, setGrilla] = useState<Grilla>(base.grilla);
  const [paleta, setPaleta] = useState<ColorPaleta[]>(base.paleta);
  const [colorActivo, setColorActivo] = useState(
    base.paleta.find((c) => c.codigoHex !== COLOR_FONDO)?.codigoHex ?? base.paleta[0].codigoHex,
  );
  const [herramienta, setHerramienta] = useState<Herramienta>("pintar");
  const [errorDimensiones, setErrorDimensiones] = useState<string | null>(null);
  const [agregando, setAgregando] = useState(false);
  const [nuevoHex, setNuevoHex] = useState("#2a6f97");
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [mensaje, setMensaje] = useState<{ tipo: "error" | "exito"; texto: string } | null>(null);
  const [guardando, iniciarGuardado] = useTransition();
  const router = useRouter();

  const lienzo = useRef<HTMLCanvasElement>(null);
  const dibujando = useRef(false);

  const celda = Math.max(2, Math.floor(TAMANO_LIENZO / Math.max(ancho, alto)));
  // RNF 2: el cálculo se rehace en cada cambio de la grilla (máximo 100 x 100 celdas).
  const datos = useMemo(() => calcular(grilla, paleta), [grilla, paleta]);

  useEffect(() => {
    const contexto = lienzo.current?.getContext("2d");
    if (!contexto) return;
    grilla.forEach((fila, y) => {
      fila.forEach((color, x) => {
        contexto.fillStyle = color;
        contexto.fillRect(x * celda, y * celda, celda, celda);
      });
    });
    if (celda >= 6) {
      contexto.strokeStyle = "rgba(59, 42, 26, 0.18)";
      contexto.lineWidth = 1;
      contexto.beginPath();
      for (let x = 0; x <= ancho; x++) {
        contexto.moveTo(x * celda + 0.5, 0);
        contexto.lineTo(x * celda + 0.5, alto * celda);
      }
      for (let y = 0; y <= alto; y++) {
        contexto.moveTo(0, y * celda + 0.5);
        contexto.lineTo(ancho * celda, y * celda + 0.5);
      }
      contexto.stroke();
    }
  }, [grilla, celda, ancho, alto]);

  function pintar(evento: PointerEvent<HTMLCanvasElement>) {
    const elemento = lienzo.current;
    if (!elemento) return;
    const rect = elemento.getBoundingClientRect();
    const x = Math.floor(((evento.clientX - rect.left) * (elemento.width / rect.width)) / celda);
    const y = Math.floor(((evento.clientY - rect.top) * (elemento.height / rect.height)) / celda);
    if (x < 0 || y < 0 || x >= ancho || y >= alto) return;
    const color = herramienta === "borrar" ? COLOR_FONDO : colorActivo;
    setGrilla((previa) => {
      if (previa[y][x] === color) return previa;
      const copia = previa.slice();
      copia[y] = previa[y].slice();
      copia[y][x] = color;
      return copia;
    });
    setMensaje(null);
  }

  function aplicarDimensiones() {
    const nuevoAncho = Number(textoAncho);
    const nuevoAlto = Number(textoAlto);
    if (!dimensionesValidas(nuevoAncho, nuevoAlto)) {
      setErrorDimensiones(
        `Las dimensiones deben ser números enteros entre ${LADO_MINIMO} y ${LADO_MAXIMO}.`,
      );
      return;
    }
    setErrorDimensiones(null);
    setAncho(nuevoAncho);
    setAlto(nuevoAlto);
    setGrilla((previa) => redimensionarGrilla(previa, nuevoAncho, nuevoAlto));
  }

  function agregarColor() {
    const codigo = nuevoHex.toLowerCase();
    if (paleta.some((c) => c.codigoHex === codigo)) {
      setMensaje({ tipo: "error", texto: "Ese color ya está en la paleta." });
      return;
    }
    if (paleta.length >= MAX_COLORES) {
      setMensaje({ tipo: "error", texto: `La paleta admite hasta ${MAX_COLORES} colores.` });
      return;
    }
    const nombreColor = nuevoNombre.trim() || `Color ${paleta.length + 1}`;
    setPaleta((previa) => [...previa, { nombre: nombreColor, codigoHex: codigo }]);
    setColorActivo(codigo);
    setHerramienta("pintar");
    setNuevoNombre("");
    setAgregando(false);
    setMensaje(null);
  }

  function guardar() {
    setMensaje(null);
    iniciarGuardado(async () => {
      const resultado = await guardarMotivoAccion({
        id: idMotivo,
        nombre,
        ancho,
        alto,
        grilla,
        paleta,
      });
      if (resultado.ok) {
        setIdMotivo(resultado.id);
        setMensaje({ tipo: "exito", texto: "Motivo guardado." });
        router.refresh();
      } else {
        setMensaje({ tipo: "error", texto: resultado.error });
      }
    });
  }

  return (
    <div className="columnas columnas-2">
      <div>
        <h1>Diseñar motivo</h1>
        <canvas
          ref={lienzo}
          className="lienzo"
          width={ancho * celda}
          height={alto * celda}
          role="img"
          aria-label={`Grilla de ${ancho} por ${alto} puntos`}
          onPointerDown={(evento) => {
            dibujando.current = true;
            evento.currentTarget.setPointerCapture(evento.pointerId);
            pintar(evento);
          }}
          onPointerMove={(evento) => {
            if (dibujando.current) pintar(evento);
          }}
          onPointerUp={() => {
            dibujando.current = false;
          }}
          onPointerCancel={() => {
            dibujando.current = false;
          }}
        />
        <p className="ayuda">
          Grilla de {ancho} × {alto} puntos. Cada celda es un punto de tapestry crochet.
        </p>
      </div>

      <div className="pila">
        <section className="tarjeta" aria-label="Motivo">
          <h2>Motivo</h2>
          <label htmlFor="nombre-motivo">Nombre</label>
          <input
            id="nombre-motivo"
            type="text"
            value={nombre}
            maxLength={80}
            onChange={(e) => setNombre(e.target.value)}
          />

          <span className="etiqueta">
            Dimensiones ({LADO_MINIMO} a {LADO_MAXIMO} puntos)
          </span>
          <div className="fila">
            <input
              className="corto"
              type="number"
              inputMode="numeric"
              min={LADO_MINIMO}
              max={LADO_MAXIMO}
              aria-label="Ancho en puntos"
              value={textoAncho}
              onChange={(e) => setTextoAncho(e.target.value)}
            />
            <span>ancho ×</span>
            <input
              className="corto"
              type="number"
              inputMode="numeric"
              min={LADO_MINIMO}
              max={LADO_MAXIMO}
              aria-label="Alto en puntos"
              value={textoAlto}
              onChange={(e) => setTextoAlto(e.target.value)}
            />
            <span>alto</span>
            <button type="button" className="boton" onClick={aplicarDimensiones}>
              Aplicar
            </button>
          </div>
          {errorDimensiones && (
            <p className="error" role="alert">
              {errorDimensiones}
            </p>
          )}

          <span className="etiqueta">Herramienta</span>
          <div className="fila">
            <button
              type="button"
              className={`boton ${herramienta === "pintar" ? "boton-activo" : ""}`}
              aria-pressed={herramienta === "pintar"}
              onClick={() => setHerramienta("pintar")}
            >
              Pintar
            </button>
            <button
              type="button"
              className={`boton ${herramienta === "borrar" ? "boton-activo" : ""}`}
              aria-pressed={herramienta === "borrar"}
              onClick={() => setHerramienta("borrar")}
            >
              Borrar
            </button>
          </div>

          <span className="etiqueta">Paleta de colores</span>
          <div className="paleta">
            {paleta.map((color) => (
              <button
                key={color.codigoHex}
                type="button"
                className="muestra"
                aria-pressed={herramienta === "pintar" && colorActivo === color.codigoHex}
                onClick={() => {
                  setColorActivo(color.codigoHex);
                  setHerramienta("pintar");
                }}
              >
                <span className="punto-color" style={{ background: color.codigoHex, margin: 0 }} />
                {color.nombre}
              </button>
            ))}
            <button type="button" className="boton" onClick={() => setAgregando((v) => !v)}>
              + Color
            </button>
          </div>
          {agregando && (
            <div className="fila" style={{ marginTop: "0.6rem" }}>
              <input
                type="color"
                aria-label="Nuevo color"
                value={nuevoHex}
                onChange={(e) => setNuevoHex(e.target.value)}
                style={{ width: "3rem", height: "2.4rem", padding: 0 }}
              />
              <input
                type="text"
                aria-label="Nombre del color"
                placeholder="Nombre del color"
                maxLength={40}
                value={nuevoNombre}
                onChange={(e) => setNuevoNombre(e.target.value)}
                style={{ width: "12rem" }}
              />
              <button type="button" className="boton boton-principal" onClick={agregarColor}>
                Agregar
              </button>
            </div>
          )}
        </section>

        <TablaDatos datos={datos} />

        {mensaje && (
          <p className={mensaje.tipo === "error" ? "error" : "exito"} role="status">
            {mensaje.texto}
          </p>
        )}

        <div className="acciones" style={{ marginTop: 0 }}>
          <button
            type="button"
            className="boton boton-principal"
            onClick={guardar}
            disabled={guardando || nombre.trim() === ""}
          >
            {guardando ? "Guardando…" : "Guardar motivo"}
          </button>
          <Link href="/enviar" className="boton">
            Ir a enviar propuesta
          </Link>
        </div>
      </div>
    </div>
  );
}
