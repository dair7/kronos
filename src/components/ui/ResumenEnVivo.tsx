import type { ReactNode } from "react";

interface Linea {
  etiqueta: string;
  valor: string;
  /** Texto que se muestra cuando todavia falta el dato de origen. */
  faltante?: string;
  destacado?: boolean;
  /** Pinta la cifra en rojo (negativa) o verde (positiva). */
  signo?: "positivo" | "negativo";
}

interface Heroe {
  etiqueta: string;
  valor: string;
  unidad?: string;
  faltante?: string;
  signo?: "positivo" | "negativo";
}

const COLOR_SIGNO = {
  positivo: "text-positivo-texto",
  negativo: "text-negativo",
} as const;

/** Separa el signo de pesos para mostrarlo mas pequeno que la cifra. */
export function CifraPesos({ texto, claseSimbolo }: { texto: string; claseSimbolo?: string }) {
  const coincidencia = texto.match(/^(-?)\$\s?(.*)$/u);
  if (!coincidencia) return <>{texto}</>;
  return (
    <>
      {coincidencia[1]}
      <span className={claseSimbolo ?? "mr-0.5 align-[0.35em] text-[0.5em]"}>$</span>
      {coincidencia[2]}
    </>
  );
}

/**
 * Tarjeta "Valores calculados" que acompana cada pantalla de captura: muestra
 * en vivo lo que KRONOS va deduciendo de los datos escritos, con un numero
 * heroe arriba. Si falta un dato, dice cual falta en lugar de mostrar un cero.
 */
export function ResumenEnVivo({
  titulo = "Valores calculados",
  heroe,
  lineas,
  pie,
  children,
}: {
  titulo?: string;
  heroe?: Heroe;
  lineas: Linea[];
  pie?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <aside
      aria-label={titulo}
      className="flex flex-col rounded-tarjeta bg-tarjeta p-5 shadow-tarjeta sm:p-6"
    >
      <div className="flex items-center gap-2">
        <span aria-hidden className="size-1.5 rounded-full bg-positivo" />
        <h2 className="text-[15px] font-semibold">{titulo}</h2>
        <span className="ml-auto text-[12px] font-medium text-tenue">en vivo</span>
      </div>

      {heroe && (
        <div className="mt-5">
          <p className="text-[13px] font-medium text-tenue">{heroe.etiqueta}</p>
          {heroe.faltante ? (
            <p className="mt-2 text-sm text-tenue italic">{heroe.faltante}</p>
          ) : (
            <p
              className={`cifra mt-1 text-[40px] leading-[1.05] font-bold sm:text-[44px] ${heroe.signo ? COLOR_SIGNO[heroe.signo] : ""}`}
            >
              <CifraPesos texto={heroe.valor} />
              {heroe.unidad && (
                <span className="ml-1.5 text-[15px] font-semibold tracking-normal text-tenue">
                  {heroe.unidad}
                </span>
              )}
            </p>
          )}
        </div>
      )}

      <dl className={heroe ? "mt-5 border-t border-linea pt-2" : "mt-4"}>
        {lineas.map((linea) => (
          <div
            key={linea.etiqueta}
            className={`flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 py-2.5 ${
              linea.destacado ? "mt-1 border-t border-linea pt-3.5" : ""
            }`}
          >
            <dt className="text-[13px] font-medium text-tenue">{linea.etiqueta}</dt>
            {linea.faltante ? (
              <dd className="text-[12px] text-tenue italic">{linea.faltante}</dd>
            ) : (
              <dd
                className={`cifra text-sm ${linea.destacado ? "font-bold" : "font-semibold"} ${
                  linea.signo ? COLOR_SIGNO[linea.signo] : ""
                }`}
              >
                {linea.valor}
              </dd>
            )}
          </div>
        ))}
      </dl>

      {children}

      {pie && (
        <div className="mt-4 rounded-2xl bg-fondo p-3.5 text-[12px] leading-relaxed text-tenue">
          {pie}
        </div>
      )}
    </aside>
  );
}
