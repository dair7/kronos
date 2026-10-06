"use client";

import Link from "next/link";
import type { ComponentPropsWithRef, ReactNode } from "react";

type Variante = "primario" | "secundario" | "acento" | "peligro" | "fantasma";
type Tamano = "normal" | "pequeno";

const VARIANTES: Record<Variante, string> = {
  primario:
    "bg-marino-800 text-white border border-marino-800 hover:bg-marino-700 active:bg-marino-900",
  secundario:
    "bg-white text-marino-800 border border-borde hover:bg-marino-50 active:bg-marino-100",
  acento:
    "bg-dorado-400 text-marino-950 border border-dorado-500 hover:bg-dorado-300 active:bg-dorado-500",
  peligro:
    "bg-white text-peligro-700 border border-peligro-200 hover:bg-peligro-50 active:bg-peligro-100",
  fantasma: "bg-transparent text-marino-700 border border-transparent hover:bg-marino-100",
};

const TAMANOS: Record<Tamano, string> = {
  // 44 px de alto minimo: requisito de tamano tactil de la guia.
  normal: "min-h-11 px-4 py-2.5 text-sm",
  pequeno: "min-h-9 px-3 py-1.5 text-xs",
};

function clases(variante: Variante, tamano: Tamano, extra?: string) {
  return [
    "inline-flex items-center justify-center gap-2 rounded-lg font-medium",
    "transition-colors duration-150 cursor-pointer",
    "disabled:cursor-not-allowed disabled:opacity-50",
    VARIANTES[variante],
    TAMANOS[tamano],
    extra ?? "",
  ].join(" ");
}

interface PropsBoton extends ComponentPropsWithRef<"button"> {
  variante?: Variante;
  tamano?: Tamano;
  children: ReactNode;
}

export function Boton({
  variante = "primario",
  tamano = "normal",
  className,
  children,
  ...resto
}: PropsBoton) {
  return (
    <button type="button" className={clases(variante, tamano, className)} {...resto}>
      {children}
    </button>
  );
}

interface PropsEnlaceBoton {
  href: string;
  variante?: Variante;
  tamano?: Tamano;
  className?: string;
  children: ReactNode;
}

/** Mismo aspecto que un boton, pero navega a otra pantalla. */
export function EnlaceBoton({
  href,
  variante = "primario",
  tamano = "normal",
  className,
  children,
}: PropsEnlaceBoton) {
  return (
    <Link href={href} className={clases(variante, tamano, className)}>
      {children}
    </Link>
  );
}
