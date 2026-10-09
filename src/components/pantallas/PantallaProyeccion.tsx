"use client";

import { useState, type ReactNode } from "react";
import { useCaso } from "../ProveedorCaso";
import { CeldaNumero } from "../ui/Campo";
import { Boton } from "../ui/Boton";
import { DisenoPantalla } from "../ui/DisenoPantalla";
import { ResumenEnVivo } from "../ui/ResumenEnVivo";
import { derivados } from "@/lib/calculos";
import { numero, pesos } from "@/lib/formato";

const PLANTILLA = "grid-cols-[3.5rem_6.5rem_1fr] md:grid-cols-[5rem_1fr_12rem]";

export function PantallaProyeccion({ pie }: { pie: ReactNode }) {
  const { caso, actualizar } = useCaso();
  const d = derivados(caso);
  const [relleno, setRelleno] = useState<number | null>(null);

  // Flujo del mes = clientes del mes x margen - costos fijos mensuales.
  const flujoDelMes = (clientes: number | null) =>
    clientes === null ? null : clientes * d.margen - d.costosFijosMensuales;

  const totalAnio1 = caso.proyeccion.reduce<number>(
    (suma, clientes) => suma + (flujoDelMes(clientes) ?? 0),
    0,
  );
  const mesesEnPerdida = caso.proyeccion.filter((c) => (flujoDelMes(c) ?? 0) < 0).length;
  const maximoBarra = Math.max(1, d.proyeccionMaxima, d.puntoEquilibrio ?? 0);

  const llenarTodos = () => {
    if (relleno === null) return;
    actualizar((c) => {
      c.proyeccion = c.proyeccion.map(() => relleno);
    });
  };

  return (
    <DisenoPantalla
      pie={pie}
      formulario={
        <div className="space-y-5">
          <div className="flex flex-wrap items-end gap-3 rounded-2xl bg-fondo p-4">
            <div className="w-full min-w-0 sm:w-auto sm:flex-1">
              <p aria-hidden className="mb-1.5 text-[13px] font-medium text-tenue">
                Llenar los 12 meses con
              </p>
              <CeldaNumero
                etiquetaAccesible="Clientes adicionales para llenar los 12 meses"
                valor={relleno}
                min={0}
                placeholder="Ej.: 300"
                unidad="clientes/mes"
                unidadSingular="cliente/mes"
                alineacion="izquierda"
                onChange={setRelleno}
              />
            </div>
            <Boton variante="secundario" onClick={llenarTodos} disabled={relleno === null}>
              Aplicar a los 12 meses
            </Boton>
          </div>

          {/* Una fila compacta por mes: "Mes 1 | clientes | flujo". La barra delgada
              compara los clientes del mes con el punto de equilibrio: en celular va
              debajo de la fila y desde 768 px al lado del campo. */}
          <div role="table" aria-label="Proyección de clientes adicionales por mes">
            <div
              role="row"
              className={`grid gap-x-3 border-b border-linea pb-2.5 text-[12px] font-medium text-tenue ${PLANTILLA}`}
            >
              <span role="columnheader">Mes</span>
              <span role="columnheader">Clientes adicionales</span>
              <span role="columnheader" className="text-right">
                Flujo neto del mes
              </span>
            </div>
            {caso.proyeccion.map((clientes, indice) => {
              const flujo = flujoDelMes(clientes);
              const barra = (
                <div aria-hidden className="relative h-1.5 flex-1 rounded-full bg-fondo md:h-2">
                  <div
                    className={`h-full rounded-full ${flujo !== null && flujo < 0 ? "bg-contexto" : "bg-positivo"}`}
                    style={{ width: `${Math.min(100, ((clientes ?? 0) / maximoBarra) * 100)}%` }}
                  />
                  {d.puntoEquilibrio !== null && (
                    <span
                      className="absolute -top-1 h-3.5 w-0.5 rounded-full bg-tinta md:h-4"
                      style={{ left: `${(d.puntoEquilibrio / maximoBarra) * 100}%` }}
                    />
                  )}
                </div>
              );
              return (
                <div
                  key={indice}
                  role="row"
                  className={`grid items-center gap-x-3 gap-y-2 border-b border-linea py-2 ${PLANTILLA}`}
                >
                  <p role="cell" className="text-sm font-semibold whitespace-nowrap">
                    Mes {indice + 1}
                  </p>
                  <div role="cell" className="flex items-center gap-3">
                    <div className="w-full md:w-36 md:shrink-0">
                      <CeldaNumero
                        etiquetaAccesible={`Clientes adicionales proyectados en el mes ${indice + 1}`}
                        valor={clientes}
                        min={0}
                        onChange={(v) => actualizar((c) => void (c.proyeccion[indice] = v))}
                      />
                    </div>
                    <div className="hidden flex-1 md:flex">{barra}</div>
                  </div>
                  <p
                    role="cell"
                    className={`cifra text-right text-sm font-semibold whitespace-nowrap ${
                      flujo === null ? "text-tenue" : flujo < 0 ? "text-negativo" : ""
                    }`}
                  >
                    {flujo === null ? "Falta el dato" : pesos(flujo)}
                  </p>
                  <div className="col-span-3 flex pb-1 md:hidden">{barra}</div>
                </div>
              );
            })}
          </div>
          <p className="text-[12px] text-tenue">
            La raya negra de cada barra marca el punto de equilibrio
            {d.puntoEquilibrio !== null ? ` (${numero(d.puntoEquilibrio)} clientes/mes)` : ""}: los
            meses por debajo cierran en negativo.
          </p>
        </div>
      }
      calculados={
        <ResumenEnVivo
          heroe={{
            etiqueta: "Flujo neto del año 1",
            valor: pesos(totalAnio1),
            signo: totalAnio1 < 0 ? "negativo" : undefined,
          }}
          lineas={[
            {
              etiqueta: "Punto de equilibrio",
              valor: `${numero(d.puntoEquilibrio ?? 0)} clientes/mes`,
              faltante:
                d.puntoEquilibrio === null ? "El margen por cliente debe ser mayor que 0" : undefined,
            },
            {
              etiqueta: "Proyección máxima",
              valor: `${numero(d.proyeccionMaxima)} clientes/mes`,
              faltante: d.proyeccionMaxima > 0 ? undefined : "Falta llenar la proyección",
            },
            { etiqueta: "Clientes adicionales del año", valor: numero(d.clientesAnio1) },
            {
              etiqueta: "Meses en negativo",
              valor: `${numero(mesesEnPerdida)} de 12`,
              signo: mesesEnPerdida > 0 ? "negativo" : undefined,
            },
          ]}
          pie={
            <>
              Cada mes aporta clientes × margen − costos fijos. Es normal que los primeros meses
              cierren en negativo mientras la clientela crece.
            </>
          }
        />
      }
    />
  );
}
