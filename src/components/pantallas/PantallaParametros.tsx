"use client";

import { useCaso } from "../ProveedorCaso";
import { CampoNumero } from "../ui/Campo";
import { Tarjeta } from "../ui/Tarjeta";

export function PantallaParametros() {
  const { caso, actualizar } = useCaso();
  const { parametros } = caso;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2 lg:content-start">
        <CampoNumero
          etiqueta="Periodo de evaluación"
          unidad="(años)"
          requerido
          min={1}
          paso={1}
          valor={parametros.vidaUtil}
          ayuda="Durante cuántos años se va a analizar el proyecto. Suele coincidir con la vida útil de lo que se compra. Debe ser un número entero entre 1 y 50."
          onChange={(v) => actualizar((c) => void (c.parametros.vidaUtil = v))}
        />
        <CampoNumero
          etiqueta="Tasa de evaluación (TMAR)"
          unidad="(% anual)"
          requerido
          min={0}
          paso={0.1}
          valor={parametros.tasaEvaluacion}
          ayuda="Rentabilidad mínima que el dueño exige a su dinero para que valga la pena invertirlo aquí en vez de en otra alternativa. Con ella se traen los flujos futuros a pesos de hoy."
          onChange={(v) => actualizar((c) => void (c.parametros.tasaEvaluacion = v))}
        />
        <CampoNumero
          etiqueta="Crecimiento anual"
          unidad="(% anual)"
          requerido
          paso={0.1}
          valor={parametros.crecimientoAnual}
          ayuda="Cuánto se espera que crezca cada año el flujo del proyecto respecto al año anterior. Puede ser 0 % si se prefiere un escenario plano."
          onChange={(v) => actualizar((c) => void (c.parametros.crecimientoAnual = v))}
        />
        <CampoNumero
          etiqueta="Valor de salvamento"
          unidad="($)"
          min={0}
          valor={parametros.valorSalvamento}
          ayuda="Lo que se podría recuperar vendiendo los equipos al terminar el periodo evaluado. Se suma al flujo del último año."
          onChange={(v) => actualizar((c) => void (c.parametros.valorSalvamento = v))}
        />
      </div>

      <Tarjeta titulo="Cómo se calcula" className="lg:col-span-1">
        <ol className="space-y-3 text-sm leading-relaxed text-marino-600">
          <li>
            <span className="font-medium text-marino-800">1. Flujo mensual.</span> Cada mes del año
            1 aporta: clientes del mes × margen por cliente − costos fijos mensuales.
          </li>
          <li>
            <span className="font-medium text-marino-800">2. Flujo anual.</span> El año 0 es la
            inversión con signo negativo. El año 1 es la suma de sus 12 meses. Cada año siguiente es
            el año 1 multiplicado por el crecimiento acumulado, y al último se le suma el valor de
            salvamento.
          </li>
          <li>
            <span className="font-medium text-marino-800">3. VPN.</span> Cada flujo se divide entre
            (1 + tasa) elevado al año que le corresponde y se suman todos. Si el total es mayor que
            cero, el proyecto rinde más que la tasa exigida.
          </li>
          <li>
            <span className="font-medium text-marino-800">4. TIR.</span> Es la tasa que haría que el
            VPN fuera exactamente cero. Se halla por aproximaciones sucesivas (bisección).
          </li>
          <li>
            <span className="font-medium text-marino-800">5. Recuperación.</span> Se acumulan los
            flujos mes a mes hasta igualar la inversión, interpolando la fracción del último mes.
          </li>
          <li>
            <span className="font-medium text-marino-800">6. Punto de equilibrio.</span> Costos
            fijos mensuales ÷ margen por cliente, redondeado hacia arriba.
          </li>
        </ol>
        <p className="mt-4 border-t border-borde pt-3 text-xs leading-relaxed text-marino-500">
          Supuesto prudente: se toma el año 1 —que todavía incluye la etapa de arranque— como base
          de todos los años siguientes. El modelo no incluye impuestos, depreciación ni reposición
          de equipos.
        </p>
      </Tarjeta>
    </div>
  );
}
