"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useCaso } from "./ProveedorCaso";
import { PASOS } from "./pasos";
import { ModalConfirmacion } from "./ui/Modal";
import {
  IconoAbrir,
  IconoAgregar,
  IconoCheck,
  IconoDocumento,
  IconoEstrella,
  IconoGuardar,
  IconoLogo,
  IconoMas,
  IconoResultados,
} from "./ui/Iconos";
import { validar } from "@/lib/calculos";
import { estadoPaso, type EstadoPaso } from "./estadoPasos";
import type { Pantalla } from "@/lib/datos";

type Confirmacion = "espitia" | "panaderia" | "nuevo" | null;

/**
 * Contenido del menu lateral: logo, caso actual, los 7 pasos con su estado y
 * las acciones del caso. Se usa en dos lugares:
 * - fijo a la izquierda (solo iconos entre 768 y 1023 px, completo desde 1024 px);
 * - dentro del panel que se abre desde la barra superior en celular
 *   (`expandido`, siempre con textos).
 */
export function MenuLateral({
  expandido = false,
  onNavegar,
  onErrorArchivo,
}: {
  expandido?: boolean;
  /** Se llama despues de navegar, para cerrar el panel en celular. */
  onNavegar?: () => void;
  onErrorArchivo: (error: string | null) => void;
}) {
  const router = useRouter();
  const ruta = usePathname();
  const {
    caso,
    montado,
    pasoActivo,
    setPasoActivo,
    pasosRevisados,
    cargarEspitia,
    cargarPanaderia,
    nuevoCaso,
    guardarArchivo,
    abrirArchivo,
  } = useCaso();
  const [confirmacion, setConfirmacion] = useState<Confirmacion>(null);
  const [masAbierto, setMasAbierto] = useState(false);
  const entradaArchivo = useRef<HTMLInputElement>(null);
  const cajaMas = useRef<HTMLDivElement>(null);

  // Clases literales para que Tailwind las detecte: en modo compacto los
  // textos solo aparecen desde 1024 px.
  const texto = expandido ? "inline" : "hidden lg:inline";
  const bloque = expandido ? "block" : "hidden lg:block";
  const fila = expandido ? "justify-start px-3" : "justify-center px-0 lg:justify-start lg:px-3";

  const errores = useMemo(() => (montado ? validar(caso) : []), [caso, montado]);
  const erroresPorPantalla = useMemo(() => {
    const conteo: Partial<Record<Pantalla, number>> = {};
    errores.forEach((error) => {
      conteo[error.pantalla] = (conteo[error.pantalla] ?? 0) + 1;
    });
    return conteo;
  }, [errores]);

  useEffect(() => {
    if (!masAbierto) return;
    const alClic = (evento: MouseEvent) => {
      if (!cajaMas.current?.contains(evento.target as Node)) setMasAbierto(false);
    };
    const alTecla = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") setMasAbierto(false);
    };
    document.addEventListener("mousedown", alClic);
    document.addEventListener("keydown", alTecla);
    return () => {
      document.removeEventListener("mousedown", alClic);
      document.removeEventListener("keydown", alTecla);
    };
  }, [masAbierto]);

  const irAPaso = (paso: Pantalla) => {
    setPasoActivo(paso);
    if (ruta !== "/evaluar") router.push("/evaluar");
    window.scrollTo({ top: 0 });
    onNavegar?.();
  };

  const alAbrirArchivo = async (archivo: File | undefined) => {
    if (!archivo) return;
    const error = await abrirArchivo(archivo);
    onErrorArchivo(error);
    if (entradaArchivo.current) entradaArchivo.current.value = "";
    if (!error) onNavegar?.();
  };

  const confirmar = () => {
    if (confirmacion === "espitia") cargarEspitia();
    if (confirmacion === "panaderia") cargarPanaderia();
    if (confirmacion === "nuevo") {
      nuevoCaso();
      setPasoActivo("negocio");
      router.push("/evaluar");
    }
    setConfirmacion(null);
    onErrorArchivo(null);
    onNavegar?.();
  };

  const enResultados = ruta === "/resultados";
  const nombreCaso = caso.negocio.nombre.trim() || "Caso sin nombre";

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <Link
        href="/"
        onClick={onNavegar}
        className={`flex h-16 shrink-0 items-center gap-2.5 ${expandido ? "px-2" : "justify-center lg:justify-start lg:px-2"}`}
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-tinta text-white">
          <IconoLogo tamano={18} />
        </span>
        <span className={`${texto} leading-tight`}>
          <span className="block text-[16px] font-extrabold tracking-[0.08em]">KRONOS</span>
          <span className="block text-[11px] font-medium text-tenue">Evaluación de inversiones</span>
        </span>
      </Link>

      {/* Caso actual */}
      <div className={`${bloque} mt-2 rounded-2xl bg-fondo px-3.5 py-3`}>
        <p className="text-[11px] font-medium text-tenue">Caso actual</p>
        <p className="mt-0.5 truncate text-sm font-bold" title={nombreCaso}>
          {montado ? nombreCaso : " "}
        </p>
        <p className="truncate text-[12px] font-medium text-tenue">
          {montado ? caso.negocio.ubicacion || "Sin ubicación" : " "}
        </p>
      </div>

      {/* Pasos */}
      <nav aria-label="Pasos del caso" className="mt-5 flex-1">
        <p className={`${bloque} mb-1.5 px-3 text-[11px] font-semibold tracking-wide text-tenue uppercase`}>
          Pasos
        </p>
        <ul className="space-y-0.5">
          {PASOS.map((paso) => {
            const activo = ruta === "/evaluar" && paso.id === pasoActivo;
            const cantidad = montado ? (erroresPorPantalla[paso.id] ?? 0) : 0;
            const estado: EstadoPaso | null = montado
              ? estadoPaso(caso, errores, pasosRevisados, paso.id)
              : null;
            return (
              <li key={paso.id}>
                <ItemMenu
                  titulo={paso.titulo}
                  icono={<paso.icono tamano={18} />}
                  activo={activo}
                  errores={estado === "error" ? cantidad : 0}
                  estado={estado}
                  texto={texto}
                  fila={fila}
                  onClick={() => irAPaso(paso.id)}
                />
              </li>
            );
          })}
          <li>
            <ItemMenu
              titulo="Resultados"
              icono={<IconoResultados tamano={18} />}
              activo={enResultados}
              errores={0}
              estado={montado ? (errores.length === 0 ? "completo" : "pendiente") : null}
              texto={texto}
              fila={fila}
              onClick={() => {
                router.push("/resultados");
                onNavegar?.();
              }}
            />
          </li>
        </ul>
      </nav>

      {/* Acciones del caso */}
      <div className="mt-4 space-y-0.5 border-t border-linea pt-3">
        <BotonMenu
          titulo="Caso Espitia"
          icono={<IconoEstrella tamano={18} />}
          texto={texto}
          fila={fila}
          onClick={() => setConfirmacion("espitia")}
        />
        <BotonMenu
          titulo="Guardar caso"
          icono={<IconoGuardar tamano={18} />}
          texto={texto}
          fila={fila}
          onClick={guardarArchivo}
        />
        <BotonMenu
          titulo="Abrir caso"
          icono={<IconoAbrir tamano={18} />}
          texto={texto}
          fila={fila}
          onClick={() => entradaArchivo.current?.click()}
        />
        <div ref={cajaMas} className="relative">
          <BotonMenu
            titulo="Más"
            icono={<IconoMas tamano={18} />}
            texto={texto}
            fila={fila}
            aria-haspopup="menu"
            aria-expanded={masAbierto}
            onClick={() => setMasAbierto((abierto) => !abierto)}
          />
          {masAbierto && (
            <div
              role="menu"
              className={`aparecer absolute bottom-full z-50 mb-2 w-52 rounded-2xl bg-tarjeta p-1.5 shadow-flotante ${expandido ? "left-0" : "left-full ml-2 lg:left-0 lg:ml-0"}`}
            >
              <ItemMas
                icono={<IconoDocumento tamano={16} />}
                onClick={() => {
                  setMasAbierto(false);
                  setConfirmacion("panaderia");
                }}
              >
                Caso de ejemplo
              </ItemMas>
              <ItemMas
                icono={<IconoAgregar tamano={16} />}
                onClick={() => {
                  setMasAbierto(false);
                  setConfirmacion("nuevo");
                }}
              >
                Nuevo caso
              </ItemMas>
            </div>
          )}
        </div>
        <input
          ref={entradaArchivo}
          type="file"
          accept="application/json,.json"
          className="sr-only"
          tabIndex={-1}
          aria-label="Abrir un archivo de caso de KRONOS"
          onChange={(evento) => alAbrirArchivo(evento.target.files?.[0])}
        />
      </div>

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
          Si quiere conservarlos, cancele y use primero <strong className="text-tinta">Guardar caso</strong>{" "}
          para descargarlos como archivo.
        </p>
      </ModalConfirmacion>
    </div>
  );
}

