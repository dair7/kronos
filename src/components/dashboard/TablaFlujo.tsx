import { Nota, Tarjeta } from "../ui/Tarjeta";
import { numero, pesos } from "@/lib/formato";
import type { Resultado } from "@/lib/calculos";

/**
 * Tabla de flujo de caja descontado. En pantallas estrechas se desplaza
 * horizontalmente DENTRO de su contenedor, sin arrastrar la pagina.
 */
export function TablaFlujo({ resultado, tasa }: { resultado: Resultado; tasa: number }) {
  return (
    <Tarjeta
      titulo="Flujo de caja descontado"
      descripcion={`Cada flujo anual traído a pesos de hoy con una tasa del ${numero(tasa, 1)} % anual.`}
    >
      <div className="desplazable-x -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <table className="w-full min-w-[34rem] border-collapse text-sm">
          <caption className="sr-only">
            Flujo de caja por año, factor de descuento, valor presente y valor presente acumulado
          </caption>
          <thead>
            <tr className="border-b border-borde text-xs uppercase tracking-wide text-marino-500">
              <th scope="col" className="py-2 pr-3 text-left font-medium">
                Año
              </th>
              <th scope="col" className="py-2 px-3 text-right font-medium">
                Flujo de caja ($)
              </th>
              <th scope="col" className="py-2 px-3 text-right font-medium">
                Factor de descuento
              </th>
              <th scope="col" className="py-2 px-3 text-right font-medium">
                Valor presente ($)
              </th>
              <th scope="col" className="py-2 pl-3 text-right font-medium">
                Acumulado ($)
              </th>
            </tr>
          </thead>
          <tbody>
            {resultado.tablaFlujo.map((fila) => (
              <tr key={fila.anio} className="border-b border-borde/70">
                <th scope="row" className="py-2 pr-3 text-left font-medium text-marino-800">
                  {fila.anio}
                </th>
                <td
                  className={`cifra py-2 px-3 text-right ${
                    fila.flujo < 0 ? "text-peligro-700" : "text-marino-800"
                  }`}
                >
                  {pesos(fila.flujo)}
                </td>
                <td className="cifra py-2 px-3 text-right text-marino-600">
                  {numero(fila.factorDescuento, 4)}
                </td>
                <td
                  className={`cifra py-2 px-3 text-right ${
                    fila.valorPresente < 0 ? "text-peligro-700" : "text-marino-800"
                  }`}
                >
                  {pesos(fila.valorPresente)}
                </td>
                <td
                  className={`cifra py-2 pl-3 text-right font-medium ${
                    fila.acumulado < 0 ? "text-peligro-700" : "text-marino-900"
                  }`}
                >
                  {pesos(fila.acumulado)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-marino-900 text-white">
              <th scope="row" colSpan={4} className="py-3 pr-3 pl-3 text-left font-semibold">
                Valor Presente Neto (VPN)
              </th>
              <td className="cifra py-3 pl-3 pr-3 text-right text-base font-semibold text-dorado-300">
                {pesos(resultado.vpn)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
      <Nota>
        El factor de descuento es 1 ÷ (1 + tasa)<sup>año</sup>: convierte un peso de ese año en pesos
        de hoy. El VPN es la suma de la columna de valor presente, incluido el año 0.
      </Nota>
    </Tarjeta>
  );
}
