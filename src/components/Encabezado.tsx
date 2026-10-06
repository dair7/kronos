"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useCaso } from "./ProveedorCaso";
import { Boton } from "./ui/Boton";
import { ModalConfirmacion } from "./ui/Modal";
import { Aviso } from "./ui/Aviso";

type Confirmacion = "espitia" | "panaderia" | "nuevo" | null;

export function Encabezado() {
  const { caso, montado, cargarEspitia, cargarPanaderia, nuevoCaso, guardarArchivo, abrirArchivo } =
    useCaso();
  const [confirmacion, setConfirmacion] = useState<Confirmacion>(null);
  const [errorArchivo, setErrorArchivo] = useState<string | null>(null);
  const entradaArchivo = useRef<HTMLInputElement>(null);

  const alAbrirArchivo = async (archivo: File | undefined) => {
    if (!archivo) return;
    const error = await abrirArchivo(archivo);
    setErrorArchivo(error);
    if (entradaArchivo.current) entradaArchivo.current.value = "";
  };

  const confirmar = () => {
    if (confirmacion === "espitia") cargarEspitia();
    if (confirmacion === "panaderia") cargarPanaderia();
    if (confirmacion === "nuevo") nuevoCaso();
    setConfirmacion(null);
    setErrorArchivo(null);
  };

  return (
    <>
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-dorado-400 focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-marino-950"
      >
        Saltar al contenido
      </a>

      <header className="sin-impresion border-b border-marino-800 bg-marino-900 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
          <div className="flex min-w-0 items-center gap-3">
            <Link href="/" className="flex shrink-0 items-center gap-2.5">
              <span
                aria-hidden
                className="flex size-9 items-center justify-center rounded-lg border border-dorado-400/60 bg-marino-800 text-base font-bold text-dorado-300"
              >
                K
              </span>
              <span className="leading-tight">
                <span className="block text-base font-semibold tracking-wide">KRONOS</span>
                <span className="block text-[0.7rem] text-marino-300">
                  Evaluación económica de inversiones
                </span>
              </span>
            </Link>
            {montado && caso.negocio.nombre && (
              <p className="hidden min-w-0 border-l border-marino-700 pl-3 text-xs text-marino-200 sm:block">
                <span className="block text-marino-400">Caso actual</span>
                <span className="block truncate font-medium text-white">{caso.negocio.nombre}</span>
              </p>
            )}
          </div>

          {/* En celular la barra de acciones se desplaza horizontalmente
              dentro de su contenedor, sin provocar scroll de la pagina. */}
          <nav
            aria-label="Acciones del caso"
            className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:overflow-visible lg:px-0 lg:pb-0"
          >
            <Boton
              tamano="pequeno"
              variante="secundario"
              className="shrink-0"
              onClick={() => setConfirmacion("espitia")}
            >
              Caso Espitia
            </Boton>
            <Boton
              tamano="pequeno"
              variante="secundario"
              className="shrink-0"
              onClick={() => setConfirmacion("panaderia")}
            >
              Caso de ejemplo
            </Boton>
            <Boton
              tamano="pequeno"
              variante="secundario"
              className="shrink-0"
              onClick={() => setConfirmacion("nuevo")}
            >
              Nuevo caso
            </Boton>
            <Boton
              tamano="pequeno"
              variante="secundario"
              className="shrink-0"
              onClick={guardarArchivo}
            >
              Guardar caso
            </Boton>
            <Boton
              tamano="pequeno"
              variante="acento"
              className="shrink-0"
              onClick={() => entradaArchivo.current?.click()}
            >
              Abrir caso
            </Boton>
            <input
              ref={entradaArchivo}
              type="file"
              accept="application/json,.json"
              className="sr-only"
              aria-label="Abrir un archivo de caso de KRONOS"
              onChange={(evento) => alAbrirArchivo(evento.target.files?.[0])}
            />
          </nav>
        </div>
      </header>

      {errorArchivo && (
        <div className="sin-impresion mx-auto max-w-7xl px-4 pt-4">
          <Aviso tono="peligro" titulo="No se pudo abrir el archivo">
            {errorArchivo}
          </Aviso>
        </div>
      )}

      {montado && caso.aviso && (
        <div className="mx-auto max-w-7xl px-4 pt-4">
          <Aviso tono="alerta" titulo="Caso de ejemplo">
            {caso.aviso}
          </Aviso>
        </div>
      )}

      <ModalConfirmacion
        abierto={confirmacion !== null}
        titulo={
          confirmacion === "nuevo"
            ? "Crear un caso nuevo"
            : confirmacion === "panaderia"
              ? "Cargar el caso de ejemplo"
              : "Cargar el caso de Espitia Barber Shop"
        }
        textoConfirmar={confirmacion === "nuevo" ? "Sí, empezar de cero" : "Sí, cargar el caso"}
        onConfirmar={confirmar}
        onCancelar={() => setConfirmacion(null)}
      >
        <p>
          Se reemplazarán todos los datos que tiene cargados ahora mismo y esta acción no se puede
          deshacer.
        </p>
        <p className="mt-2">
          Si quiere conservarlos, cancele y use primero el botón <strong>Guardar caso</strong> para
          descargarlos como archivo.
        </p>
      </ModalConfirmacion>
    </>
  );
}
