"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { useCaso } from "./ProveedorCaso";
import { MenuLateral } from "./MenuLateral";
import { Aviso } from "./ui/Aviso";
import { IconoCerrar, IconoLogo, IconoMenu } from "./ui/Iconos";

/**
 * Estructura comun de las pantallas de la aplicacion:
 * - desde 768 px, menu lateral fijo a la izquierda (solo iconos hasta 1023 px,
 *   completo de 240 px desde 1024 px);
 * - en celular, barra superior con el nombre del caso y un boton que abre el
 *   menu como panel.
 * La bienvenida ("/") se muestra sin menu: es la portada del producto.
 */
export function Marco({ children }: { children: ReactNode }) {
  const ruta = usePathname();
  const { caso, montado } = useCaso();
  const [panelAbierto, setPanelAbierto] = useState(false);
  const [errorArchivo, setErrorArchivo] = useState<string | null>(null);

  useEffect(() => {
    if (!panelAbierto) return;
    const alTecla = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") setPanelAbierto(false);
    };
    document.addEventListener("keydown", alTecla);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", alTecla);
      document.body.style.overflow = "";
    };
  }, [panelAbierto]);

  if (ruta === "/") return <>{children}</>;

  return (
    <div className="min-h-screen">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[70] focus:rounded-full focus:bg-tinta focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Saltar al contenido
      </a>

      {/* Menu lateral fijo (tablet y computador) */}
      <aside className="sin-impresion fixed inset-y-0 left-0 z-40 hidden w-[72px] flex-col overflow-y-auto bg-tarjeta px-3 pt-1 pb-4 md:flex lg:w-60 lg:px-4">
        <MenuLateral onErrorArchivo={setErrorArchivo} />
      </aside>

      {/* Barra superior (celular) */}
      <header className="sin-impresion sticky top-0 z-40 flex h-14 items-center gap-3 bg-tarjeta/95 px-4 shadow-tarjeta backdrop-blur md:hidden">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-tinta text-white">
          <IconoLogo tamano={16} />
        </span>
        <div className="min-w-0 flex-1 leading-tight">
          <p className="truncate text-sm font-bold">
            {montado ? caso.negocio.nombre.trim() || "Caso sin nombre" : "KRONOS"}
          </p>
          <p className="truncate text-[11px] font-medium text-tenue">
            {montado ? caso.negocio.ubicacion || "Caso actual" : " "}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setPanelAbierto(true)}
          aria-label="Abrir el menú"
          aria-expanded={panelAbierto}
          className="flex size-10 cursor-pointer items-center justify-center rounded-full border border-linea"
        >
          <IconoMenu tamano={18} />
        </button>
      </header>

      {/* Panel del menu en celular */}
      {panelAbierto && (
        <div className="sin-impresion fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-tinta/40" onClick={() => setPanelAbierto(false)} />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Menú"
            className="absolute inset-y-0 left-0 flex w-[280px] max-w-[85vw] flex-col overflow-y-auto bg-tarjeta px-4 pt-1 pb-4 shadow-flotante"
          >
            <button
              type="button"
              onClick={() => setPanelAbierto(false)}
              aria-label="Cerrar el menú"
              className="absolute top-3 right-3 flex size-10 cursor-pointer items-center justify-center rounded-full hover:bg-fondo"
            >
              <IconoCerrar tamano={18} />
            </button>
            <MenuLateral
              expandido
              onNavegar={() => setPanelAbierto(false)}
              onErrorArchivo={setErrorArchivo}
            />
          </div>
        </div>
      )}

      <main
        id="contenido"
        className="contenido-principal px-4 pt-4 pb-10 md:ml-[72px] md:px-6 md:pt-5 lg:ml-60"
      >
        {(errorArchivo || (montado && caso.aviso)) && (
          <div className="sin-impresion mb-4 space-y-3">
            {errorArchivo && (
              <Aviso tono="peligro" titulo="No se pudo abrir el archivo">
                {errorArchivo}
              </Aviso>
            )}
            {montado && caso.aviso && (
              <Aviso tono="alerta" titulo="Caso de ejemplo">
                {caso.aviso}
              </Aviso>
            )}
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
