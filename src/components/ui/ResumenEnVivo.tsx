import type { ReactNode } from "react";

interface Linea {
  etiqueta: string;
  valor: string;
  /** Texto que se muestra cuando todavia falta el dato de origen. */
  faltante?: string;
  destacado?: boolean;
}

/**
 * Panel de calculos en vivo que acompana a cada pantalla de captura: muestra
 * lo que el software va deduciendo de los datos escritos. Si falta un dato,
 * dice cual falta en lugar de mostrar un cero enganoso.
 */
export function ResumenEnVivo({
  titulo,
  lineas,
  pie,
}: {
  titulo: string;
  lineas: Linea[];
  pie?: ReactNode;
}) {
  return (
    <aside className="rounded-xl border border-marino-200 bg-marino-50 p-4">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-marino-600">{titulo}</h3>
      <dl className="mt-3 space-y-2.5">
        {lineas.map((linea) => (
          <div
            key={linea.etiqueta}
            className={`flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 ${
              linea.destacado ? "border-t border-marino-200 pt-2.5" : ""
            }`}
          >
            <dt className="text-sm text-marino-600">{linea.etiqueta}</dt>
            {linea.faltante ? (
              <dd className="text-xs italic text-marino-400">{linea.faltante}</dd>
            ) : (
              <dd
                className={`cifra text-sm ${
                  linea.destacado ? "font-semibold text-marino-900" : "font-medium text-marino-800"
                }`}
              >
                {linea.valor}
              </dd>
            )}
          </div>
        ))}
      </dl>
      {pie && <div className="mt-3 text-xs leading-relaxed text-marino-500">{pie}</div>}
    </aside>
  );
}
