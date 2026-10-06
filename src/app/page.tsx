"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCaso } from "@/components/ProveedorCaso";
import { Boton } from "@/components/ui/Boton";
import { ModalConfirmacion } from "@/components/ui/Modal";

const PASOS = [
  {
    numero: "1",
    titulo: "Registre los datos",
    texto:
      "Los datos actuales del negocio, la inversión que quiere hacer, los costos que aparecen con ella y los clientes que espera atender.",
  },
  {
    numero: "2",
    titulo: "KRONOS calcula",
    texto:
      "Arma el flujo de caja del proyecto y obtiene el VPN, la TIR, el periodo de recuperación y el punto de equilibrio.",
  },
  {
    numero: "3",
    titulo: "Lea la decisión",
    texto:
      "Un dashboard con indicadores, gráficas, supuestos y una interpretación en palabras, además de la comparación de tres escenarios.",
  },
];

export default function PaginaBienvenida() {
  const router = useRouter();
  const { cargarEspitia, nuevoCaso } = useCaso();
  const [confirmarNuevo, setConfirmarNuevo] = useState(false);

  const verEspitia = () => {
    cargarEspitia();
    router.push("/resultados");
  };

  const empezarNuevo = () => {
    nuevoCaso();
    setConfirmarNuevo(false);
    router.push("/evaluar");
  };

  return (
    <div className="aparecer">
      {/* Portada */}
      <section className="bg-marino-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:py-16 lg:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-dorado-300">
            Ingeniería Económica
          </p>
          <h1 className="mt-3 max-w-3xl text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
            ¿Esa inversión le conviene a su negocio?
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-marino-200 sm:text-lg">
            KRONOS evalúa económicamente proyectos de inversión de pequeños negocios: comprar un
            equipo, ampliar un local o contratar personal. Usted ingresa sus datos y la herramienta
            responde con indicadores y una interpretación clara.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Boton variante="acento" onClick={verEspitia} className="sm:px-6">
              Ver caso Espitia Barber Shop →
            </Boton>
            <Boton
              variante="secundario"
              onClick={() => setConfirmarNuevo(true)}
              className="sm:px-6"
            >
              Evaluar mi negocio
            </Boton>
          </div>
          <p className="mt-4 text-xs text-marino-300">
            El caso de Espitia Barber Shop viene cargado con datos reales del negocio y sirve para
            ver la herramienta funcionando de inmediato.
          </p>
        </div>
      </section>

      {/* Tres pasos */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:py-14">
        <h2 className="text-lg font-semibold text-marino-900">Cómo funciona, en tres pasos</h2>
        <ol className="mt-6 grid gap-4 md:grid-cols-3">
          {PASOS.map((paso) => (
            <li
              key={paso.numero}
              className="rounded-xl border border-borde bg-superficie p-5 shadow-sm"
            >
              <span
                aria-hidden
                className="flex size-9 items-center justify-center rounded-lg bg-marino-900 text-sm font-bold text-dorado-300"
              >
                {paso.numero}
              </span>
              <h3 className="mt-3 text-base font-semibold text-marino-900">{paso.titulo}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-marino-600">{paso.texto}</p>
            </li>
          ))}
        </ol>

        <div className="mt-8 rounded-xl border border-borde bg-superficie p-5">
          <h3 className="text-sm font-semibold text-marino-900">
            ¿Para quién es esta herramienta?
          </h3>
          <p className="mt-1.5 text-sm leading-relaxed text-marino-600">
            Para dueños de pequeños negocios de servicios, emprendedores y estudiantes de Ingeniería
            Económica que necesiten decidir si una inversión es conveniente. El caso inicial es
            Espitia Barber Shop (San Pelayo, Córdoba), pero cualquier negocio puede crear su propio
            caso, guardarlo como archivo y volver a abrirlo después.
          </p>
        </div>
      </section>

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
          Si quiere conservarlos, cancele y use primero el botón <strong>Guardar caso</strong> del
          encabezado.
        </p>
      </ModalConfirmacion>
    </div>
  );
}
