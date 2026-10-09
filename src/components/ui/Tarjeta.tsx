import type { ReactNode } from "react";

interface PropsTarjeta {
  titulo?: ReactNode;
  descripcion?: ReactNode;
  acciones?: ReactNode;
  children: ReactNode;
  className?: string;
  /** Clases del cuerpo; por defecto, sin relleno extra (lo pone la tarjeta). */
  cuerpo?: string;
  as?: "section" | "div" | "article";
}

/**
 * Contenedor estandar: tarjeta blanca sin borde, radio de 20 px y sombra
 * apenas visible. El titulo va a 15 px/600 y la descripcion como etiqueta gris.
 */
export function Tarjeta({
  titulo,
  descripcion,
  acciones,
  children,
  className,
  cuerpo,
  as: Etiqueta = "section",
}: PropsTarjeta) {
  return (
    <Etiqueta
      className={[
        "tarjeta-impresion evitar-corte flex min-w-0 flex-col rounded-tarjeta bg-tarjeta p-5 shadow-tarjeta sm:p-6",
        className ?? "",
      ].join(" ")}
    >
      {(titulo || acciones) && (
        <header className="mb-4 flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
          <div className="min-w-0">
            {titulo && <h2 className="text-[15px] font-semibold leading-tight">{titulo}</h2>}
            {descripcion && (
              <p className="mt-1 text-[13px] font-medium leading-snug text-tenue">{descripcion}</p>
            )}
          </div>
          {acciones && <div className="flex shrink-0 flex-wrap gap-2">{acciones}</div>}
        </header>
      )}
      <div className={cuerpo ?? "min-w-0 flex-1"}>{children}</div>
    </Etiqueta>
  );
}

/** Texto explicativo pequeno dentro de una tarjeta (como se lee una grafica). */
export function Nota({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={`mt-3 text-[12px] leading-relaxed text-tenue ${className ?? ""}`}>{children}</p>
  );
}

/** Etiqueta pequena en gris, la que acompana a cada cifra. */
export function Etiqueta({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={`text-[13px] font-medium text-tenue ${className ?? ""}`}>{children}</p>;
}

type TonoChip = "positivo" | "negativo" | "neutro" | "oscuro";

const TONOS_CHIP: Record<TonoChip, string> = {
  positivo: "bg-positivo-suave text-positivo-texto",
  negativo: "bg-negativo-suave text-negativo-texto",
  neutro: "bg-fondo text-tinta",
  oscuro: "bg-white/10 text-white",
};

/** Chip en forma de pildora: estados ("Conveniente") y supuestos. */
export function Chip({
  tono = "neutro",
  children,
  className,
}: {
  tono?: TonoChip;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold whitespace-nowrap ${TONOS_CHIP[tono]} ${className ?? ""}`}
    >
      {children}
    </span>
  );
}
