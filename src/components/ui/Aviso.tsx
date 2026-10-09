import type { ReactNode } from "react";
import { IconoAlerta, IconoCheck, IconoInfo } from "./Iconos";

type Tono = "info" | "exito" | "alerta" | "peligro";

// Sin amarillos ni dorados: las advertencias van en neutro con icono, y el rojo
// queda reservado para lo que de verdad es negativo (un error).
const TONOS: Record<Tono, string> = {
  info: "bg-tarjeta text-tinta shadow-tarjeta",
  exito: "bg-positivo-suave text-positivo-texto",
  alerta: "bg-tarjeta text-tinta shadow-tarjeta",
  peligro: "bg-negativo-suave text-negativo-texto",
};

interface PropsAviso {
  tono?: Tono;
  titulo?: string;
  children: ReactNode;
  className?: string;
}

/** Mensaje contextual: ayuda, advertencia o error. */
export function Aviso({ tono = "info", titulo, children, className }: PropsAviso) {
  const Icono = tono === "exito" ? IconoCheck : tono === "info" ? IconoInfo : IconoAlerta;
  return (
    <div
      className={`flex gap-3 rounded-2xl px-4 py-3 text-[13px] leading-relaxed ${TONOS[tono]} ${className ?? ""}`}
      role={tono === "peligro" ? "alert" : undefined}
    >
      <Icono tamano={18} className="mt-0.5 shrink-0" />
      <div className="min-w-0">
        {titulo && <p className="font-semibold">{titulo}</p>}
        <div className={titulo ? "mt-0.5 text-current/80" : undefined}>{children}</div>
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
    <div className="rounded-2xl bg-fondo px-4 py-6 text-center">
      <p className="text-sm font-semibold">{titulo}</p>
      {children && <div className="mt-1 text-[13px] text-tenue">{children}</div>}
    </div>
  );
}
