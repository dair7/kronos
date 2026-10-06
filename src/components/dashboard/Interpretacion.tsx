import { Tarjeta } from "../ui/Tarjeta";
import type { Interpretacion as TipoInterpretacion } from "@/lib/calculos";

const ESTILOS = {
  favorable: {
    caja: "border-exito-200 bg-exito-50",
    titular: "text-exito-900",
    marca: "bg-exito-600",
  },
  desfavorable: {
    caja: "border-peligro-200 bg-peligro-50",
    titular: "text-peligro-900",
    marca: "bg-peligro-600",
  },
  neutro: {
    caja: "border-alerta-200 bg-alerta-50",
    titular: "text-alerta-900",
    marca: "bg-alerta-700",
  },
} as const;

/**
 * Tarjeta de interpretacion: traduce los indicadores a una lectura en palabras.
 * El texto lo genera lib/calculos.ts por reglas, no esta escrito a mano.
 */
export function Interpretacion({ interpretacion }: { interpretacion: TipoInterpretacion }) {
  const estilo = ESTILOS[interpretacion.tono];

  return (
    <Tarjeta titulo="Interpretación del resultado">
      <div className={`rounded-lg border px-4 py-3 ${estilo.caja}`}>
        <div className="flex items-start gap-3">
          <span aria-hidden className={`mt-1.5 h-6 w-1 shrink-0 rounded-full ${estilo.marca}`} />
          <p className={`text-base font-semibold leading-snug ${estilo.titular}`}>
            {interpretacion.titular}
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-3 text-sm leading-relaxed text-marino-700">
        {interpretacion.parrafos.map((parrafo, indice) => (
          <p key={indice}>{parrafo}</p>
        ))}
      </div>

      <p className="mt-4 border-t border-borde pt-3 text-xs italic leading-relaxed text-marino-500">
        {interpretacion.cierre}
      </p>
    </Tarjeta>
  );
}
