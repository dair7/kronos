"use client";

import Link from "next/link";
import type { ComponentPropsWithRef, ReactNode } from "react";

type Variante = "primario" | "secundario" | "fantasma" | "peligro";
type Tamano = "normal" | "pequeno";

const VARIANTES: Record<Variante, string> = {
  primario: "bg-tinta text-white hover:bg-tinta/85 active:bg-tinta",
  secundario: "bg-tarjeta text-tinta border border-linea hover:bg-fondo active:bg-linea/60",
  fantasma: "bg-transparent text-tinta hover:bg-fondo active:bg-linea/60",
  peligro:
    "bg-tarjeta text-negativo-texto border border-linea hover:bg-negativo-suave active:bg-negativo-suave",
};

const TAMANOS: Record<Tamano, string> = {
  // 44 px y 40 px de alto: tamano tactil minimo de la guia.
  normal: "h-11 px-5 text-sm",
  pequeno: "h-10 px-4 text-[13px]",
};

export function clasesBoton(variante: Variante, tamano: Tamano, extra?: string) {
  return [
    "inline-flex shrink-0 items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap",
    "transition-colors duration-150 cursor-pointer",
    "disabled:cursor-not-allowed disabled:opacity-40",
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

/** Boton en forma de pildora: primario negro, secundario blanco con borde. */
export function Boton({
  variante = "primario",
  tamano = "normal",
  className,
  children,
  ...resto
}: PropsBoton) {
  return (
    <button type="button" className={clasesBoton(variante, tamano, className)} {...resto}>
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
    <Link href={href} className={clasesBoton(variante, tamano, className)}>
      {children}
    </Link>
  );
}
