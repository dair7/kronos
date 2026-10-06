import type { ReactNode } from "react";

type Tono = "neutro" | "favorable" | "desfavorable" | "acento";

const TONOS: Record<Tono, { valor: string; borde: string }> = {
  neutro: { valor: "text-marino-900", borde: "border-t-marino-300" },
  favorable: { valor: "text-exito-700", borde: "border-t-exito-600" },
  desfavorable: { valor: "text-peligro-700", borde: "border-t-peligro-600" },
  acento: { valor: "text-marino-900", borde: "border-t-dorado-400" },
};

interface PropsKpi {
  etiqueta: string;
  /** Unidad visible: ($), (% anual), (clientes/mes)… la guia la exige. */
  unidad?: string;
  valor: string;
  nota?: ReactNode;
  tono?: Tono;
}

/** Indicador principal del dashboard. */
export function Kpi({ etiqueta, unidad, valor, nota, tono = "neutro" }: PropsKpi) {
  const estilo = TONOS[tono];
  return (
    <div
      className={`flex flex-col rounded-xl border border-borde border-t-4 ${estilo.borde} bg-superficie p-3 shadow-sm tarjeta-impresion evitar-corte sm:p-4`}
    >
      <p className="text-[0.7rem] font-medium uppercase tracking-wide text-marino-500">
        {etiqueta}
        {unidad && <span className="normal-case"> {unidad}</span>}
      </p>
      <p className={`cifra mt-1.5 text-lg font-semibold leading-tight sm:text-xl ${estilo.valor}`}>
        {valor}
      </p>
      {nota && <p className="mt-1 text-xs leading-snug text-marino-500">{nota}</p>}
    </div>
  );
}

/**
 * Rejilla de KPIs: 2 columnas en celular, 3 en tablet y 6 en computador,
 * tal como pide el requisito de diseno responsive.
 */
export function RejillaKpi({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">{children}</div>
  );
}
