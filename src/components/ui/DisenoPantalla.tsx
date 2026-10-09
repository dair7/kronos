import type { ReactNode } from "react";

/**
 * Distribucion de cada pantalla de captura: el formulario en una tarjeta a la
 * izquierda (8 columnas) y, a la derecha (4 columnas), la tarjeta de valores
 * calculados en vivo. Por debajo de 1280 px se apilan en este orden:
 * formulario, valores calculados y, al final, los botones Anterior/Siguiente.
 */
export function DisenoPantalla({
  formulario,
  calculados,
  pie,
}: {
  formulario: ReactNode;
  calculados: ReactNode;
  /** Botones Anterior / Siguiente, abajo a la derecha del formulario. */
  pie?: ReactNode;
}) {
  return (
    <div className="grid items-start gap-4 xl:grid-cols-12">
      <section className="min-w-0 rounded-tarjeta bg-tarjeta p-5 shadow-tarjeta sm:p-6 xl:col-span-8">
        {formulario}
      </section>
      <div className="min-w-0 space-y-4 xl:sticky xl:top-5 xl:col-span-4 xl:col-start-9 xl:row-span-2 xl:row-start-1">
        {calculados}
      </div>
      {pie && <div className="min-w-0 xl:col-span-8">{pie}</div>}
    </div>
  );
}

/** Subtitulo de una seccion dentro del formulario. */
export function SeccionFormulario({
  titulo,
  descripcion,
  children,
  className,
}: {
  titulo: string;
  descripcion?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={className}>
      <h3 className="text-[15px] font-semibold">{titulo}</h3>
      {descripcion && <p className="mt-1 text-[13px] leading-relaxed text-tenue">{descripcion}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}
