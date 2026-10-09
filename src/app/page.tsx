"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCaso } from "@/components/ProveedorCaso";
import { Boton } from "@/components/ui/Boton";
import { ModalConfirmacion } from "@/components/ui/Modal";
import {
  IconoFlechaDerecha,
  IconoLogo,
  IconoNegocio,
  IconoProyeccion,
  IconoResultados,
} from "@/components/ui/Iconos";
import {
  IndicadorRecuperacion,
  IndicadorTir,
  TarjetaHeroeVpn,
} from "@/components/dashboard/Indicadores";
import { evaluar } from "@/lib/calculos";
import { CASO_ESPITIA, casoVacio, type Caso } from "@/lib/datos";

const PASOS = [
  {
    icono: IconoNegocio,
    titulo: "Registre los datos",
    texto: "El negocio hoy, la inversión, los costos que aparecen y los clientes que espera.",
  },
  {
    icono: IconoProyeccion,
    titulo: "KRONOS calcula",
    texto: "Arma el flujo de caja y obtiene VPN, TIR, recuperación y punto de equilibrio.",
  },
  {
    icono: IconoResultados,
    titulo: "Lea la decisión",
    texto: "Un dashboard con indicadores, gráficas, supuestos y tres escenarios comparados.",
  },
];

/** Compara casos sin tener en cuenta los identificadores de las filas. */
function huella(caso: Caso): string {
  return JSON.stringify(caso, (clave, valor) => (clave === "id" ? undefined : valor));
}
const HUELLA_ESPITIA = huella(CASO_ESPITIA);

// La vista previa usa el calculo real del caso, no una imagen.
const RESULTADO_ESPITIA = evaluar(CASO_ESPITIA);

export default function PaginaBienvenida() {
  const router = useRouter();
  const { caso, montado, cargarEspitia, nuevoCaso, setPasoActivo } = useCaso();
  const [confirmarNuevo, setConfirmarNuevo] = useState(false);

  const verEspitia = () => {
    cargarEspitia();
    router.push("/resultados");
  };

  // Solo se pide confirmacion si hay algo que perder: un caso distinto del de
  // Espitia original y que no este vacio.
  const evaluarMiNegocio = () => {
    const actual = huella(caso);
    const hayDatosPropios = montado && actual !== HUELLA_ESPITIA && actual !== huella(casoVacio());
    if (hayDatosPropios) setConfirmarNuevo(true);
    else empezarNuevo();
  };

  const empezarNuevo = () => {
    nuevoCaso();
    setPasoActivo("negocio");
    setConfirmarNuevo(false);
    router.push("/evaluar");
  };

  return (
    <div className="aparecer min-h-screen overflow-hidden bg-fondo">
      <header className="mx-auto flex h-16 max-w-6xl items-center px-5 sm:px-8">
        <span className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-tinta text-white">
            <IconoLogo tamano={18} />
          </span>
          <span className="text-[16px] font-extrabold tracking-[0.08em]">KRONOS</span>
        </span>
      </header>

      <main id="contenido">
        {/* Hero dividido */}
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 pt-6 pb-10 sm:px-8 lg:grid-cols-[1fr_1.05fr] lg:pt-8">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-tarjeta px-3 py-1.5 text-[12px] font-semibold shadow-tarjeta">
              <span aria-hidden className="size-1.5 rounded-full bg-positivo" />
              Evaluación económica para pequeños negocios
            </p>
            <h1 className="mt-5 max-w-xl text-[36px] leading-[1.05] font-extrabold tracking-[-0.03em] sm:text-[48px]">
              ¿Esa inversión le conviene a su negocio?
            </h1>
            <p className="mt-4 max-w-md text-base leading-relaxed text-tenue">
              Ingrese sus datos y KRONOS le responde con el VPN, la TIR, la recuperación y el punto
              de equilibrio, explicados en palabras.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
              <Boton onClick={verEspitia} className="px-6">
                Ver caso Espitia Barber Shop
                <IconoFlechaDerecha tamano={16} />
              </Boton>
              <button
                type="button"
                onClick={evaluarMiNegocio}
                className="h-11 cursor-pointer text-sm font-semibold underline decoration-contexto underline-offset-4 hover:decoration-tinta"
              >
                Evaluar mi negocio
              </button>
            </div>
            <p className="mt-4 text-[12px] font-medium text-tenue">
              El caso Espitia viene cargado con datos reales de una barbería de San Pelayo, Córdoba.
            </p>
          </div>

          {/* Vista previa real del dashboard */}
          <div aria-label="Vista previa del dashboard del caso Espitia" role="img" className="relative">
            <div aria-hidden className="absolute -inset-6 rounded-[32px] bg-linea/60" />
            <div
              aria-hidden
              className="pointer-events-none relative origin-center -rotate-2 rounded-[28px] bg-fondo p-3 shadow-flotante select-none sm:p-4"
            >
              <TarjetaHeroeVpn caso={CASO_ESPITIA} resultado={RESULTADO_ESPITIA} />
              <div className="mt-3 grid grid-cols-2 gap-3 sm:mt-4 sm:gap-4">
                <IndicadorTir caso={CASO_ESPITIA} resultado={RESULTADO_ESPITIA} />
                <IndicadorRecuperacion resultado={RESULTADO_ESPITIA} />
              </div>
            </div>
          </div>
        </section>

        {/* Tres pasos en una fila */}
        <section aria-labelledby="como-funciona" className="mx-auto max-w-6xl px-5 pb-12 sm:px-8">
          <h2 id="como-funciona" className="sr-only">
            Cómo funciona
          </h2>
          <ol className="grid gap-6 border-t border-linea pt-8 md:grid-cols-3 md:gap-10">
            {PASOS.map((paso) => (
              <li key={paso.titulo} className="flex items-start gap-3.5">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-tarjeta shadow-tarjeta">
                  <paso.icono tamano={18} />
                </span>
                <div>
                  <h3 className="text-[15px] font-semibold">{paso.titulo}</h3>
                  <p className="mt-0.5 text-[13px] leading-relaxed text-tenue">{paso.texto}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </main>

      <ModalConfirmacion
        abierto={confirmarNuevo}
        titulo="Crear un caso nuevo"
        textoConfirmar="Sí, empezar de cero"
        onConfirmar={empezarNuevo}
        onCancelar={() => setConfirmarNuevo(false)}
      >
        <p>
          Se reemplazarán todos los datos que tiene cargados ahora mismo y esta acción no se puede
          deshacer.
        </p>
        <p className="mt-2">
          Si quiere conservarlos, cancele y use primero{" "}
          <strong className="text-tinta">Guardar caso</strong>.
        </p>
      </ModalConfirmacion>
    </div>
  );
}
