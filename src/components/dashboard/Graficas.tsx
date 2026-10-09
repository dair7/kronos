"use client";

/**
 * Graficas del dashboard, construidas con Recharts y con un solo estilo:
 * sin rejilla vertical, rejilla horizontal casi invisible, ejes sin linea,
 * etiquetas de 11 px en gris, tooltip como tarjeta blanca y barras de contexto
 * en gris rayado. El naranja se usa como maximo en UN elemento por grafica.
 */

import { useId, type ReactNode } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { escalaRedonda, numero, pesos, pesosEje } from "@/lib/formato";
import type { Resultado, ResultadoEscenario } from "@/lib/calculos";

// Los mismos valores de los tokens de globals.css (Recharts necesita colores
// literales para pintar el SVG).
export const COLORES = {
  tinta: "#0f0f10",
  tenue: "#71717a",
  fondo: "#f4f4f5",
  linea: "#e4e4e7",
  contexto: "#d4d4d8",
  contextoOscuro: "#52525b",
  positivo: "#16a34a",
  negativo: "#dc2626",
  acento: "#f97316",
} as const;

const EJE = { fill: COLORES.tenue, fontSize: 11, fontWeight: 500 } as const;

/** Convierte el id de React en un id valido para url(#...). */
function useIdSvg(prefijo: string) {
  return `${prefijo}-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
}

/**
 * Eje vertical en pesos con valores redondos (0, 10, 20, 30 M) y coma decimal.
 * Devuelve las props para <YAxis>.
 */
function ejePesos(valores: number[]) {
  const { dominio, marcas } = escalaRedonda(Math.min(...valores), Math.max(...valores));
  return {
    domain: dominio,
    ticks: marcas,
    interval: 0 as const,
    tick: EJE,
    axisLine: false,
    tickLine: false,
    width: 64,
    tickFormatter: pesosEje,
  };
}

/** Patron de gris rayado para barras de contexto, como en las referencias. */
function PatronRayado({ id }: { id: string }) {
  return (
    <pattern id={id} patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
      <rect width="6" height="6" fill={COLORES.linea} />
      <line x1="0" y1="0" x2="0" y2="6" stroke={COLORES.contexto} strokeWidth="2.5" />
    </pattern>
  );
}

// ---------------------------------------------------------------------------
// Tooltip como tarjeta blanca con sombra
// ---------------------------------------------------------------------------

interface ItemTooltip {
  name?: unknown;
  value?: unknown;
  color?: string;
  fill?: string;
  stroke?: string;
}

function TarjetaTooltip({
  active,
  payload,
  titulo,
  formato = (valor: number) => pesos(valor),
}: {
  active?: boolean;
  payload?: ReadonlyArray<ItemTooltip>;
  titulo: ReactNode;
  formato?: (valor: number) => string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="min-w-36 rounded-xl bg-tarjeta px-3 py-2.5 text-[12px] shadow-flotante">
      <p className="mb-1.5 font-semibold">{titulo}</p>
      <ul className="space-y-1">
        {payload.map((item) => {
          const valor = Number(item.value);
          const color = item.stroke ?? item.color ?? item.fill;
          return (
            <li key={String(item.name)} className="flex items-center gap-2">
              <span
                aria-hidden
                className="size-2 rounded-full"
                style={{ background: color && !color.startsWith("url") ? color : COLORES.contexto }}
              />
              <span className="text-tenue">{String(item.name)}</span>
              <span className={`cifra ml-auto pl-3 font-semibold ${valor < 0 ? "text-negativo" : ""}`}>
                {formato(valor)}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Leyenda pequena en linea, para el encabezado de las tarjetas. */
export function Leyenda({
  items,
}: {
  items: { nombre: string; muestra: "linea" | "barra" | "rayado"; color?: string }[];
}) {
  return (
    <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] font-medium text-tenue">
      {items.map((item) => (
        <li key={item.nombre} className="flex items-center gap-1.5">
          <span
            aria-hidden
            className={
              item.muestra === "linea"
                ? "h-0.5 w-3.5 rounded-full"
                : item.muestra === "rayado"
                  ? "rayado size-2.5 rounded-[3px]"
                  : "size-2.5 rounded-[3px]"
            }
            style={item.muestra === "rayado" ? undefined : { background: item.color }}
          />
          {item.nombre}
        </li>
      ))}
    </ul>
  );
}

// ---------------------------------------------------------------------------
// 1. Recuperacion de la inversion: saldo acumulado mes a mes
// ---------------------------------------------------------------------------

export function GraficaRecuperacion({ resultado }: { resultado: Resultado }) {
  const idTrazo = useIdSvg("trazo");
  const idRelleno = useIdSvg("relleno");

  const datos = resultado.saldoMensual.map((punto) => ({
    mes: punto.mes,
    Saldo: Math.round(punto.saldo),
  }));
  const valores = datos.map((d) => d.Saldo);
  const maximo = Math.max(...valores);
  const minimo = Math.min(...valores);
  // Punto del eje vertical (0 = arriba, 1 = abajo) donde el saldo cruza $0:
  // por encima el area es verde, por debajo roja.
  const corte = maximo <= 0 ? 0 : minimo >= 0 ? 1 : maximo / (maximo - minimo);
  const recuperacion = resultado.recuperacionMeses;
  const ultimoMes = datos[datos.length - 1]?.mes ?? 12;
  // Como maximo unas 12 marcas en el eje, para que las etiquetas no se monten.
  const pasoMarcas = Math.max(1, Math.ceil(ultimoMes / 12));
  const marcas = datos.map((d) => d.mes).filter((mes) => mes % pasoMarcas === 0);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={datos} margin={{ top: 28, right: 12, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={idTrazo} x1="0" y1="0" x2="0" y2="1">
            <stop offset={corte} stopColor={COLORES.positivo} />
            <stop offset={corte} stopColor={COLORES.negativo} />
          </linearGradient>
          <linearGradient id={idRelleno} x1="0" y1="0" x2="0" y2="1">
            <stop offset={0} stopColor={COLORES.positivo} stopOpacity={0.22} />
            <stop offset={corte} stopColor={COLORES.positivo} stopOpacity={0.04} />
            <stop offset={corte} stopColor={COLORES.negativo} stopOpacity={0.04} />
            <stop offset={1} stopColor={COLORES.negativo} stopOpacity={0.2} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke={COLORES.fondo} />
        <XAxis
          dataKey="mes"
          type="number"
          domain={[0, ultimoMes]}
          ticks={marcas}
          tickFormatter={(mes: number) => (mes === 0 ? "Inicio" : `Mes ${mes}`)}
          tick={EJE}
          axisLine={false}
          tickLine={false}
          tickMargin={8}
        />
        <YAxis
          {...ejePesos(valores)}
          width={78}
          tick={(props) => (
            <MarcaEjeCero x={Number(props.x)} y={Number(props.y)} valor={Number(props.payload.value)} />
          )}
        />
        <Tooltip
          cursor={{ stroke: COLORES.linea }}
          content={(props) => (
            <TarjetaTooltip
              active={props.active}
              payload={props.payload}
              titulo={Number(props.label) === 0 ? "Inicio (inversión)" : `Mes ${props.label}`}
            />
          )}
        />
        <ReferenceLine y={0} stroke={COLORES.contextoOscuro} strokeDasharray="4 4" />
        <Area
          type="monotone"
          dataKey="Saldo"
          name="Saldo acumulado"
          stroke={`url(#${idTrazo})`}
          strokeWidth={2.5}
          fill={`url(#${idRelleno})`}
          activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff", fill: COLORES.tinta }}
          isAnimationActive={false}
        />
        {recuperacion !== null && recuperacion <= ultimoMes && (
          <ReferenceDot
            x={recuperacion}
            y={0}
            r={6}
            fill={COLORES.acento}
            stroke="#fff"
            strokeWidth={2.5}
            label={(props: { viewBox?: { x: number; y: number; width: number } }) => (
              <EtiquetaCruce
                viewBox={props.viewBox}
                texto={`Se recupera · mes ${numero(recuperacion, 1)}`}
                // En la mitad derecha de la grafica la etiqueta se abre hacia la
                // izquierda del punto, para que nunca se corte en el borde.
                haciaIzquierda={recuperacion / ultimoMes > 0.5}
              />
            )}
          />
        )}
      </AreaChart>
    </ResponsiveContainer>
  );
}

