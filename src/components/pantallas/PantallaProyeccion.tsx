"use client";

import { useState } from "react";
import { useCaso } from "../ProveedorCaso";
import { CeldaNumero } from "../ui/Campo";
import { Boton } from "../ui/Boton";
import { ResumenEnVivo } from "../ui/ResumenEnVivo";
import { CeldaTabla, ContenedorTabla, EncabezadoTabla, FilaTabla, PieTabla } from "../ui/TablaEditable";
import { derivados } from "@/lib/calculos";
import { numero, pesos } from "@/lib/formato";

const PLANTILLA = "md:grid-cols-[6rem_1fr_14rem]";

const NOMBRES_MES = [
  "Mes 1",
  "Mes 2",
  "Mes 3",
  "Mes 4",
  "Mes 5",
  "Mes 6",
  "Mes 7",
  "Mes 8",
  "Mes 9",
  "Mes 10",
  "Mes 11",
  "Mes 12",
];

export function PantallaProyeccion() {
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

  const llenarTodos = () => {
    if (relleno === null) return;
    actualizar((c) => {
      c.proyeccion = c.proyeccion.map(() => relleno);
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-5 lg:col-span-2">
        <div className="flex flex-wrap items-end gap-3 rounded-lg border border-borde bg-marino-50/60 p-3">
          <div className="min-w-0 flex-1">
            <label
              htmlFor="relleno-masivo"
              className="block text-sm font-medium text-marino-800"
            >
              Llenar todos los meses con{" "}
              <span className="font-normal text-marino-500">(clientes/mes)</span>
            </label>
            <input
              id="relleno-masivo"
              type="number"
              min={0}
              inputMode="numeric"
              placeholder="400"
              className="cifra mt-1.5 min-h-11 w-full rounded-lg border border-borde bg-white px-3 py-2 text-sm hover:border-marino-300 focus:border-marino-500 focus:outline-none"
              value={relleno === null ? "" : String(relleno)}
              onChange={(e) =>
                setRelleno(e.target.value === "" ? null : Number(e.target.value) || 0)
              }
            />
          </div>
          <Boton variante="secundario" onClick={llenarTodos} disabled={relleno === null}>
            Aplicar a los 12 meses
          </Boton>
        </div>

        <ContenedorTabla>
          <EncabezadoTabla
            plantilla={PLANTILLA}
            columnas={[
              { titulo: "Mes" },
              { titulo: "Clientes adicionales", alineacion: "derecha" },
              { titulo: "Flujo neto del mes ($)", alineacion: "derecha" },
            ]}
          />
          {caso.proyeccion.map((clientes, indice) => {
            const flujo = flujoDelMes(clientes);
            return (
              <FilaTabla key={indice} plantilla={PLANTILLA}>
                <CeldaTabla etiqueta="Mes">
                  <p className="py-2 text-sm font-medium text-marino-800">
                    {NOMBRES_MES[indice]}
                  </p>
                </CeldaTabla>
                <CeldaTabla etiqueta="Clientes adicionales">
                  <CeldaNumero
                    etiquetaAccesible={`Clientes adicionales proyectados en el mes ${indice + 1}`}
                    valor={clientes}
                    min={0}
                    onChange={(v) => actualizar((c) => void (c.proyeccion[indice] = v))}
                  />
                </CeldaTabla>
                <CeldaTabla etiqueta="Flujo neto del mes ($)" alineacion="derecha">
                  <p
                    className={`cifra py-2 text-sm font-medium ${
                      flujo === null
                        ? "text-marino-400"
                        : flujo < 0
                          ? "text-peligro-700"
                          : "text-marino-900"
                    }`}
                  >
                    {flujo === null ? "Falta el dato" : pesos(flujo)}
                  </p>
                </CeldaTabla>
              </FilaTabla>
            );
          })}
        </ContenedorTabla>

        <PieTabla
          etiqueta="Flujo neto del año 1"
          nota={`${numero(d.clientesAnio1)} clientes adicionales en el año · suma de los 12 meses`}
          valor={pesos(totalAnio1)}
        />
      </div>

      <ResumenEnVivo
        titulo="Referencia de la proyección"
        lineas={[
          {
            etiqueta: "Punto de equilibrio",
            valor: `${numero(d.puntoEquilibrio ?? 0)} clientes/mes`,
            faltante:
              d.puntoEquilibrio === null
                ? "El margen por cliente debe ser mayor que 0"
                : undefined,
            destacado: true,
          },
          {
            etiqueta: "Proyección máxima",
            valor: `${numero(d.proyeccionMaxima)} clientes/mes`,
            faltante: d.proyeccionMaxima > 0 ? undefined : "Falta llenar la proyección",
          },
          {
            etiqueta: "Margen por cliente",
            valor: pesos(d.margen),
            faltante: d.margen !== 0 ? undefined : "Faltan datos del negocio",
          },
          {
            etiqueta: "Costos fijos",
            valor: `${pesos(d.costosFijosMensuales)} /mes`,
          },
        ]}
        pie={
          <>
            Los meses en rojo tienen flujo negativo: todavía no llegan al punto de equilibrio y la
            ampliación se financia con lo que gana el resto del año. Es normal al comienzo, mientras
            la clientela crece.
          </>
        }
      />
    </div>
  );
}
