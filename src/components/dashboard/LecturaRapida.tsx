import type { ReactNode } from "react";
import { Chip, Tarjeta } from "../ui/Tarjeta";
import { IconoCapacidad, IconoDiana, IconoMoneda } from "../ui/Iconos";
import type { Resultado } from "@/lib/calculos";
import type { Caso } from "@/lib/datos";
import { numero, pesos, pesosCompactos, porcentaje } from "@/lib/formato";

/** Nombre del puesto de trabajo segun la actividad, para una lectura natural. */
function nombreTrabajador(actividad: string) {
  const texto = actividad.toLowerCase();
  if (texto.includes("barber")) return "barbero";
  if (texto.includes("peluquer")) return "estilista";
  if (texto.includes("panader")) return "panadero";
  return "trabajador";
}

/** Clientes por dia hoy y con la ampliacion, y la carga por trabajador. */
export function capacidad(caso: Caso, resultado: Resultado) {
  const dias = caso.negocio.diasOperacion ?? 0;
  const actuales = caso.negocio.clientesActuales ?? 0;
  if (dias <= 0 || actuales <= 0) return null;
  const hoy = actuales / dias;
  const ampliado = (actuales + resultado.derivados.proyeccionMaxima) / dias;
  const trabajadores = (caso.negocio.trabajadoresActuales ?? 0) + (caso.personal.nuevosTrabajadores ?? 0);
  const trabajadoresHoy = caso.negocio.trabajadoresActuales ?? 0;
  return {
    hoy,
    ampliado,
    porTrabajador: trabajadores > 0 ? ampliado / trabajadores : null,
    porTrabajadorHoy: trabajadoresHoy > 0 ? hoy / trabajadoresHoy : null,
    puesto: nombreTrabajador(caso.negocio.actividad),
  };
}

function Linea({ icono, titulo, detalle }: { icono: ReactNode; titulo: string; detalle: string }) {
  return (
    <li className="flex items-start gap-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-fondo">{icono}</span>
      <div className="min-w-0 pt-0.5">
        <p className="cifra text-sm leading-snug font-bold">{titulo}</p>
        <p className="text-[12px] leading-snug font-medium text-tenue">{detalle}</p>
      </div>
    </li>
  );
}

/**
 * Tarjeta "Lectura rapida": tres lineas cortas que resumen la decision y,
 * debajo, los supuestos con que se calculo todo (la guia exige tenerlos a la
 * vista junto a los resultados).
 */
export function LecturaRapida({
  caso,
  resultado,
  className,
}: {
  caso: Caso;
  resultado: Resultado;
  className?: string;
}) {
  const d = resultado.derivados;
  const tasa = caso.parametros.tasaEvaluacion ?? 0;
  const anios = caso.parametros.vidaUtil ?? 0;
  const cap = capacidad(caso, resultado);

  const lineaVpn =
    resultado.vpn >= 0
      ? {
          titulo: `${pesosCompactos(resultado.vpn)} por encima de lo exigido`,
          detalle: `VPN al ${porcentaje(tasa, 0)} anual, en pesos de hoy`,
        }
      : {
          titulo: `Faltan ${pesosCompactos(Math.abs(resultado.vpn))} para lo exigido`,
          detalle: `VPN negativo al ${porcentaje(tasa, 0)} anual`,
        };

  const lineaEquilibrio =
    d.puntoEquilibrio === null
      ? { titulo: "Sin punto de equilibrio", detalle: "El margen por cliente no es positivo" }
      : {
          titulo: `Equilibrio en ${numero(d.puntoEquilibrio)} clientes/mes`,
          detalle:
            d.proyeccionMaxima >= d.puntoEquilibrio
              ? `Se proyectan ${numero(d.proyeccionMaxima)} · margen de seguridad ${porcentaje(d.margenSeguridad)}`
              : `Se proyectan ${numero(d.proyeccionMaxima)}: no alcanza`,
        };

  const supuestos = [
    `TMAR ${porcentaje(tasa, 0)}`,
    `${numero(anios)} ${anios === 1 ? "año" : "años"}`,
    `Crecimiento ${porcentaje(caso.parametros.crecimientoAnual ?? 0, 0)}`,
    `Salvamento ${pesos(caso.parametros.valorSalvamento ?? 0)}`,
    "Año 1 como base prudente",
  ];

  return (
    <Tarjeta titulo="Lectura rápida" className={className}>
      <ul className="space-y-3.5">
        <Linea icono={<IconoMoneda tamano={18} />} {...lineaVpn} />
        <Linea icono={<IconoDiana tamano={18} />} {...lineaEquilibrio} />
        {cap && (
          <Linea
            icono={<IconoCapacidad tamano={18} />}
            titulo={`${numero(cap.hoy)} → ${numero(cap.ampliado)} clientes/día`}
            detalle={
              cap.porTrabajador === null
                ? "Con la capacidad que deja la inversión"
                : `${numero(cap.porTrabajador)} por ${cap.puesto}${
                    cap.porTrabajadorHoy !== null
                      ? cap.porTrabajador <= cap.porTrabajadorHoy
                        ? `, menos que hoy (${numero(cap.porTrabajadorHoy)})`
                        : `, más que hoy (${numero(cap.porTrabajadorHoy)})`
                      : ""
                  }`
            }
          />
        )}
      </ul>

      <div className="mt-4 border-t border-linea pt-3.5">
        <p className="text-[12px] font-medium text-tenue">Supuestos</p>
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {supuestos.map((supuesto) => (
            <li key={supuesto}>
              <Chip className="cifra">{supuesto}</Chip>
            </li>
          ))}
        </ul>
      </div>
    </Tarjeta>
  );
}
