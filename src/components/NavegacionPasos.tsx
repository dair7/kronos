"use client";

import { useEffect, useRef } from "react";
import type { Pantalla } from "@/lib/datos";
import { PASOS } from "./pasos";

interface Props {
  activo: Pantalla;
  onCambiar: (paso: Pantalla) => void;
  /** Cantidad de errores por pantalla, para marcar los pasos incompletos. */
  erroresPorPantalla: Record<string, number>;
}

/**
 * Barra de navegacion por pasos. En celular se desplaza horizontalmente y el
 * paso activo se trae a la vista automaticamente; un paso con errores muestra
 * un "!" rojo.
 */
export function NavegacionPasos({ activo, onCambiar, erroresPorPantalla }: Props) {
  const contenedor = useRef<HTMLDivElement>(null);
  const botonActivo = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const boton = botonActivo.current;
    const caja = contenedor.current;
    if (!boton || !caja) return;
    // Centra el paso activo dentro de la barra, sin mover el scroll de la pagina.
    const desplazamiento =
      boton.offsetLeft - caja.offsetWidth / 2 + boton.offsetWidth / 2;
    caja.scrollTo({ left: Math.max(0, desplazamiento), behavior: "smooth" });
  }, [activo]);

  return (
    <nav aria-label="Pasos para registrar el caso" className="sin-impresion">
      <div
        ref={contenedor}
        className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0"
      >
        {PASOS.map((paso, indice) => {
          const esActivo = paso.id === activo;
          const errores = erroresPorPantalla[paso.id] ?? 0;
          return (
            <button
              key={paso.id}
              ref={esActivo ? botonActivo : undefined}
              type="button"
              aria-current={esActivo ? "step" : undefined}
              onClick={() => onCambiar(paso.id)}
              className={[
                "control-tactil flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-sm",
                "transition-colors duration-150 cursor-pointer",
                esActivo
                  ? "border-marino-800 bg-marino-800 font-medium text-white"
                  : "border-borde bg-superficie text-marino-700 hover:bg-marino-50",
              ].join(" ")}
            >
              <span
                aria-hidden
                className={[
                  "flex size-5 shrink-0 items-center justify-center rounded-full text-[0.7rem] font-semibold",
                  esActivo ? "bg-dorado-400 text-marino-950" : "bg-marino-100 text-marino-700",
                ].join(" ")}
              >
                {indice + 1}
              </span>
              <span className="whitespace-nowrap">{paso.titulo}</span>
              {errores > 0 && (
                <span
                  className="flex size-5 shrink-0 items-center justify-center rounded-full bg-peligro-600 text-[0.7rem] font-bold text-white"
                  title={`${errores} ${errores === 1 ? "dato por completar" : "datos por completar"}`}
                >
                  <span aria-hidden>!</span>
                  <span className="sr-only">
                    {errores} {errores === 1 ? "dato por completar" : "datos por completar"}
                  </span>
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
