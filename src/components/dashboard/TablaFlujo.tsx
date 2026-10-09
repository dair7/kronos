import { Tarjeta } from "../ui/Tarjeta";
import { numero, pesos } from "@/lib/formato";
import type { Resultado } from "@/lib/calculos";

const CELDA = "h-12 px-3 text-right whitespace-nowrap";

/**
 * Tabla de flujo de caja descontado: sin bordes verticales, filas de 48 px,
 * negativos en rojo y la franja final del VPN destacada. En pantallas estrechas
 * la tabla se desplaza horizontalmente DENTRO de su tarjeta con la columna
 * "Ano" fija; la franja del VPN queda fuera del desplazamiento, siempre visible.
 */
export function TablaFlujo({
  resultado,
  tasa,
  className,
}: {
  resultado: Resultado;
  tasa: number;
  className?: string;
}) {
  const color = (valor: number) => (valor < 0 ? "text-negativo" : "");

  return (
    <Tarjeta
      titulo="Flujo de caja descontado"
      descripcion={`Cada flujo anual traído a pesos de hoy al ${numero(tasa, 1)} % anual`}
      className={className}
    >
      <p aria-hidden className="mb-2 text-right text-[12px] font-medium text-tenue sm:hidden">
        Desliza →
      </p>
      <div className="desplazable-x overflow-x-auto">
        <table className="w-full min-w-[36rem] border-separate border-spacing-0 text-sm">
          <caption className="sr-only">
            Flujo de caja por año, factor de descuento, valor presente y valor presente acumulado
          </caption>
          <thead>
            <tr className="text-[12px] font-medium text-tenue">
              <th
                scope="col"
                className="sticky left-0 z-10 h-10 rounded-l-xl bg-fondo pl-4 text-left font-medium"
              >
                Año
              </th>
              <th scope="col" className="h-10 bg-fondo px-3 text-right font-medium">
                Flujo de caja
              </th>
              <th scope="col" className="h-10 bg-fondo px-3 text-right font-medium">
                Factor
              </th>
              <th scope="col" className="h-10 bg-fondo px-3 text-right font-medium">
                Valor presente
              </th>
              <th scope="col" className="h-10 rounded-r-xl bg-fondo pr-4 pl-3 text-right font-medium">
                Acumulado
              </th>
            </tr>
          </thead>
          <tbody className="cifra">
            {resultado.tablaFlujo.map((fila) => (
              <tr key={fila.anio} className="[&>*]:border-b [&>*]:border-linea">
                <th
                  scope="row"
                  className="sticky left-0 z-10 h-12 bg-tarjeta pr-3 pl-4 text-left font-semibold shadow-[6px_0_6px_-6px_rgba(0,0,0,0.12)] sm:shadow-none"
                >
                  {fila.anio}
                </th>
                <td className={`${CELDA} font-semibold ${color(fila.flujo)}`}>{pesos(fila.flujo)}</td>
                <td className={`${CELDA} text-tenue`}>{numero(fila.factorDescuento, 4)}</td>
                <td className={`${CELDA} ${color(fila.valorPresente)}`}>{pesos(fila.valorPresente)}</td>
                <td className={`${CELDA} pr-4 font-semibold ${color(fila.acumulado)}`}>
                  {pesos(fila.acumulado)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Franja del VPN fuera del area desplazable: la cifra siempre se ve */}
      <div className="mt-2 flex min-h-14 items-center justify-between gap-3 rounded-2xl bg-tinta px-4 py-3 text-white">
        <p className="text-sm font-semibold">Valor presente neto (VPN)</p>
        <p
          className={`cifra text-[17px] font-bold whitespace-nowrap ${
            resultado.vpn < 0 ? "text-[#f87171]" : ""
          }`}
        >
          {pesos(resultado.vpn)}
        </p>
      </div>
      <p className="mt-3 text-[12px] leading-relaxed text-tenue">
        Factor = 1 ÷ (1 + tasa)<sup>año</sup>. El VPN es la suma de la columna de valor presente,
        incluido el año 0.
      </p>
    </Tarjeta>
  );
}
