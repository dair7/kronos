"use client";

import { useId, useLayoutEffect, useRef, type ReactNode } from "react";
import { numero } from "@/lib/formato";

/**
 * Caja del campo: 44 px de alto, radio de 12 px y borde gris. El borde va en
 * la caja (no en el input) para poder meter el signo $ a la izquierda y la
 * unidad a la derecha, dentro del campo.
 */
const CLASES_CAJA =
  "flex h-11 w-full items-center rounded-campo border border-linea bg-tarjeta transition-colors " +
  "hover:border-contexto focus-within:border-tinta focus-within:ring-2 focus-within:ring-tinta/10";

const CLASES_ENTRADA =
  "cifra h-full w-full min-w-0 bg-transparent px-3.5 text-sm font-medium text-tinta " +
  "placeholder:font-normal placeholder:text-contexto-oscuro/50 focus:outline-none";

interface Base {
  etiqueta: string;
  /** Unidad dentro del campo: "$" va a la izquierda; "/mes", "%", "clientes/mes"… a la derecha. */
  unidad?: string;
  /** Unidad cuando el valor es 1: "puesto" frente a "puestos". */
  unidadSingular?: string;
  ayuda?: ReactNode;
  requerido?: boolean;
  className?: string;
}

/** Quita los parentesis heredados: "(clientes/mes)" se muestra "clientes/mes". */
function limpiarUnidad(unidad?: string) {
  return unidad?.replace(/[()]/g, "").trim();
}

/** Separa "$/mes" en prefijo "$" y sufijo "/mes". */
function partesUnidad(unidad?: string, unidadSingular?: string, valor?: number | null) {
  const texto = limpiarUnidad(valor === 1 && unidadSingular ? unidadSingular : unidad) ?? "";
  if (texto.startsWith("$")) {
    return { prefijo: "$", sufijo: texto.slice(1).trim() || undefined };
  }
  return { prefijo: undefined, sufijo: texto || undefined };
}

function Etiqueta({
  id,
  etiqueta,
  unidad,
  requerido,
}: {
  id: string;
  etiqueta: string;
  unidad?: string;
  requerido?: boolean;
}) {
  const texto = limpiarUnidad(unidad);
  return (
    <label htmlFor={id} className="mb-1.5 block text-[13px] font-medium text-tenue">
      {etiqueta}
      {texto && <span className="sr-only"> (en {texto === "$" ? "pesos" : texto})</span>}
      {requerido && (
        <span className="ml-0.5 text-tinta" aria-label="obligatorio">
          *
        </span>
      )}
    </label>
  );
}

function Prefijo({ texto }: { texto?: string }) {
  if (!texto) return null;
  return (
    <span aria-hidden className="shrink-0 pl-3.5 text-sm font-semibold text-tenue">
      {texto}
    </span>
  );
}

function Sufijo({ texto }: { texto?: string }) {
  if (!texto) return null;
  return (
    <span aria-hidden className="shrink-0 pr-3.5 text-[13px] font-medium whitespace-nowrap text-tenue">
      {texto}
    </span>
  );
}

