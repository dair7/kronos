"use client";

import { Tarjeta } from "../ui/Tarjeta";
import { Interpretacion } from "./Interpretacion";
import { LecturaRapida } from "./LecturaRapida";
import { TablaFlujo } from "./TablaFlujo";
import {
  IndicadorEquilibrio,
  IndicadorRecuperacion,
  IndicadorTir,
  TarjetaHeroeVpn,
} from "./Indicadores";
import {
  COLORES,
  GraficaFlujoAnual,
  GraficaIngresosCostos,
  GraficaRecuperacion,
  Leyenda,
} from "./Graficas";
import { interpretar, type Resultado } from "@/lib/calculos";
import type { Caso } from "@/lib/datos";

/**
 * Pestana "Resultado". Cuadricula de 12 columnas desde 1280 px:
 * - fila 1: VPN (5) + tres indicadores con mini grafica (7)
 * - fila 2: recuperacion de la inversion (8) + lectura rapida (4)
 *   (estas dos filas caben en 1366 x 768 sin scroll)
 * - fila 3: flujo por anio (6) + ingresos vs. costos (6)
 * - fila 4: tabla de flujo descontado (12)
 * - fila 5: interpretacion completa (12): texto en 2/3 y supuestos en 1/3
 * Entre 768 y 1279 px las filas pasan a 2 columnas; en celular, a una sola.
 */
export function PestanaResultado({ caso, resultado }: { caso: Caso; resultado: Resultado }) {
  const tasa = caso.parametros.tasaEvaluacion ?? 0;
  const interpretacion = interpretar(caso, resultado);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-12">
      {/* Fila 1 */}
      <TarjetaHeroeVpn caso={caso} resultado={resultado} className="md:col-span-2 xl:col-span-5" />

      {/* En celular los indicadores se deslizan en horizontal */}
      <div className="sin-barra -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-4 sm:overflow-visible sm:px-0 sm:pb-0 md:col-span-2 xl:col-span-7">
        <IndicadorTir caso={caso} resultado={resultado} className="w-[72%] shrink-0 snap-start sm:w-auto" />
        <IndicadorRecuperacion resultado={resultado} className="w-[72%] shrink-0 snap-start sm:w-auto" />
        <IndicadorEquilibrio resultado={resultado} className="w-[72%] shrink-0 snap-start sm:w-auto" />
      </div>

      {/* Fila 2 */}
      <Tarjeta
        titulo="Recuperación de la inversión"
        descripcion="Saldo acumulado del proyecto, mes a mes, desde la inversión"
        acciones={
          <Leyenda
            items={[
              { nombre: "Por recuperar", muestra: "linea", color: COLORES.negativo },
              { nombre: "Recuperado", muestra: "linea", color: COLORES.positivo },
            ]}
          />
        }
        className="md:col-span-2 xl:col-span-8"
      >
        <div className="h-64 xl:h-[268px]">
          <GraficaRecuperacion resultado={resultado} />
        </div>
      </Tarjeta>

      <LecturaRapida caso={caso} resultado={resultado} className="md:col-span-2 xl:col-span-4" />

      {/* Fila 3 */}
      <Tarjeta
        titulo="Flujo de caja por año"
        descripcion="El año 0 es la inversión; el último incluye el salvamento"
        acciones={
          <Leyenda
            items={[
              { nombre: "Inversión", muestra: "barra", color: COLORES.negativo },
              { nombre: "Flujo neto", muestra: "rayado" },
            ]}
          />
        }
        className="xl:col-span-6"
      >
        <div className="h-64">
          <GraficaFlujoAnual resultado={resultado} />
        </div>
      </Tarjeta>

      <Tarjeta
        titulo="Ingresos vs. costos, año 1"
        descripcion="Lo que entra y lo que sale cada mes por la ampliación"
        acciones={
          <Leyenda
            items={[
              { nombre: "Ingresos", muestra: "linea", color: COLORES.positivo },
              { nombre: "Costos", muestra: "linea", color: COLORES.contextoOscuro },
            ]}
          />
        }
        className="xl:col-span-6"
      >
        <div className="h-64">
          <GraficaIngresosCostos resultado={resultado} />
        </div>
      </Tarjeta>

      {/* Fila 4 y 5: a ancho completo, para que abrir "Ver mas" nunca deje huecos */}
      <TablaFlujo resultado={resultado} tasa={tasa} className="md:col-span-2 xl:col-span-12" />
      <Interpretacion
        interpretacion={interpretacion}
        caso={caso}
        resultado={resultado}
        className="md:col-span-2 xl:col-span-12"
      />
    </div>
  );
}
