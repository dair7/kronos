"use client";

import { useRouter } from "next/navigation";
import { useMemo, type ReactNode } from "react";
import { useCaso } from "@/components/ProveedorCaso";
import { PASOS, indiceDePaso } from "@/components/pasos";
import { Boton } from "@/components/ui/Boton";
import { Aviso } from "@/components/ui/Aviso";
import { IconoFlechaDerecha, IconoFlechaIzquierda } from "@/components/ui/Iconos";
import { PantallaNegocio } from "@/components/pantallas/PantallaNegocio";
import { PantallaServicios } from "@/components/pantallas/PantallaServicios";
import { PantallaInversion } from "@/components/pantallas/PantallaInversion";
import { PantallaPersonal } from "@/components/pantallas/PantallaPersonal";
import { PantallaProyeccion } from "@/components/pantallas/PantallaProyeccion";
import { PantallaParametros } from "@/components/pantallas/PantallaParametros";
import { validar } from "@/lib/calculos";
import type { Pantalla } from "@/lib/datos";

const PANTALLAS: Record<Pantalla, (props: { pie: ReactNode }) => React.JSX.Element> = {
  negocio: PantallaNegocio,
  servicios: PantallaServicios,
  inversion: PantallaInversion,
  personal: PantallaPersonal,
  proyeccion: PantallaProyeccion,
  parametros: PantallaParametros,
};

export default function PaginaEvaluar() {
  const router = useRouter();
  const { caso, montado, pasoActivo, setPasoActivo, pasosRevisados, revisarPaso } = useCaso();

  const errores = useMemo(() => validar(caso), [caso]);

  const indice = indiceDePaso(pasoActivo);
  const definicion = PASOS[indice];
  const Pantalla = PANTALLAS[pasoActivo];
  const esUltimo = indice === PASOS.length - 1;
  const erroresDelPaso = errores.filter((error) => error.pantalla === pasoActivo);
  const mostrarErrores = pasosRevisados.has(pasoActivo) && erroresDelPaso.length > 0;

  const irA = (nuevoIndice: number) => {
    setPasoActivo(PASOS[nuevoIndice].id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // "Siguiente" con datos faltantes: la primera vez se queda en el paso y
  // muestra que falta; si el usuario insiste, avanza (puede volver despues).
  const siguiente = () => {
    if (erroresDelPaso.length > 0 && !pasosRevisados.has(pasoActivo)) {
      revisarPaso(pasoActivo);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    revisarPaso(pasoActivo);
    if (esUltimo) router.push("/resultados");
    else irA(indice + 1);
  };

  if (!montado) {
    return <p className="py-10 text-sm text-tenue">Cargando el caso…</p>;
  }

  const pie = (
    <nav aria-label="Navegación entre pasos" className="sin-impresion flex justify-end gap-2">
      <Boton variante="secundario" disabled={indice === 0} onClick={() => irA(indice - 1)}>
        <IconoFlechaIzquierda tamano={16} />
        Anterior
      </Boton>
      <Boton onClick={siguiente}>
        {esUltimo ? "Ver resultados" : "Siguiente"}
        <IconoFlechaDerecha tamano={16} />
      </Boton>
    </nav>
  );

  return (
    <div key={pasoActivo} className="aparecer">
      <header className="mb-5">
        <p className="text-[13px] font-medium text-tenue">
          Paso {indice + 1} de {PASOS.length + 1}
        </p>
        <h1 className="mt-0.5 text-[24px] leading-tight font-bold tracking-[-0.01em]">
          {definicion.tituloLargo}
        </h1>
        <p className="mt-1 max-w-3xl text-sm leading-relaxed text-tenue">{definicion.descripcion}</p>
      </header>

      {mostrarErrores && (
        <Aviso tono="alerta" titulo="Faltan datos en esta pantalla" className="mb-4">
          <ul className="list-disc space-y-0.5 pl-4">
            {erroresDelPaso.map((error) => (
              <li key={error.mensaje}>{error.mensaje}</li>
            ))}
          </ul>
          <p className="mt-1.5">Puede completarlos ahora o seguir con «Siguiente» y volver después.</p>
        </Aviso>
      )}

      <Pantalla pie={pie} />
    </div>
  );
}