/**
 * Marca del eje vertical de la grafica de recuperacion: el 0 se rotula como
 * "Linea de $0", sobre el eje, para no montarse sobre la linea punteada.
 */
function MarcaEjeCero({ x, y, valor }: { x: number; y: number; valor: number }) {
  const esCero = valor === 0;
  return (
    <text
      x={x}
      y={y}
      dy={4}
      textAnchor="end"
      fill={esCero ? COLORES.tinta : COLORES.tenue}
      fontSize={11}
      fontWeight={esCero ? 700 : 500}
    >
      {esCero ? "Línea de $0" : pesosEje(valor)}
    </text>
  );
}

/**
 * Pildora negra sobre el punto de cruce. Se abre hacia el lado con mas espacio:
 * a la izquierda del punto si este esta en la mitad derecha de la grafica.
 */
function EtiquetaCruce({
  viewBox,
  texto,
  haciaIzquierda,
}: {
  viewBox?: { x: number; y: number; width: number };
  texto: string;
  haciaIzquierda: boolean;
}) {
  if (!viewBox) return null;
  const ancho = texto.length * 6.4 + 22;
  const punto = viewBox.x + viewBox.width / 2;
  const x = haciaIzquierda ? punto - ancho + 14 : punto - 14;
  const centro = x + ancho / 2;
  const y = viewBox.y - 36;
  return (
    <g>
      <rect x={x} y={y} width={ancho} height={24} rx={12} fill={COLORES.tinta} />
      <text
        x={centro}
        y={y + 16}
        textAnchor="middle"
        fill="#fff"
        fontSize={11.5}
        fontWeight={700}
        style={{ fontFamily: "inherit" }}
      >
        {texto}
      </text>
    </g>
  );
}

