"use client";

/**
 * Graficas del dashboard, construidas con Recharts.
 *
 * Todas van dentro de un ResponsiveContainer para que se ajusten al ancho
 * disponible y nunca se salgan de la pantalla, y todas llevan un titulo y una
 * nota que explica como leerlas.
 */

import type { ReactNode } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Nota, Tarjeta } from "../ui/Tarjeta";
import { numero, pesos, pesosCompactos } from "@/lib/formato";
import type { Resultado, ResultadoEscenario } from "@/lib/calculos";

// Paleta de las series: las mismas del sistema de diseno.
const COLOR_MARINO = "#234060";
const COLOR_MARINO_CLARO = "#5e86b0";
const COLOR_DORADO = "#d9ad38";
const COLOR_PELIGRO = "#dc2626";
const COLOR_EXITO = "#15803d";
const COLOR_REJILLA = "#e2eaf3";
const COLOR_EJE = "#5b6b7d";

const EJE = { stroke: COLOR_EJE, fontSize: 12 } as const;

function ContenedorGrafica({
  titulo,
  nota,
  children,
}: {
  titulo: string;
  nota: ReactNode;
  children: ReactNode;
}) {
  return (
    <Tarjeta titulo={titulo}>
      {/* El ancho del contenedor manda; la grafica nunca desborda la tarjeta. */}
      <div className="h-64 w-full sm:h-72">{children}</div>
      <Nota>{nota}</Nota>
    </Tarjeta>
  );
}

const estiloTooltip = {
  contentStyle: {
    borderRadius: "0.5rem",
    border: "1px solid #dbe1e8",
    fontSize: "0.8rem",
  },
  labelStyle: { color: "#12263c", fontWeight: 600 },
} as const;

// ---------------------------------------------------------------------------
// 1. Ingresos vs. costos adicionales por mes (ano 1)
// ---------------------------------------------------------------------------

export function GraficaIngresosCostos({ resultado }: { resultado: Resultado }) {
  const datos = resultado.ingresosMensuales.map((ingreso, i) => ({
    mes: `M${i + 1}`,
    Ingresos: Math.round(ingreso),
    Costos: Math.round(resultado.costosMensuales[i]),
  }));

  return (
    <ContenedorGrafica
      titulo="Ingresos y costos adicionales por mes (año 1)"
      nota="Cada par de barras compara lo que entra y lo que sale en ese mes por la ampliación. Mientras la barra azul sea más baja que la dorada, el mes cierra en negativo: todavía no hay suficientes clientes para cubrir los costos fijos."
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={datos} margin={{ top: 8, right: 8, left: 4, bottom: 4 }} accessibilityLayer>
          <CartesianGrid strokeDasharray="3 3" stroke={COLOR_REJILLA} vertical={false} />
          <XAxis dataKey="mes" tick={EJE} tickLine={false} axisLine={{ stroke: COLOR_REJILLA }} />
          <YAxis
            tick={EJE}
            tickLine={false}
            axisLine={false}
            width={62}
            tickFormatter={pesosCompactos}
          />
          <Tooltip formatter={(valor) => pesos(Number(valor))} {...estiloTooltip} />
          <Legend wrapperStyle={{ fontSize: "0.75rem" }} />
          <Bar dataKey="Ingresos" fill={COLOR_MARINO} radius={[3, 3, 0, 0]} />
          <Bar dataKey="Costos" fill={COLOR_DORADO} radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ContenedorGrafica>
  );
}

// ---------------------------------------------------------------------------
// 2. Flujo de caja por ano
// ---------------------------------------------------------------------------

