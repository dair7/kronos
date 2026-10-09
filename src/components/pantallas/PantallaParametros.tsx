"use client";

import type { ReactNode } from "react";
import { useCaso } from "../ProveedorCaso";
import { CampoNumero } from "../ui/Campo";
import { DisenoPantalla } from "../ui/DisenoPantalla";
import { ResumenEnVivo } from "../ui/ResumenEnVivo";
import { evaluar, validar } from "@/lib/calculos";
import { meses, pesos, porcentaje } from "@/lib/formato";

const METODO = [
  ["Flujo mensual", "Cada mes del año 1 aporta clientes × margen − costos fijos."],
  [
    "Flujo anual",
    "El año 0 es la inversión, en negativo. El año 1 suma sus 12 meses; cada año siguiente aplica el crecimiento y el último suma el salvamento.",
  ],
  ["VPN", "Cada flujo se divide entre (1 + tasa)^año y se suman todos."],
  ["TIR", "La tasa que hace el VPN exactamente cero, hallada por bisección."],
  ["Recuperación", "Se acumulan los flujos mes a mes hasta igualar la inversión."],
  ["Punto de equilibrio", "Costos fijos ÷ margen por cliente, redondeado hacia arriba."],
] as const;

export function PantallaParametros({ pie }: { pie: ReactNode }) {
  const { caso, actualizar } = useCaso();
  const { parametros } = caso;

  // Con el caso completo, la tarjeta en vivo muestra el VPN que resulta de los
  // parametros que se estan escribiendo.
  const completo = validar(caso).length === 0;
  const resultado = completo ? evaluar(caso) : null;

  return (
    <DisenoPantalla
      pie={pie}
      formulario={
        <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
          <CampoNumero
            etiqueta="Periodo de evaluación"
            unidad="años"
            unidadSingular="año"
            placeholder="Ej.: 10"
            requerido
            min={1}
            paso={1}
            valor={parametros.vidaUtil}
            ayuda="Suele coincidir con la vida útil de lo que se compra. Entero entre 1 y 50."
            onChange={(v) => actualizar((c) => void (c.parametros.vidaUtil = v))}
          />
          <CampoNumero
            etiqueta="Tasa de evaluación (TMAR)"
            unidad="% anual"
            placeholder="Ej.: 20"
            requerido
            min={0}
            paso={0.1}
            valor={parametros.tasaEvaluacion}
            ayuda="Rentabilidad mínima que el dueño exige a su dinero. Trae los flujos futuros a pesos de hoy."
            onChange={(v) => actualizar((c) => void (c.parametros.tasaEvaluacion = v))}
          />
          <CampoNumero
            etiqueta="Crecimiento anual"
            unidad="% anual"
            placeholder="Ej.: 3"
            requerido
            paso={0.1}
            valor={parametros.crecimientoAnual}
            ayuda="Cuánto crece cada año el flujo frente al anterior. Puede ser 0 %."
            onChange={(v) => actualizar((c) => void (c.parametros.crecimientoAnual = v))}
          />
          <CampoNumero
            etiqueta="Valor de salvamento"
            unidad="$"
            placeholder="Ej.: 500.000"
            min={0}
            valor={parametros.valorSalvamento}
            ayuda="Lo que se recuperaría vendiendo los equipos al final. Se suma al último año."
            onChange={(v) => actualizar((c) => void (c.parametros.valorSalvamento = v))}
          />
        </div>
      }
      calculados={
        <ResumenEnVivo
          heroe={{
            etiqueta: "VPN con estos parámetros",
            valor: pesos(resultado?.vpn),
            faltante: resultado ? undefined : "Complete los pasos anteriores para ver el VPN",
            signo: resultado ? (resultado.vpn < 0 ? "negativo" : "positivo") : undefined,
          }}
          lineas={[
            {
              etiqueta: "TIR",
              valor: resultado?.tir == null ? "No existe" : porcentaje(resultado.tir * 100),
              faltante: resultado ? undefined : "—",
            },
            {
              etiqueta: "Recuperación simple",
              valor: meses(resultado?.recuperacionMeses),
              faltante: resultado ? undefined : "—",
            },
          ]}
        >
          <details className="group mt-3 border-t border-linea pt-3">
            <summary className="flex cursor-pointer list-none items-center justify-between text-[13px] font-semibold">
              Cómo se calcula
              <span aria-hidden className="text-tenue transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <dl className="mt-3 space-y-2.5">
              {METODO.map(([titulo, texto]) => (
                <div key={titulo}>
                  <dt className="text-[13px] font-semibold">{titulo}</dt>
                  <dd className="text-[12px] leading-relaxed text-tenue">{texto}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-[12px] leading-relaxed text-tenue">
              Supuesto prudente: el año 1, que incluye el arranque, es la base de los siguientes.
              Sin impuestos, depreciación ni reposición de equipos.
            </p>
          </details>
        </ResumenEnVivo>
      }
    />
  );
}
