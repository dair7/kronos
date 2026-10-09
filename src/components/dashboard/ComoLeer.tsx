"use client";

import { useEffect, useRef, useState } from "react";
import { Boton } from "../ui/Boton";
import { IconoAyuda, IconoCerrar } from "../ui/Iconos";

const PUNTOS = [
  {
    titulo: "La tarjeta negra: el VPN",
    texto:
      "Cuánto deja el proyecto en pesos de hoy después de recuperar la inversión y pagar la rentabilidad mínima exigida. Si es positivo, la inversión conviene.",
  },
  {
    titulo: "Los tres indicadores",
    texto:
      "TIR frente a la TMAR; en cuántos meses se recupera lo invertido (simple y con los flujos descontados a la TMAR); y cuántos clientes adicionales hacen falta para cubrir los costos fijos, con el margen de seguridad: cuánto pueden caer los clientes proyectados antes de perder.",
  },
  {
    titulo: "La gráfica de recuperación",
    texto:
      "El saldo acumulado arranca en rojo (la inversión) y se vuelve verde al cruzar $0. El punto naranja es el momento exacto en que se recupera.",
  },
  {
    titulo: "Pestaña Escenarios",
    texto:
      "Cambie los clientes de cada escenario dentro de su tarjeta y vea cómo se mueven el VPN, la TIR y la recuperación.",
  },
];

const COLORES = [
  { clase: "bg-positivo", texto: "Verde: ingresos y valores positivos" },
  { clase: "bg-negativo", texto: "Rojo: valores negativos y la inversión" },
  { clase: "rayado", texto: "Gris: costos y datos de contexto" },
  { clase: "bg-acento", texto: "Naranja: el dato clave de cada gráfica" },
];

/**
 * Boton "¿Como leer?" que abre un panel lateral desde la derecha (400 px; todo
 * el ancho en celular) con el fondo oscurecido. Se cierra con la X, con Esc o
 * con un clic fuera del panel.
 */
export function ComoLeer() {
  const [abierto, setAbierto] = useState(false);
  const botonCerrar = useRef<HTMLButtonElement>(null);
  const botonAbrir = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!abierto) return;
    botonCerrar.current?.focus();
    const alTecla = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") setAbierto(false);
    };
    document.addEventListener("keydown", alTecla);
    document.body.style.overflow = "hidden";
    const abrir = botonAbrir.current;
    return () => {
      document.removeEventListener("keydown", alTecla);
      document.body.style.overflow = "";
      abrir?.focus();
    };
  }, [abierto]);

  return (
    <>
      <Boton
        ref={botonAbrir}
        variante="secundario"
        aria-expanded={abierto}
        aria-haspopup="dialog"
        onClick={() => setAbierto(true)}
      >
        <IconoAyuda tamano={16} />
        ¿Cómo leer?
      </Boton>
      {abierto && (
        <div className="sin-impresion fixed inset-0 z-[60]">
          <div
            aria-hidden
            className="aparecer-fondo absolute inset-0 bg-tinta/40"
            onClick={() => setAbierto(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Cómo leer este dashboard"
            className="entrar-derecha absolute inset-y-0 right-0 flex w-full flex-col overflow-y-auto bg-tarjeta p-6 shadow-flotante sm:w-[400px]"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-[17px] font-bold">Cómo leer este dashboard</h2>
              <button
                ref={botonCerrar}
                type="button"
                onClick={() => setAbierto(false)}
                aria-label="Cerrar"
                className="flex size-10 cursor-pointer items-center justify-center rounded-full hover:bg-fondo"
              >
                <IconoCerrar tamano={18} />
              </button>
            </div>
            <ol className="mt-4 space-y-4">
              {PUNTOS.map((punto) => (
                <li key={punto.titulo}>
                  <p className="text-sm font-semibold">{punto.titulo}</p>
                  <p className="mt-0.5 text-[13px] leading-relaxed text-tenue">{punto.texto}</p>
                </li>
              ))}
            </ol>
            <ul className="mt-5 space-y-2 border-t border-linea pt-4">
              {COLORES.map((color) => (
                <li key={color.texto} className="flex items-center gap-2 text-[13px] font-medium">
                  <span aria-hidden className={`size-2.5 rounded-[3px] ${color.clase}`} />
                  {color.texto}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
