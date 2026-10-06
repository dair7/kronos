import type { ReactNode } from "react";

interface PropsTarjeta {
  titulo?: ReactNode;
  descripcion?: ReactNode;
  acciones?: ReactNode;
  children: ReactNode;
  className?: string;
}

/** Contenedor estandar de contenido. Toda seccion del software usa esta tarjeta. */
export function Tarjeta({ titulo, descripcion, acciones, children, className }: PropsTarjeta) {
  return (
    <section
      className={[
        "rounded-xl border border-borde bg-superficie shadow-sm tarjeta-impresion evitar-corte",
        className ?? "",
      ].join(" ")}
    >
      {(titulo || acciones) && (
        <header className="flex flex-col gap-3 border-b border-borde px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-6">
          <div className="min-w-0">
            {titulo && (
              <h2 className="text-base font-semibold text-marino-900 sm:text-lg">{titulo}</h2>
            )}
            {descripcion && (
              <p className="mt-1 text-sm leading-relaxed text-marino-600">{descripcion}</p>
            )}
          </div>
          {acciones && <div className="flex shrink-0 flex-wrap gap-2">{acciones}</div>}
        </header>
      )}
      <div className="px-4 py-4 sm:px-6 sm:py-5">{children}</div>
    </section>
  );
}

/** Bloque de texto explicativo dentro de una tarjeta (notas "como se lee"). */
export function Nota({ children }: { children: ReactNode }) {
  return (
    <p className="mt-3 border-l-2 border-dorado-300 pl-3 text-xs leading-relaxed text-marino-600">
      {children}
    </p>
  );
}
