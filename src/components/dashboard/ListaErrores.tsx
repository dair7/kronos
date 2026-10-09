"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useCaso } from "../ProveedorCaso";
import { Boton } from "../ui/Boton";
import { IconoFlechaDerecha } from "../ui/Iconos";
import { PASOS } from "../pasos";
import type { ErrorValidacion } from "@/lib/calculos";

/**
 * Pantalla que reemplaza al dashboard cuando faltan datos. Agrupa los errores
 * por pantalla y lleva al usuario directamente a la que debe corregir.
 */
export function ListaErrores({ errores }: { errores: ErrorValidacion[] }) {
  const router = useRouter();
  const { setPasoActivo, revisarTodos } = useCaso();

  // Entrar a Resultados con datos faltantes los marca en rojo en el menu.
  useEffect(() => {
    revisarTodos();
  }, [revisarTodos]);

  const grupos = PASOS.map((paso, indice) => ({
    paso,
    indice,
    mensajes: errores.filter((error) => error.pantalla === paso.id).map((e) => e.mensaje),
  })).filter((grupo) => grupo.mensajes.length > 0);

  const irACorregir = (indice: number) => {
    setPasoActivo(PASOS[indice].id);
    router.push("/evaluar");
  };

  return (
    <div className="aparecer max-w-3xl">
      <h1 className="text-[24px] leading-tight font-bold">Faltan datos para poder calcular</h1>
      <p className="mt-1.5 text-sm leading-relaxed text-tenue">
        KRONOS no calcula resultados con datos incompletos, porque un indicador construido sobre un
        dato que falta induce a error. Complete lo siguiente y vuelva a esta pantalla.
      </p>

      <div className="mt-5 space-y-4">
        {grupos.map(({ paso, indice, mensajes }) => (
          <section key={paso.id} className="rounded-tarjeta bg-tarjeta p-5 shadow-tarjeta sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-xl bg-negativo-suave text-negativo-texto">
                  <paso.icono tamano={18} />
                </span>
                <div>
                  <p className="text-[12px] font-medium text-tenue">Paso {indice + 1}</p>
                  <h2 className="text-[15px] font-semibold">{paso.tituloLargo}</h2>
                </div>
              </div>
              <Boton variante="secundario" tamano="pequeno" onClick={() => irACorregir(indice)}>
                Ir a corregir
                <IconoFlechaDerecha tamano={14} />
              </Boton>
            </div>
            <ul className="mt-4 list-disc space-y-1 pl-5 text-sm leading-relaxed text-tinta/80">
              {mensajes.map((mensaje) => (
                <li key={mensaje}>{mensaje}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
