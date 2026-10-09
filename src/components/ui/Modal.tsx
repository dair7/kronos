"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Boton } from "./Boton";

interface PropsConfirmacion {
  abierto: boolean;
  titulo: string;
  children: ReactNode;
  textoConfirmar: string;
  onConfirmar: () => void;
  onCancelar: () => void;
}

/**
 * Dialogo de confirmacion para las acciones que borran datos
 * ("Caso Espitia" y "Nuevo caso"). Se cierra con Escape y lleva el foco al
 * boton de confirmar al abrirse.
 */
export function ModalConfirmacion({
  abierto,
  titulo,
  children,
  textoConfirmar,
  onConfirmar,
  onCancelar,
}: PropsConfirmacion) {
  const botonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!abierto) return;
    botonRef.current?.focus();
    const alPresionar = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") onCancelar();
    };
    document.addEventListener("keydown", alPresionar);
    return () => document.removeEventListener("keydown", alPresionar);
  }, [abierto, onCancelar]);

  if (!abierto) return null;

  return (
    <div
      className="sin-impresion fixed inset-0 z-[60] flex items-end justify-center bg-tinta/40 p-4 sm:items-center"
      onClick={onCancelar}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        className="aparecer w-full max-w-md rounded-tarjeta bg-tarjeta p-6 shadow-flotante"
        onClick={(evento) => evento.stopPropagation()}
      >
        <h2 className="text-[17px] font-bold">{titulo}</h2>
        <div className="mt-2 text-sm leading-relaxed text-tenue">{children}</div>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Boton variante="secundario" onClick={onCancelar}>
            Cancelar
          </Boton>
          <Boton ref={botonRef} variante="primario" onClick={onConfirmar}>
            {textoConfirmar}
          </Boton>
        </div>
      </div>
    </div>
  );
}
