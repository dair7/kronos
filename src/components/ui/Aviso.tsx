import type { ReactNode } from "react";

type Tono = "info" | "exito" | "alerta" | "peligro";

const TONOS: Record<Tono, string> = {
  info: "border-marino-200 bg-marino-50 text-marino-800",
  exito: "border-exito-200 bg-exito-50 text-exito-900",
  alerta: "border-alerta-200 bg-alerta-50 text-alerta-900",
  peligro: "border-peligro-200 bg-peligro-50 text-peligro-900",
};

const ICONOS: Record<Tono, string> = {
  info: "i",
  exito: "✓",
  alerta: "!",
  peligro: "!",
};

interface PropsAviso {
  tono?: Tono;
  titulo?: string;
  children: ReactNode;
  className?: string;
}

/** Mensaje contextual: ayuda, advertencia o error. */
export function Aviso({ tono = "info", titulo, children, className }: PropsAviso) {
  return (
    <div
      className={`flex gap-3 rounded-lg border px-3 py-3 text-sm leading-relaxed ${TONOS[tono]} ${className ?? ""}`}
      role={tono === "peligro" ? "alert" : undefined}
    >
      <span
        aria-hidden
        className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border border-current text-xs font-bold"
      >
        {ICONOS[tono]}
      </span>
      <div className="min-w-0">
        {titulo && <p className="font-semibold">{titulo}</p>}
        <div className={titulo ? "mt-1" : undefined}>{children}</div>
      </div>
    </div>
  );
}

/**
 * Estado vacio: en lugar de mostrar ceros o espacios en blanco, dice que dato
 * falta y donde se completa.
 */
export function EstadoVacio({ titulo, children }: { titulo: string; children?: ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-borde bg-marino-50/50 px-4 py-6 text-center">
      <p className="text-sm font-medium text-marino-700">{titulo}</p>
      {children && <div className="mt-1 text-xs text-marino-500">{children}</div>}
    </div>
  );
}
