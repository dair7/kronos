"use client";

import { useId, useState } from "react";
import { Chip, Tarjeta } from "../ui/Tarjeta";
import { serviciosValidos } from "../estadoPasos";
import type { Interpretacion as TipoInterpretacion, Resultado } from "@/lib/calculos";
import type { Caso } from "@/lib/datos";
import { meses, numero, pesos, pesosDecimales, porcentaje } from "@/lib/formato";

/**
 * Tarjeta "Interpretacion completa", a ancho completo.
 * - Cerrada: solo el titular y el primer parrafo.
 * - Abierta ("Ver mas"): el texto en dos columnas a la izquierda (2/3) y, a la
 *   derecha (1/3), los supuestos del calculo y el catalogo de servicios.
 * Asi la tarjeta crece hacia abajo como un bloque y no deja huecos al lado.
 * El texto lo genera lib/calculos.ts por reglas.
 */
export function Interpretacion({
  interpretacion,
  caso,
  resultado,
  className,
}: {
  interpretacion: TipoInterpretacion;
  caso: Caso;
  resultado: Resultado;
  className?: string;
}) {
  const [abierta, setAbierta] = useState(false);
  const idDetalle = useId();
  const [primero, ...resto] = interpretacion.parrafos;
  const d = resultado.derivados;
  const servicios = serviciosValidos(caso);

  const supuestos: [string, string][] = [
    ["Ingreso promedio por cliente", pesosDecimales(d.ingresoPromedio)],
    ["Costo variable por cliente", pesosDecimales(d.costoVariable)],
    ["Margen por cliente", pesosDecimales(d.margen)],
    ["Costos fijos adicionales", `${pesos(d.costosFijosMensuales)} /mes`],
    ["Prestaciones sobre salarios", porcentaje(caso.personal.porcentajePrestaciones ?? 0)],
    ["Clientes actuales", `${numero(caso.negocio.clientesActuales ?? 0)} clientes/mes`],
    ["Clientes adicionales del año 1", `${numero(d.clientesAnio1)} clientes`],
    ["Margen de seguridad", porcentaje(d.margenSeguridad)],
    ["Recuperación descontada", meses(resultado.recuperacionDescontadaMeses)],
  ];

  return (
    <Tarjeta titulo="Interpretación completa" className={className}>
      <div className={abierta ? "grid gap-x-10 gap-y-6 lg:grid-cols-3" : "print:grid print:grid-cols-3 print:gap-x-10"}>
        {/* Texto: 2/3 */}
        <div className="min-w-0 lg:col-span-2 print:col-span-2">
          <p className="max-w-3xl text-[15px] leading-snug font-bold">{interpretacion.titular}</p>
          <div
            id={idDetalle}
            className={`mt-2 text-sm leading-relaxed text-tinta/80 ${
              abierta ? "gap-x-8 md:columns-2" : "max-w-3xl"
            } [&>p]:mb-3 [&>p]:break-inside-avoid`}
          >
            <p>{primero}</p>
            {resto.map((parrafo, indice) => (
              <p key={indice} className={abierta ? "" : "hidden print:block"}>
                {parrafo}
              </p>
            ))}
            <p className={`text-[12px] text-tenue ${abierta ? "" : "hidden print:block"}`}>
              {interpretacion.cierre}
            </p>
          </div>
          <p className={`mt-1 rounded-2xl bg-fondo p-3.5 text-[12px] leading-relaxed text-tenue ${abierta ? "" : "hidden print:block"}`}>
            Método: el año 0 es la inversión en negativo; el año 1 suma los doce meses (clientes ×
            margen − costos fijos); cada año siguiente aplica el crecimiento sobre el año 1 —un
            supuesto prudente, porque incluye el arranque— y el último suma el salvamento. Sin
            impuestos, depreciación ni reposición de equipos.
          </p>
        </div>

        {/* Supuestos y catalogo: 1/3 */}
        <aside className={`min-w-0 ${abierta ? "" : "hidden print:block"}`}>
          <h3 className="text-[13px] font-semibold">Supuestos del cálculo</h3>
          <dl className="mt-1.5">
            {supuestos.map(([etiqueta, valor]) => (
              <div
                key={etiqueta}
                className="flex items-baseline justify-between gap-3 border-b border-linea py-2 last:border-0"
              >
                <dt className="text-[12px] font-medium text-tenue">{etiqueta}</dt>
                <dd className="cifra text-[13px] font-semibold">{valor}</dd>
              </div>
            ))}
          </dl>

          {servicios.length > 0 && (
            <>
              <h3 className="mt-4 text-[13px] font-semibold">Catálogo de servicios</h3>
              <p className="text-[12px] text-tenue">Información de contexto: no entra en los cálculos.</p>
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {servicios.map((servicio) => (
                  <li key={servicio.id}>
                    <Chip className="cifra">
                      {servicio.nombre} · {pesos(servicio.precio as number)}
                    </Chip>
                  </li>
                ))}
              </ul>
            </>
          )}


        </aside>
      </div>

      <button
        type="button"
        onClick={() => setAbierta((valor) => !valor)}
        aria-expanded={abierta}
        aria-controls={idDetalle}
        className="sin-impresion mt-3 inline-flex h-10 cursor-pointer items-center gap-1.5 self-start rounded-full border border-linea px-4 text-[13px] font-semibold hover:bg-fondo"
      >
        {abierta ? "Ver menos" : "Ver más"}
        <span aria-hidden className={`transition-transform ${abierta ? "rotate-180" : ""}`}>
          ⌄
        </span>
      </button>
    </Tarjeta>
  );
}
