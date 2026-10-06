"use client";

import { useCaso } from "../ProveedorCaso";
import { CampoNumero, CampoTexto } from "../ui/Campo";
import { Aviso } from "../ui/Aviso";
import { Nota, Tarjeta } from "../ui/Tarjeta";
import { GraficaAcumuladoEscenarios, GraficaVpnEscenarios } from "./Graficas";
import { evaluarEscenario, type ResultadoEscenario } from "@/lib/calculos";
import type { Caso } from "@/lib/datos";
import { meses, numero, pesos, porcentaje } from "@/lib/formato";

export function PestanaEscenarios({ caso, equilibrio }: { caso: Caso; equilibrio: number | null }) {
  const { actualizar } = useCaso();

  const resultados = caso.escenarios
    .map((escenario) =>
      escenario.clientes === null
        ? null
        : evaluarEscenario(caso, escenario.nombre || "Escenario", escenario.clientes),
    )
    .filter((r): r is ResultadoEscenario => r !== null);

  return (
    <div className="space-y-6">
      {/* Recuadros editables */}
      <Tarjeta
        titulo="Escenarios por comparar"
        descripcion="Cada escenario conserva la misma curva de crecimiento de la proyección, reescalada a la cantidad de clientes que alcanzaría a capacidad plena."
      >
        <div className="grid gap-4 md:grid-cols-3">
          {caso.escenarios.map((escenario, indice) => (
            <div key={escenario.id} className="space-y-3 rounded-lg border border-borde p-4">
              <CampoTexto
                etiqueta={`Escenario ${indice + 1}`}
                valor={escenario.nombre}
                placeholder="A — Conservador"
                onChange={(v) => actualizar((c) => void (c.escenarios[indice].nombre = v))}
              />
              <CampoNumero
                etiqueta="Clientes a capacidad plena"
                unidad="(clientes/mes)"
                min={0}
                valor={escenario.clientes}
                onChange={(v) => actualizar((c) => void (c.escenarios[indice].clientes = v))}
              />
            </div>
          ))}
        </div>
        <Nota>
          KRONOS no señala un escenario ganador: muestra los resultados de cada uno para que la
          decisión la tome quien conoce el negocio.
        </Nota>
      </Tarjeta>

      {resultados.length === 0 ? (
        <Aviso tono="alerta" titulo="Faltan los clientes de los escenarios">
          Escriba, en al menos un escenario, cuántos clientes adicionales atendería el negocio al
          mes una vez la ampliación esté funcionando a capacidad plena.
        </Aviso>
      ) : (
        <>
          <TablaComparativa resultados={resultados} equilibrio={equilibrio} />

          <div className="grid gap-6 xl:grid-cols-2">
            <GraficaVpnEscenarios escenarios={resultados} />
            <GraficaAcumuladoEscenarios escenarios={resultados} />
          </div>

          <Tarjeta
            titulo="Lectura de cada escenario"
            descripcion="Qué dice cada conjunto de cifras, en palabras."
          >
            <div className="space-y-4">
              {resultados.map((resultado) => (
                <article
                  key={resultado.nombre}
                  className="border-l-2 border-dorado-300 pl-3 text-sm leading-relaxed text-marino-700"
                >
                  <h3 className="font-semibold text-marino-900">{resultado.nombre}</h3>
                  <p className="mt-1">{lecturaEscenario(resultado, equilibrio)}</p>
                </article>
              ))}
            </div>
          </Tarjeta>
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------

function TablaComparativa({
  resultados,
  equilibrio,
}: {
  resultados: ResultadoEscenario[];
  equilibrio: number | null;
}) {
  const filas: { etiqueta: string; valor: (r: ResultadoEscenario) => string; destacar?: boolean }[] =
    [
      {
        etiqueta: "Clientes adicionales (clientes/mes)",
        valor: (r) => numero(r.clientes),
      },
      {
        etiqueta: "Frente al punto de equilibrio",
        valor: (r) =>
          r.distanciaEquilibrio === null
            ? "No aplica"
            : r.distanciaEquilibrio >= 0
              ? `${numero(r.distanciaEquilibrio)} por encima`
              : `${numero(Math.abs(r.distanciaEquilibrio))} por debajo`,
      },
      { etiqueta: "Ingresos adicionales año 1 ($)", valor: (r) => pesos(r.ingresosAnio1) },
      { etiqueta: "Costos adicionales año 1 ($)", valor: (r) => pesos(r.costosAnio1) },
      { etiqueta: "Flujo neto año 1 ($)", valor: (r) => pesos(r.flujoAnio1) },
      { etiqueta: "VPN ($ de hoy)", valor: (r) => pesos(r.vpn), destacar: true },
      {
        etiqueta: "TIR (% anual)",
        valor: (r) => (r.tir === null ? "No existe" : porcentaje(r.tir * 100)),
      },
      {
        etiqueta: "Recuperación de la inversión",
        valor: (r) => meses(r.recuperacionMeses),
      },
    ];

  return (
    <Tarjeta
      titulo="Comparación de escenarios"
      descripcion={
        equilibrio === null
          ? undefined
          : `El punto de equilibrio del proyecto es de ${numero(equilibrio)} clientes adicionales al mes.`
      }
    >
      <div className="desplazable-x -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <table className="w-full min-w-[34rem] border-collapse text-sm">
          <caption className="sr-only">
            Indicadores económicos obtenidos en cada escenario de clientes
          </caption>
          <thead>
            <tr className="border-b border-borde">
              <th scope="col" className="py-2 pr-3 text-left text-xs uppercase tracking-wide text-marino-500">
                Indicador
              </th>
              {resultados.map((resultado) => (
                <th
                  key={resultado.nombre}
                  scope="col"
                  className="py-2 px-3 text-right text-xs font-semibold text-marino-800"
                >
                  {resultado.nombre}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filas.map((fila) => (
              <tr
                key={fila.etiqueta}
                className={`border-b border-borde/70 ${fila.destacar ? "bg-marino-50" : ""}`}
              >
                <th
                  scope="row"
                  className="py-2 pr-3 text-left font-medium text-marino-700"
                >
                  {fila.etiqueta}
                </th>
                {resultados.map((resultado) => {
                  const texto = fila.valor(resultado);
                  const negativo =
                    texto.includes("-") || texto === "No existe" || texto.startsWith("No se");
                  return (
                    <td
                      key={resultado.nombre}
                      className={`cifra py-2 px-3 text-right ${
                        fila.destacar ? "font-semibold" : ""
                      } ${negativo ? "text-peligro-700" : "text-marino-900"}`}
                    >
                      {texto}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Nota>
        Todos los escenarios usan la misma inversión, los mismos costos y los mismos parámetros: lo
        único que cambia es cuántos clientes adicionales se alcanzan a atender al mes.
      </Nota>
    </Tarjeta>
  );
}

// ---------------------------------------------------------------------------

/** Convierte los indicadores de un escenario en una lectura en palabras. */
function lecturaEscenario(resultado: ResultadoEscenario, equilibrio: number | null): string {
  const partes: string[] = [];

  if (equilibrio !== null && resultado.distanciaEquilibrio !== null) {
    partes.push(
      resultado.sobreEquilibrio
        ? `Con ${numero(resultado.clientes)} clientes adicionales al mes el proyecto opera ${numero(resultado.distanciaEquilibrio)} clientes por encima del punto de equilibrio de ${numero(equilibrio)}.`
        : `Con ${numero(resultado.clientes)} clientes adicionales al mes el proyecto se queda ${numero(Math.abs(resultado.distanciaEquilibrio))} clientes por debajo del punto de equilibrio de ${numero(equilibrio)}, de modo que la operación no alcanza a cubrir sus costos fijos.`,
    );
  } else {
    partes.push(`Escenario con ${numero(resultado.clientes)} clientes adicionales al mes.`);
  }

  if (resultado.vpn >= 0) {
    partes.push(
      `El VPN es de ${pesos(resultado.vpn)} y el flujo del año 1, de ${pesos(resultado.flujoAnio1)}.`,
    );
  } else {
    partes.push(
      `El VPN es de ${pesos(resultado.vpn)} —negativo— y el flujo del año 1 es de ${pesos(resultado.flujoAnio1)}.`,
    );
  }

  if (resultado.tir === null) {
    partes.push(
      "No existe TIR porque los flujos nunca cambian de signo: el proyecto no llega a generar dinero que compense la inversión.",
    );
  } else {
    partes.push(`La TIR es de ${porcentaje(resultado.tir * 100)}.`);
  }

  partes.push(
    resultado.recuperacionMeses === null
      ? "La inversión no se recupera dentro del periodo evaluado."
      : `La inversión se recupera en ${meses(resultado.recuperacionMeses)}.`,
  );

  return partes.join(" ");
}
