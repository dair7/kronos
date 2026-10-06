"use client";

import { Kpi, RejillaKpi } from "../ui/Kpi";
import { Boton } from "../ui/Boton";
import { Interpretacion } from "./Interpretacion";
import { Supuestos } from "./Supuestos";
import { TablaFlujo } from "./TablaFlujo";
import {
  GraficaClientes,
  GraficaFlujoAnual,
  GraficaIngresosCostos,
  GraficaRecuperacion,
} from "./Graficas";
import { interpretar, type Resultado } from "@/lib/calculos";
import type { Caso } from "@/lib/datos";
import { meses, mesDeRecuperacion, numero, pesos, porcentaje } from "@/lib/formato";

export function PestanaResultado({ caso, resultado }: { caso: Caso; resultado: Resultado }) {
  const d = resultado.derivados;
  const tasa = caso.parametros.tasaEvaluacion ?? 0;
  const interpretacion = interpretar(caso, resultado);

  const tirTexto = resultado.tir === null ? "No existe" : porcentaje(resultado.tir * 100);
  const tirNota =
    resultado.tir === null
      ? "Los flujos no cambian de signo"
      : `frente a una TMAR de ${porcentaje(tasa)}`;

  const notaRecuperacion = mesDeRecuperacion(resultado.recuperacionMeses);

  return (
    <div className="space-y-6">
      {/* Encabezado que solo aparece en el PDF impreso */}
      <div className="solo-impresion border-b border-marino-800 pb-3">
        <p className="text-lg font-bold">KRONOS — Evaluación económica</p>
        <p className="text-sm">
          {caso.negocio.nombre}
          {caso.negocio.ubicacion ? ` · ${caso.negocio.ubicacion}` : ""}
          {caso.inversion.descripcion ? ` · ${caso.inversion.descripcion}` : ""}
        </p>
      </div>

      <RejillaKpi>
        <Kpi
          etiqueta="Inversión inicial"
          unidad="($)"
          valor={pesos(d.inversionTotal)}
          nota={caso.inversion.descripcion || undefined}
          tono="acento"
        />
        <Kpi
          etiqueta="VPN"
          unidad="($ de hoy)"
          valor={pesos(resultado.vpn)}
          nota={resultado.vpn >= 0 ? "Supera la tasa exigida" : "No alcanza la tasa exigida"}
          tono={resultado.vpn >= 0 ? "favorable" : "desfavorable"}
        />
        <Kpi
          etiqueta="TIR"
          unidad="(% anual)"
          valor={tirTexto}
          nota={tirNota}
          tono={
            resultado.tir === null
              ? "desfavorable"
              : resultado.tir * 100 >= tasa
                ? "favorable"
                : "desfavorable"
          }
        />
        <Kpi
          etiqueta="Recuperación"
          unidad="(meses)"
          valor={meses(resultado.recuperacionMeses)}
          nota={notaRecuperacion ?? "No se alcanza en el horizonte"}
          tono={resultado.recuperacionMeses === null ? "desfavorable" : "neutro"}
        />
        <Kpi
          etiqueta="Punto de equilibrio"
          unidad="(clientes/mes)"
          valor={
            d.puntoEquilibrio === null ? "No aplica" : `${numero(d.puntoEquilibrio)} clientes`
          }
          nota={`proyección máxima: ${numero(d.proyeccionMaxima)} clientes/mes`}
          tono={
            d.puntoEquilibrio !== null && d.proyeccionMaxima >= d.puntoEquilibrio
              ? "favorable"
              : "desfavorable"
          }
        />
        <Kpi
          etiqueta="Flujo neto año 1"
          unidad="($)"
          valor={pesos(resultado.flujoAnio1)}
          nota={`${numero(d.clientesAnio1)} clientes adicionales en el año`}
          tono={resultado.flujoAnio1 >= 0 ? "favorable" : "desfavorable"}
        />
      </RejillaKpi>

      <Interpretacion interpretacion={interpretacion} />

      <Supuestos caso={caso} resultado={resultado} />

      <div className="grid gap-6 xl:grid-cols-2">
        <GraficaIngresosCostos resultado={resultado} />
        <GraficaFlujoAnual resultado={resultado} />
        <GraficaClientes
          clientesActuales={caso.negocio.clientesActuales ?? 0}
          proyeccion={caso.proyeccion.map((c) => c ?? 0)}
        />
        <GraficaRecuperacion resultado={resultado} />
      </div>

      <TablaFlujo resultado={resultado} tasa={tasa} />

      <div className="sin-impresion flex justify-end">
        <Boton variante="secundario" onClick={() => window.print()}>
          Imprimir o guardar en PDF
        </Boton>
      </div>
    </div>
  );
}
