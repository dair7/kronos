import type { ReactNode } from "react";
import { Chip } from "../ui/Tarjeta";
import { CifraPesos } from "../ui/ResumenEnVivo";
import type { Resultado } from "@/lib/calculos";
import type { Caso } from "@/lib/datos";
import { meses, mesDeRecuperacion, numero, pesos, porcentaje } from "@/lib/formato";

/**
 * Indicadores principales del dashboard: la tarjeta heroe del VPN y los tres
 * indicadores con mini grafica. Tambien se usan en la vista previa de la
 * bienvenida, por eso reciben el caso y el resultado ya calculados.
 */

// ---------------------------------------------------------------------------
// Tarjeta heroe: VPN
// ---------------------------------------------------------------------------

export function veredicto(vpn: number) {
  if (vpn > 0) return { texto: "Conveniente", tono: "positivo" as const };
  if (vpn < 0) return { texto: "No conveniente", tono: "negativo" as const };
  return { texto: "Indiferente", tono: "neutro" as const };
}

export function TarjetaHeroeVpn({
  caso,
  resultado,
  className,
}: {
  caso: Caso;
  resultado: Resultado;
  className?: string;
}) {
  const tasa = caso.parametros.tasaEvaluacion ?? 0;
  const anios = caso.parametros.vidaUtil ?? 0;
  const inversion = resultado.derivados.inversionTotal;
  const estado = veredicto(resultado.vpn);

  const conclusion =
    resultado.vpn > 0
      ? `Recupera los ${pesos(inversion)} invertidos, paga el ${porcentaje(tasa, 0)} anual exigido y además deja este excedente en pesos de hoy.`
      : resultado.vpn < 0
        ? `En pesos de hoy no alcanza a devolver los ${pesos(inversion)} invertidos más el ${porcentaje(tasa, 0)} anual exigido.`
        : `Devuelve exactamente la inversión más el ${porcentaje(tasa, 0)} anual exigido, sin excedente.`;

  return (
    <section
      aria-label="Valor presente neto"
      className={`tarjeta-impresion evitar-corte flex min-w-0 flex-col justify-between rounded-tarjeta bg-tinta p-6 text-white shadow-tarjeta ${className ?? ""}`}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-[13px] font-medium text-white/60">Valor presente neto</p>
        <Chip tono={estado.tono}>
          <span aria-hidden className="size-1.5 rounded-full bg-current" />
          {estado.texto}
        </Chip>
      </div>
      <div className="mt-4">
        <p
          className={`cifra text-[44px] leading-none font-bold sm:text-[56px] ${resultado.vpn < 0 ? "text-[#f87171]" : ""}`}
        >
          <CifraPesos texto={pesos(resultado.vpn)} claseSimbolo="mr-1 align-[0.55em] text-[0.45em] text-white/60" />
        </p>
        <p className="mt-2 text-[13px] font-medium text-white/60">
          Al {porcentaje(tasa, 0)} anual · {numero(anios)} {anios === 1 ? "año" : "años"}
        </p>
      </div>
      <p className="mt-4 max-w-md text-[13px] leading-relaxed text-white/85">{conclusion}</p>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Tarjeta de indicador con mini grafica
// ---------------------------------------------------------------------------

function TarjetaIndicador({
  etiqueta,
  valor,
  unidad,
  grafica,
  leyenda,
  pie,
  className,
}: {
  etiqueta: string;
  valor: string;
  unidad?: string;
  grafica: ReactNode;
  /** Explicacion minima de la mini grafica, justo debajo de ella. */
  leyenda?: string;
  pie: ReactNode;
  className?: string;
}) {
  return (
    <section
      aria-label={etiqueta}
      className={`tarjeta-impresion evitar-corte flex min-w-0 flex-col rounded-tarjeta bg-tarjeta p-5 shadow-tarjeta ${className ?? ""}`}
    >
      <p className="text-[13px] font-medium text-tenue">{etiqueta}</p>
      <p className="cifra mt-1.5 text-[32px] leading-none font-bold whitespace-nowrap">
        {valor}
        {unidad && <span className="ml-1 text-[14px] font-semibold tracking-normal text-tenue">{unidad}</span>}
      </p>
      <div className="mt-auto pt-4">{grafica}</div>
      {leyenda && <p className="mt-1.5 text-[10.5px] leading-tight font-medium text-tenue">{leyenda}</p>}
      <p className="mt-2 text-[12px] leading-snug font-medium text-tenue">{pie}</p>
    </section>
  );
}

export function IndicadorTir({
  caso,
  resultado,
  className,
}: {
  caso: Caso;
  resultado: Resultado;
  className?: string;
}) {
  const tasa = caso.parametros.tasaEvaluacion ?? 0;
  const tir = resultado.tir === null ? null : resultado.tir * 100;
  const escala = Math.max(tir ?? 0, tasa, 1);
  const barras = [
    { nombre: "TIR", valor: tir, clase: "bg-tinta" },
    { nombre: "TMAR", valor: tasa, clase: "bg-contexto" },
  ];

  return (
    <TarjetaIndicador
      className={className}
      etiqueta="Tasa interna de retorno"
      valor={tir === null ? "No existe" : numero(tir, 1)}
      unidad={tir === null ? undefined : "%"}
      grafica={
        <div aria-hidden className="space-y-2">
          {barras.map((barra) => (
            <div key={barra.nombre} className="flex items-center gap-2">
              <span className="w-9 shrink-0 text-[11px] font-semibold text-tenue">{barra.nombre}</span>
              <div className="h-2 flex-1 rounded-full bg-fondo">
                <div
                  className={`h-full rounded-full ${barra.clase}`}
                  style={{ width: `${Math.max(4, ((barra.valor ?? 0) / escala) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      }
      pie={
        tir === null
          ? "Los flujos no cambian de signo"
          : `Frente a una TMAR del ${porcentaje(tasa, 0)}`
      }
    />
  );
}

export function IndicadorRecuperacion({
  resultado,
  className,
}: {
  resultado: Resultado;
  className?: string;
}) {
  const inversion = resultado.derivados.inversionTotal;
  const recuperacion = resultado.recuperacionMeses;
  const mesClave = recuperacion === null ? null : Math.ceil(recuperacion);
  const enAnios = recuperacion !== null && recuperacion > 24;

  // Doce mini barras, una por mes del anio 1: la altura es la parte de la
  // inversion recuperada al cierre de ese mes.
  const barras = Array.from({ length: 12 }, (_, i) => {
    const punto = resultado.saldoMensual[i + 1];
    const recuperado = punto && inversion > 0 ? (punto.saldo + inversion) / inversion : 0;
    return { mes: i + 1, altura: Math.min(1, Math.max(0.12, recuperado)) };
  });

  return (
    <TarjetaIndicador
      className={className}
      etiqueta="Recuperación simple"
      valor={
        recuperacion === null ? "No" : enAnios ? numero(recuperacion / 12, 1) : numero(recuperacion, 1)
      }
      unidad={recuperacion === null ? "se recupera" : enAnios ? "años" : "meses"}
      grafica={
        <div aria-hidden className="flex h-10 items-end gap-[3px]">
          {barras.map((barra) => (
            <span
              key={barra.mes}
              className={`flex-1 rounded-[3px] ${
                mesClave === null || barra.mes < mesClave
                  ? "bg-contexto"
                  : barra.mes === mesClave
                    ? "bg-acento"
                    : "bg-positivo"
              }`}
              style={{ height: `${barra.altura * 100}%` }}
            />
          ))}
        </div>
      }
      leyenda="Avance mes a mes · naranja = mes en que se recupera"
      pie={
        <>
          {recuperacion === null
            ? "Dentro del periodo evaluado"
            : mesClave !== null && mesClave <= 12
              ? mesDeRecuperacion(recuperacion)
              : `${mesDeRecuperacion(recuperacion)}, después del año 1`}
          <span className="mt-0.5 block font-semibold text-tinta">
            Descontada:{" "}
            {resultado.recuperacionDescontadaMeses === null
              ? "no se recupera"
              : meses(resultado.recuperacionDescontadaMeses)}
          </span>
        </>
      }
    />
  );
}

export function IndicadorEquilibrio({
  resultado,
  className,
}: {
  resultado: Resultado;
  className?: string;
}) {
  const d = resultado.derivados;
  const equilibrio = d.puntoEquilibrio;
  const maximo = d.proyeccionMaxima;
  const escala = Math.max(maximo, equilibrio ?? 0, 1);
  const holgura = d.sobreEquilibrio;
  const posicion = equilibrio === null ? 0 : (equilibrio / escala) * 100;
  const llegada = (maximo / escala) * 100;

  return (
    <TarjetaIndicador
      className={className}
      etiqueta="Punto de equilibrio"
      valor={equilibrio === null ? "No aplica" : numero(equilibrio)}
      unidad={equilibrio === null ? undefined : "clientes"}
      grafica={
        <div aria-hidden>
          <div className="relative h-2.5 rounded-full bg-fondo">
            {/* Tramo hasta el equilibrio (contexto) y holgura hasta la proyeccion (verde) */}
            <div
              className="rayado absolute inset-y-0 left-0 rounded-l-full"
              style={{ width: `${Math.min(posicion, llegada)}%` }}
            />
            {holgura !== null && holgura > 0 && (
              <div
                className="absolute inset-y-0 rounded-r-full bg-positivo"
                style={{ left: `${posicion}%`, width: `${llegada - posicion}%` }}
              />
            )}
            {equilibrio !== null && (
              <span
                className="absolute -top-1 h-[18px] w-[3px] -translate-x-1/2 rounded-full bg-tinta ring-2 ring-tarjeta"
                style={{ left: `${posicion}%` }}
              />
            )}
          </div>
          <div className="cifra mt-1.5 flex justify-between text-[11px] font-semibold text-tenue">
            <span>0</span>
            <span>{numero(escala)}</span>
          </div>
        </div>
      }
      pie={
        holgura === null ? (
          "El margen por cliente no es positivo"
        ) : holgura >= 0 ? (
          <>
            <span className="block font-semibold text-tinta">
              Margen de seguridad: {porcentaje(d.margenSeguridad)}
            </span>
            {porcentaje(holgura)} por encima del equilibrio
          </>
        ) : (
          `La proyección (${numero(maximo)}) no lo alcanza`
        )
      }
    />
  );
}
