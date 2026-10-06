"use client";

import { useId, type ReactNode } from "react";

const CLASES_ENTRADA =
  "w-full min-h-11 rounded-lg border border-borde bg-white px-3 py-2 text-sm text-marino-900 " +
  "placeholder:text-marino-300 transition-colors hover:border-marino-300 " +
  "focus:border-marino-500 focus:outline-none cifra";

interface Base {
  etiqueta: string;
  /** Unidad que se muestra junto a la etiqueta: ($/mes), (clientes/mes), (% anual)… */
  unidad?: string;
  ayuda?: ReactNode;
  requerido?: boolean;
  className?: string;
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
  return (
    <label htmlFor={id} className="block text-sm font-medium text-marino-800">
      {etiqueta}
      {unidad && <span className="ml-1 font-normal text-marino-500">{unidad}</span>}
      {requerido && (
        <span className="ml-1 text-peligro-600" aria-label="obligatorio">
          *
        </span>
      )}
    </label>
  );
}

// ---------------------------------------------------------------------------

interface PropsTexto extends Base {
  valor: string;
  onChange: (valor: string) => void;
  placeholder?: string;
}

export function CampoTexto({
  etiqueta,
  unidad,
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
      <Etiqueta id={id} etiqueta={etiqueta} unidad={unidad} requerido={requerido} />
      <input
        id={id}
        type="text"
        className={`${CLASES_ENTRADA} mt-1.5`}
        value={valor}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
      {ayuda && <p className="mt-1.5 text-xs leading-relaxed text-marino-500">{ayuda}</p>}
    </div>
  );
}

// ---------------------------------------------------------------------------

interface PropsNumero extends Base {
  valor: number | null;
  onChange: (valor: number | null) => void;
  min?: number;
  paso?: number;
  placeholder?: string;
}

/**
 * Entrada numerica que distingue "vacio" de "cero": un campo sin llenar vale
 * null y se muestra en blanco, nunca como 0. Asi los estados vacios son
 * explicitos y la validacion puede pedir el dato que falta.
 */
export function CampoNumero({
  etiqueta,
  unidad,
  ayuda,
  requerido,
  valor,
  onChange,
  min,
  paso,
  placeholder,
  className,
}: PropsNumero) {
  const id = useId();
  return (
    <div className={className}>
      <Etiqueta id={id} etiqueta={etiqueta} unidad={unidad} requerido={requerido} />
      <input
        id={id}
        type="number"
        inputMode="decimal"
        min={min}
        step={paso}
        placeholder={placeholder ?? "—"}
        className={`${CLASES_ENTRADA} mt-1.5`}
        value={valor === null || valor === undefined ? "" : String(valor)}
        onChange={(e) => onChange(aNumero(e.target.value))}
      />
      {ayuda && <p className="mt-1.5 text-xs leading-relaxed text-marino-500">{ayuda}</p>}
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
  alineacion = "derecha",
}: {
  etiquetaAccesible: string;
  valor: number | null;
  onChange: (valor: number | null) => void;
  min?: number;
  placeholder?: string;
  alineacion?: "derecha" | "izquierda";
}) {
  return (
    <input
      type="number"
      inputMode="decimal"
      min={min}
      aria-label={etiquetaAccesible}
      placeholder={placeholder ?? "—"}
      className={`${CLASES_ENTRADA} ${alineacion === "derecha" ? "text-right" : ""}`}
      value={valor === null || valor === undefined ? "" : String(valor)}
      onChange={(e) => onChange(aNumero(e.target.value))}
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
    <input
      type="text"
      aria-label={etiquetaAccesible}
      placeholder={placeholder}
      className={CLASES_ENTRADA}
      value={valor}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

function aNumero(texto: string): number | null {
  if (texto.trim() === "") return null;
  const valor = Number(texto);
  return Number.isFinite(valor) ? valor : null;
}
