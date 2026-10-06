"use client";

import { useSyncExternalStore } from "react";
import { Boton } from "./ui/Boton";
import {
  marcarTourVisto,
  obtenerTourVisto,
  obtenerTourVistoDelServidor,
  suscribir,
} from "@/lib/almacen";

const PUNTOS = [
  {
    titulo: "Arriba, los indicadores",
    texto:
      "Seis cifras resumen la decisión: cuánto cuesta, cuánto deja, cuánto rinde, en cuánto se recupera y cuántos clientes hacen falta.",
  },
  {
    titulo: "En el centro, la lectura",
    texto:
      "La interpretación explica qué significan esas cifras en palabras, y la tarjeta de supuestos muestra con qué parámetros se calcularon.",
  },
  {
    titulo: "En la pestaña «Comparar escenarios»",
    texto:
      "Cambie la cantidad de clientes de cada escenario y vea cómo se mueven el VPN, la TIR y la recuperación.",
  },
];

/**
 * Presentacion breve del dashboard la primera vez que se abre. Se cierra con
 * un boton y no vuelve a aparecer: la decision queda guardada en el navegador.
 */
export function TourGuiado() {
  const visto = useSyncExternalStore(
    suscribir,
    obtenerTourVisto,
    obtenerTourVistoDelServidor,
  );

  if (visto) return null;

  return (
    <aside
      aria-label="Cómo leer este dashboard"
      className="aparecer sin-impresion rounded-xl border border-dorado-200 bg-dorado-50 p-4 sm:p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h2 className="text-sm font-semibold text-marino-900">Cómo leer este dashboard</h2>
        <Boton variante="secundario" tamano="pequeno" onClick={marcarTourVisto}>
          Entendido, no mostrar más
        </Boton>
      </div>
      <ol className="mt-3 grid gap-3 md:grid-cols-3">
        {PUNTOS.map((punto, indice) => (
          <li key={punto.titulo} className="flex gap-2.5">
            <span
              aria-hidden
              className="flex size-6 shrink-0 items-center justify-center rounded-full bg-marino-900 text-xs font-bold text-dorado-300"
            >
              {indice + 1}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-marino-900">{punto.titulo}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-marino-600">{punto.texto}</p>
            </div>
          </li>
        ))}
      </ol>
    </aside>
  );
}
