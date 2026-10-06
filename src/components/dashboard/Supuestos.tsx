import { Tarjeta } from "../ui/Tarjeta";
import { numero, pesos, pesosDecimales, porcentaje } from "@/lib/formato";
import type { Caso } from "@/lib/datos";
import type { Resultado } from "@/lib/calculos";

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="border-b border-borde/70 py-2">
      <dt className="text-xs text-marino-500">{etiqueta}</dt>
      <dd className="cifra mt-0.5 text-sm font-medium text-marino-900">{valor}</dd>
    </div>
  );
}

/**
 * Supuestos del escenario. La guia del TCC exige que las tasas, periodos y
 * demas hipotesis esten visibles junto a los resultados, no escondidas en la
 * documentacion.
 */
export function Supuestos({ caso, resultado }: { caso: Caso; resultado: Resultado }) {
  const d = resultado.derivados;
  const serviciosConPrecio = caso.servicios.filter(
    (servicio) => servicio.nombre.trim() !== "" && typeof servicio.precio === "number",
  );

  return (
    <Tarjeta
      titulo="Supuestos del escenario"
      descripcion="Todos los parámetros con los que se calcularon los indicadores de arriba."
    >
      <dl className="grid gap-x-6 sm:grid-cols-2 lg:grid-cols-3">
        <Dato etiqueta="Tasa de evaluación (TMAR)" valor={porcentaje(caso.parametros.tasaEvaluacion ?? 0)} />
        <Dato
          etiqueta="Horizonte de evaluación"
          valor={`${numero(caso.parametros.vidaUtil ?? 0)} años`}
        />
        <Dato
          etiqueta="Crecimiento anual del flujo"
          valor={porcentaje(caso.parametros.crecimientoAnual ?? 0)}
        />
        <Dato etiqueta="Valor de salvamento" valor={pesos(caso.parametros.valorSalvamento ?? 0)} />
        <Dato etiqueta="Ingreso promedio por cliente" valor={pesosDecimales(d.ingresoPromedio)} />
        <Dato etiqueta="Costo variable por cliente" valor={pesosDecimales(d.costoVariable)} />
        <Dato etiqueta="Margen por cliente" valor={pesosDecimales(d.margen)} />
        <Dato
          etiqueta="Costos fijos adicionales"
          valor={`${pesos(d.costosFijosMensuales)} /mes`}
        />
        <Dato
          etiqueta="Prestaciones sobre salarios"
          valor={porcentaje(caso.personal.porcentajePrestaciones ?? 0)}
        />
        <Dato
          etiqueta="Clientes actuales"
          valor={`${numero(caso.negocio.clientesActuales ?? 0)} clientes/mes`}
        />
        <Dato
          etiqueta="Clientes adicionales a capacidad plena"
          valor={`${numero(d.proyeccionMaxima)} clientes/mes`}
        />
        <Dato
          etiqueta="Clientes adicionales del año 1"
          valor={`${numero(d.clientesAnio1)} clientes`}
        />
      </dl>

      {serviciosConPrecio.length > 0 && (
        <div className="mt-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-marino-500">
            Catálogo de servicios del negocio
          </h3>
          <ul className="mt-2 flex flex-wrap gap-2">
            {serviciosConPrecio.map((servicio) => (
              <li
                key={servicio.id}
                className="rounded-full border border-borde bg-marino-50 px-3 py-1 text-xs text-marino-700"
              >
                {servicio.nombre}:{" "}
                <span className="cifra font-medium">{pesos(servicio.precio as number)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs leading-relaxed text-marino-500">
            El catálogo es información de contexto y no entra en los cálculos: el ingreso promedio
            por cliente sale de dividir los ingresos reales del mes entre los clientes del mes.
          </p>
        </div>
      )}

      <div className="mt-4 rounded-lg border border-borde bg-marino-50 p-3 text-xs leading-relaxed text-marino-600">
        <p className="font-semibold text-marino-800">Método de cálculo</p>
        <p className="mt-1">
          El año 0 registra la inversión con signo negativo. El año 1 es la suma de los doce flujos
          mensuales, donde cada mes aporta clientes × margen − costos fijos. Cada año siguiente se
          obtiene aplicando el crecimiento anual sobre el año 1 —un{" "}
          <strong>supuesto prudente</strong>, porque el año 1 todavía incluye los meses de arranque
          con pocos clientes— y al último año se le suma el valor de salvamento. Los flujos se
          descuentan a la tasa de evaluación para obtener el VPN.
        </p>
        <p className="mt-2">
          El modelo no incluye impuestos, depreciación ni reposición de equipos durante el horizonte
          evaluado.
        </p>
      </div>
    </Tarjeta>
  );
}