// ---------------------------------------------------------------------------
// 2. Flujo de caja por ano: anio 0 en rojo, anios siguientes en gris rayado
// ---------------------------------------------------------------------------

export function GraficaFlujoAnual({ resultado }: { resultado: Resultado }) {
  const idRayado = useIdSvg("rayado");
  const datos = resultado.flujosAnuales.map((flujo, anio) => ({
    anio,
    Flujo: Math.round(flujo),
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={datos} margin={{ top: 8, right: 4, left: 0, bottom: 0 }} barCategoryGap="22%">
        <defs>
          <PatronRayado id={idRayado} />
        </defs>
        <CartesianGrid vertical={false} stroke={COLORES.fondo} />
        <XAxis
          dataKey="anio"
          tickFormatter={(anio: number) => (anio === 0 ? "Año 0" : String(anio))}
          tick={EJE}
          axisLine={false}
          tickLine={false}
          tickMargin={8}
        />
        <YAxis {...ejePesos(datos.map((d) => d.Flujo))} />
        <Tooltip
          cursor={{ fill: COLORES.fondo, radius: 8 }}
          content={(props) => (
            <TarjetaTooltip active={props.active} payload={props.payload} titulo={`Año ${props.label}`} />
          )}
        />
        <ReferenceLine y={0} stroke={COLORES.contexto} />
        <Bar dataKey="Flujo" name="Flujo de caja" radius={8} isAnimationActive={false}>
          {datos.map((fila) => (
            <Cell
              key={fila.anio}
              fill={fila.Flujo < 0 ? COLORES.negativo : `url(#${idRayado})`}
              stroke={fila.Flujo < 0 ? undefined : COLORES.contexto}
              strokeWidth={fila.Flujo < 0 ? 0 : 1}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ---------------------------------------------------------------------------
// 3. Ingresos vs. costos del anio 1 (lineas, como "Income vs Expenses")
// ---------------------------------------------------------------------------

export function GraficaIngresosCostos({ resultado }: { resultado: Resultado }) {
  const datos = resultado.ingresosMensuales.map((ingreso, i) => ({
    mes: i + 1,
    Ingresos: Math.round(ingreso),
    Costos: Math.round(resultado.costosMensuales[i]),
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={datos} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke={COLORES.fondo} />
        <XAxis
          dataKey="mes"
          tickFormatter={(mes: number) => `M${mes}`}
          tick={EJE}
          axisLine={false}
          tickLine={false}
          tickMargin={8}
        />
        <YAxis {...ejePesos(datos.flatMap((d) => [d.Ingresos, d.Costos]))} />
        <Tooltip
          cursor={{ stroke: COLORES.linea }}
          content={(props) => (
            <TarjetaTooltip active={props.active} payload={props.payload} titulo={`Mes ${props.label}`} />
          )}
        />
        <Line
          type="monotone"
          dataKey="Ingresos"
          stroke={COLORES.positivo}
          strokeWidth={2.5}
          dot={{ r: 3, fill: COLORES.positivo, strokeWidth: 0 }}
          activeDot={{ r: 5, stroke: "#fff", strokeWidth: 2 }}
          isAnimationActive={false}
        />
        <Line
          type="monotone"
          dataKey="Costos"
          stroke={COLORES.contextoOscuro}
          strokeWidth={2.5}
          dot={{ r: 3, fill: COLORES.contextoOscuro, strokeWidth: 0 }}
          activeDot={{ r: 5, stroke: "#fff", strokeWidth: 2 }}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ---------------------------------------------------------------------------
// 4. VPN por escenario: negativo en rojo, el base en negro, el resto en gris
// ---------------------------------------------------------------------------

export function GraficaVpnEscenarios({
  escenarios,
  base,
}: {
  escenarios: ResultadoEscenario[];
  /** Nombre del escenario base (el de la proyeccion del caso). */
  base: string | null;
}) {
  const datos = escenarios.map((escenario) => ({
    nombre: escenario.nombre,
    VPN: Math.round(escenario.vpn),
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={datos} margin={{ top: 8, right: 4, left: 0, bottom: 0 }} barCategoryGap="28%">
        <CartesianGrid vertical={false} stroke={COLORES.fondo} />
        <XAxis dataKey="nombre" tick={EJE} axisLine={false} tickLine={false} tickMargin={8} />
        <YAxis {...ejePesos(datos.map((d) => d.VPN))} />
        <Tooltip
          cursor={{ fill: COLORES.fondo, radius: 8 }}
          content={(props) => (
            <TarjetaTooltip active={props.active} payload={props.payload} titulo={props.label} />
          )}
        />
        <ReferenceLine y={0} stroke={COLORES.contexto} />
        <Bar dataKey="VPN" radius={8} maxBarSize={72} isAnimationActive={false}>
          {datos.map((fila) => (
            <Cell
              key={fila.nombre}
              fill={
                fila.VPN < 0
                  ? COLORES.negativo
                  : fila.nombre === base
                    ? COLORES.tinta
                    : COLORES.contexto
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
