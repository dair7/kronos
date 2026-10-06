"use client";

import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { useCaso } from "@/components/ProveedorCaso";
import { NavegacionPasos } from "@/components/NavegacionPasos";
import { PASOS, indiceDePaso } from "@/components/pasos";
import { Boton } from "@/components/ui/Boton";
import { Aviso } from "@/components/ui/Aviso";
import { PantallaNegocio } from "@/components/pantallas/PantallaNegocio";
import { PantallaServicios } from "@/components/pantallas/PantallaServicios";
import { PantallaInversion } from "@/components/pantallas/PantallaInversion";
import { PantallaPersonal } from "@/components/pantallas/PantallaPersonal";
import { PantallaProyeccion } from "@/components/pantallas/PantallaProyeccion";
import { PantallaParametros } from "@/components/pantallas/PantallaParametros";
import { validar } from "@/lib/calculos";
import type { Pantalla } from "@/lib/datos";

const PANTALLAS: Record<Pantalla, () => React.JSX.Element> = {
  negocio: PantallaNegocio,
  servicios: PantallaServicios,
  inversion: PantallaInversion,
  personal: PantallaPersonal,
  proyeccion: PantallaProyeccion,
  parametros: PantallaParametros,
};

export default function PaginaEvaluar() {
  const router = useRouter();
  const { caso, montado, pasoActivo, setPasoActivo } = useCaso();

  const errores = useMemo(() => validar(caso), [caso]);
  const erroresPorPantalla = useMemo(() => {
    const conteo: Record<string, number> = {};
    errores.forEach((error) => {
      conteo[error.pantalla] = (conteo[error.pantalla] ?? 0) + 1;
    });
    return conteo;
  }, [errores]);

  const indice = indiceDePaso(pasoActivo);
  const definicion = PASOS[indice];
  const Pantalla = PANTALLAS[pasoActivo];
  const esUltimo = indice === PASOS.length - 1;
  const erroresDelPaso = errores.filter((error) => error.pantalla === pasoActivo);

  const irA = (nuevoIndice: number) => {
    setPasoActivo(PASOS[nuevoIndice].id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!montado) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10">
        <p className="text-sm text-marino-500">Cargando el caso…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8">
      <NavegacionPasos
        activo={pasoActivo}
        onCambiar={setPasoActivo}
        erroresPorPantalla={erroresPorPantalla}
      />

      <div key={pasoActivo} className="aparecer mt-6">
        <header className="mb-5">
          <p className="text-xs font-medium uppercase tracking-wide text-marino-500">
            Paso {indice + 1} de {PASOS.length}
          </p>
          <h1 className="mt-1 text-xl font-semibold text-marino-900 sm:text-2xl">
            {definicion.tituloLargo}
          </h1>
          <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-marino-600">
            {definicion.descripcion}
          </p>
        </header>

        {erroresDelPaso.length > 0 && (
          <Aviso tono="alerta" titulo="Faltan datos en esta pantalla" className="mb-5">
            <ul className="list-disc space-y-1 pl-4">
              {erroresDelPaso.map((error) => (
                <li key={error.mensaje}>{error.mensaje}</li>
              ))}
            </ul>
          </Aviso>
        )}

        <div className="rounded-xl border border-borde bg-superficie p-4 shadow-sm sm:p-6">
          <Pantalla />
        </div>
      </div>

      <nav
        aria-label="Navegación entre pasos"
        className="sin-impresion mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between"
      >
        <Boton
          variante="secundario"
          disabled={indice === 0}
          onClick={() => irA(indice - 1)}
          className="sm:min-w-40"
        >
          ← Anterior
        </Boton>
        <Boton
          variante={esUltimo ? "acento" : "primario"}
          onClick={() => (esUltimo ? router.push("/resultados") : irA(indice + 1))}
          className="sm:min-w-40"
        >
          {esUltimo ? "Calcular y ver resultados →" : "Siguiente →"}
        </Boton>
      </nav>
    </div>
  );
}
