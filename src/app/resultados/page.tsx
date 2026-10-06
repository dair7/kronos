"use client";

import { useMemo, useState } from "react";
import { useCaso } from "@/components/ProveedorCaso";
import { TourGuiado } from "@/components/TourGuiado";
import { EnlaceBoton } from "@/components/ui/Boton";
import { Aviso } from "@/components/ui/Aviso";
import { ListaErrores } from "@/components/dashboard/ListaErrores";
import { PestanaResultado } from "@/components/dashboard/PestanaResultado";
import { PestanaEscenarios } from "@/components/dashboard/PestanaEscenarios";
import { advertencias, evaluar, validar } from "@/lib/calculos";

type Pestana = "resultado" | "escenarios";

const PESTANAS: { id: Pestana; titulo: string }[] = [
  { id: "resultado", titulo: "Resultado" },
  { id: "escenarios", titulo: "Comparar escenarios" },
];

export default function PaginaResultados() {
  const { caso, montado } = useCaso();
  const [pestana, setPestana] = useState<Pestana>("resultado");

  const errores = useMemo(() => validar(caso), [caso]);
  const avisos = useMemo(() => (errores.length === 0 ? advertencias(caso) : []), [caso, errores]);
  const resultado = useMemo(
    () => (errores.length === 0 ? evaluar(caso) : null),
    [caso, errores],
  );

  if (!montado) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10">
        <p className="text-sm text-marino-500">Calculando los resultados…</p>
      </div>
    );
  }

  // Con datos incompletos no se calcula: se muestra qué falta y dónde corregirlo.
  if (!resultado) {
    return <ListaErrores errores={errores} />;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8">
      <header className="sin-impresion mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold text-marino-900 sm:text-2xl">
            Resultados de la evaluación
          </h1>
          <p className="mt-1 text-sm text-marino-600">
            {caso.negocio.nombre}
            {caso.negocio.ubicacion && ` · ${caso.negocio.ubicacion}`}
          </p>
        </div>
        <EnlaceBoton href="/evaluar" variante="secundario" tamano="pequeno">
          ← Volver a los datos
        </EnlaceBoton>
      </header>

      <div className="sin-impresion mb-5 space-y-4">
        <TourGuiado />
        {avisos.map((aviso) => (
          <Aviso key={aviso} tono="alerta" titulo="Advertencia sobre los datos">
            {aviso}
          </Aviso>
        ))}
      </div>

      {/* Pestañas */}
      <div
        role="tablist"
        aria-label="Vistas del dashboard"
        className="sin-impresion -mx-4 flex gap-2 overflow-x-auto border-b border-borde px-4 sm:mx-0 sm:px-0"
      >
        {PESTANAS.map((item) => {
          const activa = item.id === pestana;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              id={`pestana-${item.id}`}
              aria-selected={activa}
              aria-controls={`panel-${item.id}`}
              onClick={() => setPestana(item.id)}
              className={[
                "control-tactil shrink-0 cursor-pointer border-b-2 px-4 text-sm font-medium",
                "transition-colors duration-150",
                activa
                  ? "border-dorado-400 text-marino-900"
                  : "border-transparent text-marino-500 hover:text-marino-800",
              ].join(" ")}
            >
              {item.titulo}
            </button>
          );
        })}
      </div>

      <div
        key={pestana}
        role="tabpanel"
        id={`panel-${pestana}`}
        aria-labelledby={`pestana-${pestana}`}
        className="aparecer mt-6"
      >
        {pestana === "resultado" ? (
          <PestanaResultado caso={caso} resultado={resultado} />
        ) : (
          <PestanaEscenarios caso={caso} equilibrio={resultado.puntoEquilibrio} />
        )}
      </div>
    </div>
  );
}
