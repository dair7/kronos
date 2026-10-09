"use client";

import { useMemo, useState } from "react";
import { useCaso } from "@/components/ProveedorCaso";
import { Boton } from "@/components/ui/Boton";
import { Aviso } from "@/components/ui/Aviso";
import { IconoDescargar } from "@/components/ui/Iconos";
import { SelectorPildora } from "@/components/ui/SelectorPildora";
import { ComoLeer } from "@/components/dashboard/ComoLeer";
import { ListaErrores } from "@/components/dashboard/ListaErrores";
import { PestanaResultado } from "@/components/dashboard/PestanaResultado";
import { PestanaEscenarios } from "@/components/dashboard/PestanaEscenarios";
import { advertencias, evaluar, validar } from "@/lib/calculos";

type Pestana = "resultado" | "escenarios";

const PESTANAS: { id: Pestana; titulo: string }[] = [
  { id: "resultado", titulo: "Resultado" },
  { id: "escenarios", titulo: "Escenarios" },
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
    return <p className="py-10 text-sm text-tenue">Calculando los resultados…</p>;
  }

  // Con datos incompletos no se calcula: se muestra qué falta y dónde corregirlo.
  if (!resultado) {
    return <ListaErrores errores={errores} />;
  }

  const subtitulo = [caso.inversion.descripcion, caso.negocio.ubicacion].filter(Boolean).join(" · ");

  return (
    <div>
      <header className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-[24px] leading-tight font-bold tracking-[-0.01em]">
            {caso.negocio.nombre}
          </h1>
          {subtitulo && <p className="mt-0.5 truncate text-sm font-medium text-tenue">{subtitulo}</p>}
        </div>
        <div className="sin-impresion flex flex-wrap items-center gap-2">
          <SelectorPildora
            etiqueta="Vistas del dashboard"
            opciones={PESTANAS}
            valor={pestana}
            onCambiar={setPestana}
          />
          <ComoLeer />
          <Boton onClick={() => window.print()}>
            <IconoDescargar tamano={16} />
            Exportar PDF
          </Boton>
        </div>
      </header>

      {avisos.length > 0 && (
        <div className="sin-impresion mb-4 space-y-2">
          {avisos.map((aviso) => (
            <Aviso key={aviso} tono="alerta" titulo="Advertencia sobre los datos">
              {aviso}
            </Aviso>
          ))}
        </div>
      )}

      <div
        key={pestana}
        role="tabpanel"
        id={`panel-${pestana}`}
        aria-labelledby={`pestana-${pestana}`}
        className="aparecer"
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
