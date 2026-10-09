"use client";

import { useCaso } from "../ProveedorCaso";
import { CampoNumero } from "../ui/Campo";
import { Aviso } from "../ui/Aviso";
import { Chip, Tarjeta } from "../ui/Tarjeta";
import { CifraPesos } from "../ui/ResumenEnVivo";
import { COLORES, GraficaVpnEscenarios, Leyenda } from "./Graficas";
import { veredicto } from "./Indicadores";
import { evaluarEscenario, type ResultadoEscenario } from "@/lib/calculos";
import type { Caso, Escenario } from "@/lib/datos";
import { meses, numero, pesos, porcentaje } from "@/lib/formato";

export function PestanaEscenarios({ caso, equilibrio }: { caso: Caso; equilibrio: number | null }) {
  const { actualizar } = useCaso();

  const evaluados = caso.escenarios.map((escenario) => ({
    escenario,
    resultado:
      escenario.clientes === null
        ? null
        : evaluarEscenario(caso, escenario.nombre || "Escenario", escenario.clientes),
  }));
  const resultados = evaluados
    .map((e) => e.resultado)
    .filter((r): r is ResultadoEscenario => r !== null);

  // Escenario base: el que coincide con la proyeccion del caso; si ninguno
  // coincide, el del medio.
  const maximo = Math.max(0, ...caso.proyeccion.map((c) => c ?? 0));
  const base =
    resultados.find((r) => r.clientes === maximo)?.nombre ??
    resultados[Math.floor(resultados.length / 2)]?.nombre ??
    null;

  // Escala comun de las barras de clientes para que se comparen entre tarjetas.
  const escala = Math.max(1, equilibrio ?? 0, ...resultados.map((r) => r.clientes)) * 1.1;

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
      {equilibrio !== null && (
        <p className="flex items-center gap-2 text-[12px] font-medium text-tenue xl:col-span-12">
          <span aria-hidden className="h-3.5 w-[3px] rounded-full bg-tinta" />
          En cada barra, la raya negra marca el punto de equilibrio: {numero(equilibrio)} clientes
          adicionales al mes.
        </p>
      )}
      <div className="grid gap-4 md:grid-cols-3 xl:col-span-12">
        {evaluados.map(({ escenario, resultado }, indice) => (
          <TarjetaEscenario
            key={escenario.id}
            escenario={escenario}
            resultado={resultado}
            esBase={resultado?.nombre === base}
            equilibrio={equilibrio}
            escala={escala}
            onNombre={(v) => actualizar((c) => void (c.escenarios[indice].nombre = v))}
            onClientes={(v) => actualizar((c) => void (c.escenarios[indice].clientes = v))}
          />
        ))}
      </div>

      {resultados.length === 0 ? (
        <Aviso tono="alerta" titulo="Faltan los clientes de los escenarios" className="xl:col-span-12">
          Escriba, en al menos un escenario, cuántos clientes adicionales atendería el negocio al mes
          una vez la ampliación esté funcionando a capacidad plena.
        </Aviso>
      ) : (
        <>
          <Tarjeta
            titulo="VPN por escenario"
            descripcion="Lo único que cambia entre escenarios son los clientes"
            acciones={
              <Leyenda
                items={[
                  { nombre: "Base", muestra: "barra", color: COLORES.tinta },
                  { nombre: "Otros", muestra: "barra", color: COLORES.contexto },
                  { nombre: "Negativo", muestra: "barra", color: COLORES.negativo },
                ]}
              />
            }
            className="xl:col-span-5"
            cuerpo="flex min-w-0 flex-1 flex-col"
          >
            {/* La grafica estira hasta la altura de la tabla de al lado */}
            <div className="min-h-64 flex-1">
              <GraficaVpnEscenarios escenarios={resultados} base={base} />
            </div>
          </Tarjeta>
          <TablaComparativa resultados={resultados} equilibrio={equilibrio} className="xl:col-span-7" />
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------

function TarjetaEscenario({
  escenario,
  resultado,
  esBase,
  equilibrio,
  escala,
  onNombre,
  onClientes,
}: {
  escenario: Escenario;
  resultado: ResultadoEscenario | null;
  esBase: boolean;
  equilibrio: number | null;
  escala: number;
  onNombre: (valor: string) => void;
  onClientes: (valor: number | null) => void;
}) {
  const estado = resultado ? veredicto(resultado.vpn) : null;
  const clientes = escenario.clientes ?? 0;
  const debajo = equilibrio !== null && clientes < equilibrio;

  return (
    <section
      aria-label={escenario.nombre || "Escenario"}
      className="tarjeta-impresion evitar-corte flex min-w-0 flex-col rounded-tarjeta bg-tarjeta p-5 shadow-tarjeta sm:p-6"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <input
            type="text"
            value={escenario.nombre}
            placeholder="Nombre del escenario"
            aria-label="Nombre del escenario"
            onChange={(e) => onNombre(e.target.value)}
            className="-ml-2 w-full rounded-lg px-2 py-0.5 text-[15px] font-semibold hover:bg-fondo focus:bg-fondo focus:outline-none"
          />
          <p className="text-[12px] font-medium text-tenue">
            {esBase ? "Escenario base del caso" : "Escenario alternativo"}
          </p>
        </div>
        {estado && (
          <Chip tono={estado.tono}>
            <span aria-hidden className="size-1.5 rounded-full bg-current" />
            {estado.texto}
          </Chip>
        )}
      </div>

      {resultado ? (
        <>
          <p className="mt-4 text-[13px] font-medium text-tenue">VPN</p>
          <p className={`cifra text-[32px] leading-tight font-bold ${resultado.vpn < 0 ? "text-negativo" : ""}`}>
            <CifraPesos texto={pesos(resultado.vpn)} />
          </p>
          <dl className="mt-3 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-fondo px-3 py-2.5">
              <dt className="text-[12px] font-medium text-tenue">TIR</dt>
              <dd className="cifra text-[15px] font-bold">
                {resultado.tir === null ? "No existe" : porcentaje(resultado.tir * 100)}
              </dd>
            </div>
            <div className="rounded-2xl bg-fondo px-3 py-2.5">
              <dt className="text-[12px] font-medium text-tenue">Recuperación simple</dt>
              <dd className="cifra text-[15px] font-bold">
                {resultado.recuperacionMeses === null ? "No se recupera" : meses(resultado.recuperacionMeses)}
              </dd>
            </div>
          </dl>
        </>
      ) : (
        <p className="mt-4 rounded-2xl bg-fondo px-3 py-6 text-center text-[13px] text-tenue">
          Escriba los clientes para calcular este escenario.
        </p>
      )}

      {/* Clientes del escenario frente al punto de equilibrio */}
      <div className="mt-5">
        <div className="flex items-baseline justify-between text-[12px] font-medium text-tenue">
          <span>Clientes frente al equilibrio</span>
          {equilibrio !== null && resultado && (
            <span className={`cifra font-semibold ${debajo ? "text-negativo" : "text-positivo-texto"}`}>
              {debajo
                ? `${numero(equilibrio - clientes)} por debajo`
                : `${numero(clientes - equilibrio)} por encima`}
            </span>
          )}
        </div>
        <div aria-hidden className="relative mt-2 h-2.5 rounded-full bg-fondo">
          <div
            className={`h-full rounded-full ${debajo ? "bg-negativo" : "bg-positivo"}`}
            style={{ width: `${Math.min(100, (clientes / escala) * 100)}%` }}
          />
          {equilibrio !== null && (
            <span
              className="absolute -top-1 h-[18px] w-[3px] -translate-x-1/2 rounded-full bg-tinta ring-2 ring-tarjeta"
              style={{ left: `${(equilibrio / escala) * 100}%` }}
            />
          )}
        </div>
      </div>

      <CampoNumero
        className="mt-4"
        etiqueta="Clientes a capacidad plena"
        unidad="clientes/mes"
        unidadSingular="cliente/mes"
        min={0}
        valor={escenario.clientes}
        onChange={onClientes}
      />
    </section>
  );
}

// ---------------------------------------------------------------------------

function TablaComparativa({
  resultados,
  equilibrio,
  className,
}: {
  resultados: ResultadoEscenario[];
  equilibrio: number | null;
  className?: string;
}) {
  const filas: {
    etiqueta: string;
    valor: (r: ResultadoEscenario) => string;
    negativo: (r: ResultadoEscenario) => boolean;
  }[] = [
    { etiqueta: "Clientes adicionales / mes", valor: (r) => numero(r.clientes), negativo: () => false },
    {
      etiqueta: "Frente al equilibrio",
      valor: (r) =>
        r.distanciaEquilibrio === null
          ? "No aplica"
          : r.distanciaEquilibrio >= 0
            ? `+${numero(r.distanciaEquilibrio)}`
            : `−${numero(Math.abs(r.distanciaEquilibrio))}`,
      negativo: (r) => (r.distanciaEquilibrio ?? 0) < 0,
    },
    { etiqueta: "Ingresos año 1", valor: (r) => pesos(r.ingresosAnio1), negativo: () => false },
    { etiqueta: "Costos año 1", valor: (r) => pesos(r.costosAnio1), negativo: () => false },
    { etiqueta: "Flujo neto año 1", valor: (r) => pesos(r.flujoAnio1), negativo: (r) => r.flujoAnio1 < 0 },
    {
      etiqueta: "TIR",
      valor: (r) => (r.tir === null ? "No existe" : porcentaje(r.tir * 100)),
      negativo: (r) => r.tir === null,
    },
    {
      etiqueta: "Recuperación simple",
      valor: (r) => (r.recuperacionMeses === null ? "No se recupera" : meses(r.recuperacionMeses)),
      negativo: (r) => r.recuperacionMeses === null,
    },
    {
      etiqueta: "Recuperación descontada",
      valor: (r) =>
        r.recuperacionDescontadaMeses === null ? "No se recupera" : meses(r.recuperacionDescontadaMeses),
      negativo: (r) => r.recuperacionDescontadaMeses === null,
    },
  ];

  return (
    <Tarjeta
      titulo="Comparación de escenarios"
      descripcion={
        equilibrio === null
          ? "Misma inversión, costos y parámetros"
          : `Punto de equilibrio: ${numero(equilibrio)} clientes adicionales al mes`
      }
      className={className}
    >
      {/* Celular: una lista por indicador, con los tres valores uno debajo del otro */}
      <div className="sm:hidden">
        {filas.map((fila) => (
          <div key={fila.etiqueta} className="border-b border-linea py-3 first:pt-0">
            <p className="text-[12px] font-semibold text-tenue">{fila.etiqueta}</p>
            <dl className="mt-1.5 space-y-1">
              {resultados.map((resultado) => (
                <div key={resultado.nombre} className="flex items-baseline justify-between gap-3">
                  <dt className="truncate text-[13px] font-medium">{resultado.nombre}</dt>
                  <dd
                    className={`cifra text-sm font-semibold whitespace-nowrap ${
                      fila.negativo(resultado) ? "text-negativo" : ""
                    }`}
                  >
                    {fila.valor(resultado)}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
        <div className="mt-3 rounded-2xl bg-tinta px-4 py-3 text-white">
          <p className="text-[12px] font-semibold text-white/60">VPN</p>
          <dl className="mt-1.5 space-y-1">
            {resultados.map((resultado) => (
              <div key={resultado.nombre} className="flex items-baseline justify-between gap-3">
                <dt className="truncate text-[13px] font-medium">{resultado.nombre}</dt>
                <dd
                  className={`cifra text-[15px] font-bold whitespace-nowrap ${
                    resultado.vpn < 0 ? "text-[#f87171]" : ""
                  }`}
                >
                  {pesos(resultado.vpn)}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Desde 640 px: tabla */}
      <div className="desplazable-x hidden overflow-x-auto sm:block">
        <table className="w-full min-w-[32rem] border-separate border-spacing-0 text-sm">
          <caption className="sr-only">Indicadores económicos obtenidos en cada escenario</caption>
          <thead>
            <tr className="text-[12px] text-tenue">
              <th scope="col" className="h-10 rounded-l-xl bg-fondo pl-4 text-left font-medium">
                Indicador
              </th>
              {resultados.map((resultado, indice) => (
                <th
                  key={resultado.nombre}
                  scope="col"
                  className={`h-10 bg-fondo px-3 text-right font-semibold text-tinta ${
                    indice === resultados.length - 1 ? "rounded-r-xl pr-4" : ""
                  }`}
                >
                  {resultado.nombre}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="cifra">
            {filas.map((fila) => (
              <tr key={fila.etiqueta} className="[&>*]:border-b [&>*]:border-linea">
                <th scope="row" className="h-12 pl-4 text-left text-[13px] font-medium text-tenue">
                  {fila.etiqueta}
                </th>
                {resultados.map((resultado, indice) => (
                  <td
                    key={resultado.nombre}
                    className={`h-12 px-3 text-right font-semibold whitespace-nowrap ${
                      fila.negativo(resultado) ? "text-negativo" : ""
                    } ${indice === resultados.length - 1 ? "pr-4" : ""}`}
                  >
                    {fila.valor(resultado)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th scope="row" className="h-14 rounded-l-2xl bg-tinta pl-4 text-left text-sm font-semibold text-white">
                VPN
              </th>
              {resultados.map((resultado, indice) => (
                <td
                  key={resultado.nombre}
                  className={`cifra h-14 bg-tinta px-3 text-right text-[15px] font-bold ${
                    resultado.vpn < 0 ? "text-[#f87171]" : "text-white"
                  } ${indice === resultados.length - 1 ? "rounded-r-2xl pr-4" : ""}`}
                >
                  {pesos(resultado.vpn)}
                </td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>
      <p className="mt-3 text-[12px] leading-relaxed text-tenue">
        KRONOS no señala un escenario ganador: muestra los resultados para que decida quien conoce el
        negocio.
      </p>
    </Tarjeta>
  );
}