export function GraficaFlujoAnual({ resultado }: { resultado: Resultado }) {
  const datos = resultado.flujosAnuales.map((flujo, anio) => ({
    anio: `Año ${anio}`,
    Flujo: Math.round(flujo),
  }));

  return (
    <ContenedorGrafica
      titulo="Flujo de caja por año"
      nota="La barra roja del año 0 es la inversión: dinero que sale. Las barras azules son lo que el proyecto genera cada año. El último año incluye el valor de salvamento."
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={datos} margin={{ top: 8, right: 8, left: 4, bottom: 4 }} accessibilityLayer>
          <CartesianGrid strokeDasharray="3 3" stroke={COLOR_REJILLA} vertical={false} />
          <XAxis
            dataKey="anio"
            tick={EJE}
            tickLine={false}
            axisLine={{ stroke: COLOR_REJILLA }}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={EJE}
            tickLine={false}
            axisLine={false}
            width={62}
            tickFormatter={pesosCompactos}
          />
          <Tooltip formatter={(valor) => pesos(Number(valor))} {...estiloTooltip} />
          <ReferenceLine y={0} stroke={COLOR_EJE} />
          <Bar dataKey="Flujo" radius={[3, 3, 0, 0]}>
            {datos.map((fila, indice) => (
              <Cell key={fila.anio} fill={indice === 0 ? COLOR_PELIGRO : COLOR_MARINO} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ContenedorGrafica>
  );
}

// ---------------------------------------------------------------------------
// 3. Clientes actuales vs. proyectados
// ---------------------------------------------------------------------------

export function GraficaClientes({
  clientesActuales,
  proyeccion,
}: {
  clientesActuales: number;
  proyeccion: number[];
}) {
  const datos = proyeccion.map((adicionales, i) => ({
    mes: `M${i + 1}`,
    "Clientes actuales": clientesActuales,
    "Clientes adicionales": adicionales,
  }));

  return (
    <ContenedorGrafica
      titulo="Clientes actuales y proyectados por mes"
      nota="Las barras están apiladas: la parte inferior son los clientes que el negocio ya atiende y la superior, los que sumaría la ampliación. La altura total es la demanda que habría que atender cada mes."
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={datos} margin={{ top: 8, right: 8, left: 4, bottom: 4 }} accessibilityLayer>
          <CartesianGrid strokeDasharray="3 3" stroke={COLOR_REJILLA} vertical={false} />
          <XAxis dataKey="mes" tick={EJE} tickLine={false} axisLine={{ stroke: COLOR_REJILLA }} />
          <YAxis
            tick={EJE}
            tickLine={false}
            axisLine={false}
            width={48}
            tickFormatter={(valor) => numero(Number(valor))}
          />
          <Tooltip
            formatter={(valor) => `${numero(Number(valor))} clientes`}
            {...estiloTooltip}
          />
          <Legend wrapperStyle={{ fontSize: "0.75rem" }} />
          <Bar dataKey="Clientes actuales" stackId="clientes" fill={COLOR_MARINO_CLARO} />
          <Bar
            dataKey="Clientes adicionales"
            stackId="clientes"
            fill={COLOR_DORADO}
            radius={[3, 3, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </ContenedorGrafica>
  );
}

// ---------------------------------------------------------------------------
// 4. Recuperacion de la inversion
// ---------------------------------------------------------------------------

export function GraficaRecuperacion({ resultado }: { resultado: Resultado }) {
  const datos = resultado.saldoMensual.map((punto) => ({
    mes: punto.mes === 0 ? "Inicio" : `M${punto.mes}`,
    Saldo: Math.round(punto.saldo),
  }));

  return (
    <ContenedorGrafica
      titulo="Recuperación de la inversión"
      nota="La línea arranca en el valor negativo de la inversión y sube con lo que el proyecto va dejando cada mes. El punto donde cruza la línea punteada de $0 es el momento en que la inversión queda recuperada."
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={datos} margin={{ top: 8, right: 12, left: 4, bottom: 4 }} accessibilityLayer>
          <CartesianGrid strokeDasharray="3 3" stroke={COLOR_REJILLA} vertical={false} />
          <XAxis
            dataKey="mes"
            tick={EJE}
            tickLine={false}
            axisLine={{ stroke: COLOR_REJILLA }}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={EJE}
            tickLine={false}
            axisLine={false}
            width={62}
            tickFormatter={pesosCompactos}
          />
          <Tooltip formatter={(valor) => pesos(Number(valor))} {...estiloTooltip} />
          <ReferenceLine
            y={0}
            stroke={COLOR_PELIGRO}
            strokeDasharray="5 5"
            label={{ value: "$0", position: "right", fill: COLOR_PELIGRO, fontSize: 11 }}
          />
          <Line
            type="monotone"
            dataKey="Saldo"
            stroke={COLOR_MARINO}
            strokeWidth={2.5}
            dot={{ r: 2.5, fill: COLOR_MARINO }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ContenedorGrafica>
  );
}

// ---------------------------------------------------------------------------
// Graficas de la pestana de escenarios
// ---------------------------------------------------------------------------

export function GraficaVpnEscenarios({ escenarios }: { escenarios: ResultadoEscenario[] }) {
  const datos = escenarios.map((escenario) => ({
    nombre: escenario.nombre,
    VPN: Math.round(escenario.vpn),
  }));

  return (
    <ContenedorGrafica
      titulo="VPN por escenario"
      nota="Las barras en rojo tienen VPN negativo: en ese escenario el proyecto no alcanza a devolver la inversión más la rentabilidad mínima exigida. Las barras en verde lo superan."
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={datos} margin={{ top: 8, right: 8, left: 4, bottom: 4 }} accessibilityLayer>
          <CartesianGrid strokeDasharray="3 3" stroke={COLOR_REJILLA} vertical={false} />
          <XAxis
            dataKey="nombre"
            tick={{ ...EJE, fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: COLOR_REJILLA }}
          />
          <YAxis
            tick={EJE}
            tickLine={false}
            axisLine={false}
            width={62}
            tickFormatter={pesosCompactos}
          />
          <Tooltip formatter={(valor) => pesos(Number(valor))} {...estiloTooltip} />
          <ReferenceLine y={0} stroke={COLOR_EJE} />
          <Bar dataKey="VPN" radius={[3, 3, 0, 0]}>
            {datos.map((fila) => (
              <Cell key={fila.nombre} fill={fila.VPN < 0 ? COLOR_PELIGRO : COLOR_EXITO} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ContenedorGrafica>
  );
}

const COLORES_ESCENARIO = [COLOR_DORADO, COLOR_MARINO, COLOR_MARINO_CLARO];

export function GraficaAcumuladoEscenarios({ escenarios }: { escenarios: ResultadoEscenario[] }) {
  const anios = escenarios[0]?.acumuladoPorAnio.length ?? 0;
  const datos = Array.from({ length: anios }, (_, anio) => {
    const fila: Record<string, string | number> = { anio: `Año ${anio}` };
    escenarios.forEach((escenario) => {
      fila[escenario.nombre] = Math.round(escenario.acumuladoPorAnio[anio]);
    });
    return fila;
  });

  return (
    <ContenedorGrafica
      titulo="Flujo acumulado por año, en cada escenario"
      nota="Cada línea suma, año tras año, el dinero que deja el proyecto partiendo de la inversión negativa del año 0. Una línea que nunca sube por encima de cero indica que ese escenario no recupera la inversión."
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={datos} margin={{ top: 8, right: 12, left: 4, bottom: 4 }} accessibilityLayer>
          <CartesianGrid strokeDasharray="3 3" stroke={COLOR_REJILLA} vertical={false} />
          <XAxis
            dataKey="anio"
            tick={EJE}
            tickLine={false}
            axisLine={{ stroke: COLOR_REJILLA }}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={EJE}
            tickLine={false}
            axisLine={false}
            width={62}
            tickFormatter={pesosCompactos}
          />
          <Tooltip formatter={(valor) => pesos(Number(valor))} {...estiloTooltip} />
          <Legend wrapperStyle={{ fontSize: "0.75rem" }} />
          <ReferenceLine y={0} stroke={COLOR_PELIGRO} strokeDasharray="5 5" />
          {escenarios.map((escenario, indice) => (
            <Line
              key={escenario.nombre}
              type="monotone"
              dataKey={escenario.nombre}
              stroke={COLORES_ESCENARIO[indice % COLORES_ESCENARIO.length]}
              strokeWidth={2.5}
              dot={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </ContenedorGrafica>
  );
}
