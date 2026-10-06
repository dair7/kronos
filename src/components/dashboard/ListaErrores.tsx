"use client";

import { useRouter } from "next/navigation";
import { useCaso } from "../ProveedorCaso";
import { Boton } from "../ui/Boton";
import { Tarjeta } from "../ui/Tarjeta";
import { PASOS } from "../pasos";
import type { ErrorValidacion } from "@/lib/calculos";

/**
 * Pantalla que reemplaza al dashboard cuando faltan datos. Agrupa los errores
 * por pantalla y lleva al usuario directamente a la que debe corregir.
 */
export function ListaErrores({ errores }: { errores: ErrorValidacion[] }) {
  const router = useRouter();
  const { setPasoActivo } = useCaso();

  const grupos = PASOS.map((paso) => ({
    paso,
    mensajes: errores.filter((error) => error.pantalla === paso.id).map((e) => e.mensaje),
  })).filter((grupo) => grupo.mensajes.length > 0);

  const irACorregir = (indice: number) => {
    setPasoActivo(PASOS[indice].id);
    router.push("/evaluar");
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 aparecer">
      <h1 className="text-xl font-semibold text-marino-900 sm:text-2xl">
        Faltan datos para poder calcular
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-marino-600">
        KRONOS no calcula resultados con datos incompletos, porque un indicador construido sobre un
        dato que falta induce a error. Complete lo siguiente y vuelva a esta pantalla.
      </p>

      <div className="mt-6 space-y-4">
        {grupos.map((grupo) => {
          const indice = PASOS.findIndex((p) => p.id === grupo.paso.id);
          return (
            <Tarjeta
              key={grupo.paso.id}
              titulo={`Paso ${indice + 1} · ${grupo.paso.tituloLargo}`}
              acciones={
                <Boton variante="secundario" tamano="pequeno" onClick={() => irACorregir(indice)}>
                  Ir a corregir →
                </Boton>
              }
            >
              <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-marino-700">
                {grupo.mensajes.map((mensaje) => (
                  <li key={mensaje}>{mensaje}</li>
                ))}
              </ul>
            </Tarjeta>
          );
        })}
      </div>
    </div>
  );
}