// ---------------------------------------------------------------------------

function ItemMenu({
  titulo,
  icono,
  activo,
  errores,
  estado,
  texto,
  fila,
  onClick,
}: {
  titulo: string;
  icono: ReactNode;
  activo: boolean;
  errores: number;
  estado: EstadoPaso | null;
  texto: string;
  fila: string;
  onClick: () => void;
}) {
  const descripcionEstado =
    errores > 0
      ? `${errores} ${errores === 1 ? "dato por completar" : "datos por completar"}`
      : (estado ?? undefined);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={activo ? "step" : undefined}
      title={titulo}
      className={[
        "relative flex h-10 w-full cursor-pointer items-center gap-3 rounded-full text-[14px] font-semibold transition-colors duration-150",
        fila,
        activo ? "bg-tinta text-white" : "text-tinta/80 hover:bg-fondo hover:text-tinta",
      ].join(" ")}
    >
      <span className="relative flex size-5 shrink-0 items-center justify-center">
        {icono}
        {/* En modo solo iconos, el estado se marca con un punto sobre el icono */}
        {texto !== "inline" && (errores > 0 || activo) && (
          <span
            aria-hidden
            className={`absolute -top-1 -right-1.5 size-2 rounded-full ring-2 lg:hidden ${
              activo ? "ring-tinta" : "ring-tarjeta"
            } ${errores > 0 ? "bg-negativo" : "bg-acento"}`}
          />
        )}
      </span>
      {texto !== "inline" && <span className="sr-only lg:hidden">{titulo}</span>}
      <span className={`${texto} min-w-0 flex-1 truncate text-left`}>{titulo}</span>
      <span className={`${texto} shrink-0`}>
        {errores > 0 ? (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-negativo px-1.5 text-[11px] font-bold text-white">
            {errores}
          </span>
        ) : activo ? (
          <span className="block size-2 rounded-full bg-acento" />
        ) : estado === "completo" ? (
          <IconoCheck tamano={16} className="text-positivo" />
        ) : estado === "pendiente" ? (
          <span className="block size-3.5 rounded-full border-2 border-contexto" />
        ) : null}
      </span>
      {descripcionEstado && <span className="sr-only">, {descripcionEstado}</span>}
    </button>
  );
}

function BotonMenu({
  titulo,
  icono,
  texto,
  fila,
  ...resto
}: {
  titulo: string;
  icono: ReactNode;
  texto: string;
  fila: string;
} & React.ComponentPropsWithoutRef<"button">) {
  return (
    <button
      type="button"
      title={titulo}
      className={`flex h-10 w-full cursor-pointer items-center gap-3 rounded-full text-[14px] font-semibold text-tinta/80 transition-colors hover:bg-fondo hover:text-tinta ${fila}`}
      {...resto}
    >
      <span className="flex size-5 shrink-0 items-center justify-center">{icono}</span>
      <span className={`${texto} truncate`}>{titulo}</span>
      {texto !== "inline" && <span className="sr-only lg:hidden">{titulo}</span>}
    </button>
  );
}

function ItemMas({
  icono,
  children,
  onClick,
}: {
  icono: ReactNode;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className="flex h-10 w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 text-[13px] font-semibold hover:bg-fondo"
    >
      {icono}
      {children}
    </button>
  );
}
