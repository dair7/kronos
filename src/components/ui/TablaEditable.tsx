import type { ReactNode } from "react";
import { IconoCerrar } from "./Iconos";
import { CifraPesos } from "./ResumenEnVivo";

/**
 * Piezas de una tabla editable que se adapta al ancho de la pantalla:
 * en computador y tablet se ve como una tabla sin bordes verticales, y en
 * celular cada fila se convierte en un bloque apilado con su propia etiqueta.
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
      className={`hidden gap-3 border-b border-linea pb-2.5 text-[12px] font-medium text-tenue md:grid ${plantilla}`}
    >
      {columnas.map((columna, indice) => (
        <span
          key={`${columna.titulo}-${indice}`}
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

export function FilaTabla({ plantilla, children }: { plantilla: string; children: ReactNode }) {
  return (
    <div
      className={`relative grid gap-2.5 rounded-2xl bg-fondo p-3 md:items-center md:gap-3 md:rounded-none md:border-b md:border-linea md:bg-transparent md:px-0 md:py-2 ${plantilla}`}
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
      {etiqueta && (
        <span className="mb-1 block text-[12px] font-medium text-tenue md:hidden">{etiqueta}</span>
      )}
      {children}
    </div>
  );
}

/** Pie de la tabla con el total calculado: franja negra con la cifra en blanco. */
export function PieTabla({
  etiqueta,
  valor,
  nota,
  negativo,
}: {
  etiqueta: string;
  valor: string;
  nota?: string;
  negativo?: boolean;
}) {
  return (
    <div className="mt-5 flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-tinta px-5 py-4 text-white">
      <div>
        <p className="text-sm font-semibold">{etiqueta}</p>
        {nota && <p className="mt-0.5 text-[12px] text-white/60">{nota}</p>}
      </div>
      <p className={`cifra text-[26px] font-bold ${negativo ? "text-[#fca5a5]" : ""}`}>
        <CifraPesos texto={valor} />
      </p>
    </div>
  );
}

/**
 * Celda con el boton de eliminar fila. En celular el boton es una X pequena
 * (area tactil de 44 px) en la esquina superior derecha de la tarjeta; desde
 * 768 px ocupa su propia columna. La primera celda de la fila debe dejarle
 * espacio con `pr-11 md:pr-0`.
 */
export function CeldaEliminar({
  etiquetaAccesible,
  onClick,
  deshabilitado,
}: {
  etiquetaAccesible: string;
  onClick: () => void;
  deshabilitado?: boolean;
}) {
  return (
    <div className="contents md:block md:text-center">
      <button
        type="button"
        onClick={onClick}
        disabled={deshabilitado}
        aria-label={etiquetaAccesible}
        title={etiquetaAccesible}
        className="absolute top-0.5 right-0.5 flex size-11 cursor-pointer items-center justify-center rounded-full text-tenue transition-colors hover:bg-negativo-suave hover:text-negativo-texto disabled:cursor-not-allowed disabled:opacity-40 md:static md:mx-auto"
      >
        <IconoCerrar tamano={16} />
      </button>
    </div>
  );
}