function Ayuda({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return <p className="mt-1.5 text-[12px] leading-relaxed text-tenue">{children}</p>;
}

// ---------------------------------------------------------------------------

interface PropsTexto extends Base {
  valor: string;
  onChange: (valor: string) => void;
  placeholder?: string;
}

export function CampoTexto({
  etiqueta,
  ayuda,
  requerido,
  valor,
  onChange,
  placeholder,
  className,
}: PropsTexto) {
  const id = useId();
  return (
    <div className={className}>
      <Etiqueta id={id} etiqueta={etiqueta} requerido={requerido} />
      <div className={CLASES_CAJA}>
        <input
          id={id}
          type="text"
          className={CLASES_ENTRADA}
          value={valor}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
      <Ayuda>{ayuda}</Ayuda>
    </div>
  );
}

// ---------------------------------------------------------------------------

/** Muestra el numero con puntos de miles: 11000000 -> "11.000.000". */
function conMiles(valor: number): string {
  return numero(valor, Number.isInteger(valor) ? 0 : 2);
}

/** Convierte lo escrito ("11.000.000", "18.333,5") en el numero limpio. */
function leerMiles(texto: string): number | null {
  const limpio = texto.replace(/[^\d,]/g, "").replace(/,(?=.*,)/g, "").replace(",", ".");
  if (limpio === "" || limpio === ".") return null;
  const valor = Number(limpio);
  return Number.isFinite(valor) ? valor : null;
}

interface PropsEntrada {
  id?: string;
  etiquetaAccesible?: string;
  valor: number | null;
  onChange: (valor: number | null) => void;
  min?: number;
  paso?: number;
  placeholder?: string;
  unidad?: string;
  unidadSingular?: string;
  alineacion?: "derecha" | "izquierda";
  /**
   * Puntos de miles mientras se escribe. Por defecto se usa en todo campo que
   * no sea porcentaje ni lleve decimales (dinero, clientes, cantidades).
   */
  miles?: boolean;
}

/**
 * Entrada numerica que distingue "vacio" de "cero": un campo sin llenar vale
 * null y se muestra en blanco, nunca como 0. Con `miles`, el texto se muestra
 * con puntos (11.000.000) pero lo que se guarda es el numero limpio, y el
 * cursor se conserva en su lugar aunque aparezcan o desaparezcan puntos.
 */
function EntradaNumero({
  id,
  etiquetaAccesible,
  valor,
  onChange,
  min,
  paso,
  placeholder,
  unidad,
  unidadSingular,
  alineacion = "izquierda",
  miles,
}: PropsEntrada) {
  const { prefijo, sufijo } = partesUnidad(unidad, unidadSingular, valor);
  const usarMiles = miles ?? (!(sufijo ?? "").includes("%") && !(paso !== undefined && paso < 1));
  const entrada = useRef<HTMLInputElement>(null);
  // Cantidad de digitos que hay a la izquierda del cursor despues de escribir.
  const digitosAntes = useRef<number | null>(null);

  const texto = valor === null || valor === undefined ? "" : usarMiles ? conMiles(valor) : String(valor);

  useLayoutEffect(() => {
    const campo = entrada.current;
    const objetivo = digitosAntes.current;
    if (!campo || objetivo === null || document.activeElement !== campo) return;
    digitosAntes.current = null;
    let posicion = 0;
    let vistos = 0;
    while (posicion < campo.value.length && vistos < objetivo) {
      if (/\d/.test(campo.value[posicion])) vistos += 1;
      posicion += 1;
    }
    campo.setSelectionRange(posicion, posicion);
  }, [texto]);

  const clasesEntrada = `${CLASES_ENTRADA} ${prefijo ? "pl-1.5" : ""} ${alineacion === "derecha" ? "text-right" : ""}`;

  return (
    <div className={CLASES_CAJA}>
      <Prefijo texto={prefijo} />
      {usarMiles ? (
        <input
          ref={entrada}
          id={id}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          aria-label={etiquetaAccesible}
          placeholder={placeholder ?? "—"}
          className={clasesEntrada}
          value={texto}
          onChange={(e) => {
            const cursor = e.target.selectionStart ?? e.target.value.length;
            digitosAntes.current = e.target.value.slice(0, cursor).replace(/\D/g, "").length;
            onChange(leerMiles(e.target.value));
          }}
        />
      ) : (
        <input
          id={id}
          type="number"
          inputMode="decimal"
          min={min}
          step={paso}
          aria-label={etiquetaAccesible}
          placeholder={placeholder ?? "—"}
          className={clasesEntrada}
          value={texto}
          onChange={(e) => onChange(aNumero(e.target.value))}
        />
      )}
      <Sufijo texto={sufijo} />
    </div>
  );
}

interface PropsNumero extends Base {
  valor: number | null;
  onChange: (valor: number | null) => void;
  min?: number;
  paso?: number;
  placeholder?: string;
  miles?: boolean;
}

export function CampoNumero({
  etiqueta,
  unidad,
  unidadSingular,
  ayuda,
  requerido,
  valor,
  onChange,
  min,
  paso,
  placeholder,
  className,
  miles,
}: PropsNumero) {
  const id = useId();
  return (
    <div className={className}>
      <Etiqueta id={id} etiqueta={etiqueta} unidad={unidad} requerido={requerido} />
      <EntradaNumero
        id={id}
        valor={valor}
        onChange={onChange}
        min={min}
        paso={paso}
        placeholder={placeholder}
        unidad={unidad}
        unidadSingular={unidadSingular}
        miles={miles}
      />
      <Ayuda>{ayuda}</Ayuda>
    </div>
  );
}

/** Entrada numerica compacta, para las celdas de las tablas editables. */
export function CeldaNumero({
  etiquetaAccesible,
  valor,
  onChange,
  min,
  placeholder,
  unidad,
  unidadSingular,
  alineacion = "derecha",
  miles,
}: {
  etiquetaAccesible: string;
  valor: number | null;
  onChange: (valor: number | null) => void;
  min?: number;
  placeholder?: string;
  unidad?: string;
  unidadSingular?: string;
  alineacion?: "derecha" | "izquierda";
  miles?: boolean;
}) {
  return (
    <EntradaNumero
      etiquetaAccesible={etiquetaAccesible}
      valor={valor}
      onChange={onChange}
      min={min}
      placeholder={placeholder}
      unidad={unidad}
      unidadSingular={unidadSingular}
      alineacion={alineacion}
      miles={miles}
    />
  );
}

/** Entrada de texto compacta, para las celdas de las tablas editables. */
export function CeldaTexto({
  etiquetaAccesible,
  valor,
  onChange,
  placeholder,
}: {
  etiquetaAccesible: string;
  valor: string;
  onChange: (valor: string) => void;
  placeholder?: string;
}) {
  return (
    <div className={CLASES_CAJA}>
      <input
        type="text"
        aria-label={etiquetaAccesible}
        placeholder={placeholder}
        className={CLASES_ENTRADA}
        value={valor}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function aNumero(texto: string): number | null {
  if (texto.trim() === "") return null;
  const valor = Number(texto);
  return Number.isFinite(valor) ? valor : null;
}
