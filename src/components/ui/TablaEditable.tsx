import type { ReactNode } from "react";

/**
 * Piezas de una tabla editable que se adapta al ancho de la pantalla:
 * en computador y tablet se ve como una tabla con encabezados, y en celular
 * cada fila se convierte en una tarjeta apilada con su propia etiqueta.
 * Asi nunca hay scroll horizontal ni columnas ilegibles.
 *
 * `plantilla` es la clase de rejilla de la tabla, por ejemplo
 * "md:grid-cols-[1fr_6rem_9rem_9rem_3rem]". Cada pantalla la escribe literal.
 */

export function ContenedorTabla({ children }: { children: ReactNode }) {
  return <div className="space-y-3 md:space-y-0">{children}</div>;
}

export function EncabezadoTabla({
  plantilla,
  columnas,
}: {
  plantilla: string;
  columnas: { titulo: string; alineacion?: "derecha" | "centro" }[];
}) {
  return (
    <div
      className={`hidden gap-3 border-b border-borde pb-2 text-xs font-medium uppercase tracking-wide text-marino-500 md:grid ${plantilla}`}
    >
      {columnas.map((columna) => (
        <span
          key={columna.titulo}
          className={
            columna.alineacion === "derecha"
              ? "text-right"
              : columna.alineacion === "centro"
                ? "text-center"
                : ""
          }
        >
          {columna.titulo}
        </span>
      ))}
    </div>
  );
}

export function FilaTabla({
  plantilla,
  children,
}: {
  plantilla: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`grid gap-3 rounded-lg border border-borde bg-marino-50/40 p-3 md:items-center md:rounded-none md:border-0 md:border-b md:border-borde md:bg-transparent md:px-0 md:py-2.5 ${plantilla}`}
    >
      {children}
    </div>
  );
}

/**
 * Celda de la tabla. En celular antepone la etiqueta de la columna, porque
 * ahi ya no hay encabezado que la explique.
 */
export function CeldaTabla({
  etiqueta,
  children,
  alineacion,
  className,
}: {
  etiqueta: string;
  children: ReactNode;
  alineacion?: "derecha" | "centro";
  className?: string;
}) {
  const alineado =
    alineacion === "derecha" ? "md:text-right" : alineacion === "centro" ? "md:text-center" : "";
  return (
    <div className={`min-w-0 ${alineado} ${className ?? ""}`}>
      <span className="mb-1 block text-xs font-medium text-marino-500 md:hidden">{etiqueta}</span>
      {children}
    </div>
  );
}

/** Pie de la tabla con el total calculado. */
export function PieTabla({
  etiqueta,
  valor,
  nota,
}: {
  etiqueta: string;
  valor: string;
  nota?: string;
}) {
  return (
    <div className="mt-4 flex flex-wrap items-baseline justify-between gap-2 rounded-lg bg-marino-900 px-4 py-3 text-white">
      <div>
        <p className="text-sm font-medium">{etiqueta}</p>
        {nota && <p className="text-xs text-marino-300">{nota}</p>}
      </div>
      <p className="cifra text-xl font-semibold text-dorado-300">{valor}</p>
    </div>
  );
}

/** Boton de eliminar fila, con etiqueta accesible. */
export function BotonEliminar({
  etiquetaAccesible,
  onClick,
  deshabilitado,
}: {
  etiquetaAccesible: string;
  onClick: () => void;
  deshabilitado?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={deshabilitado}
      aria-label={etiquetaAccesible}
      title={etiquetaAccesible}
      className="control-tactil flex w-full items-center justify-center gap-2 rounded-lg border border-peligro-200 bg-white px-3 text-sm font-medium text-peligro-700 transition-colors hover:bg-peligro-50 disabled:cursor-not-allowed disabled:opacity-40 md:w-11 md:px-0"
    >
      <span aria-hidden className="text-lg leading-none">
        ×
      </span>
      <span className="md:hidden">Eliminar</span>
    </button>
  );
}
