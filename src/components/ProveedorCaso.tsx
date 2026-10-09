"use client";

/**
 * Estado global del caso que se esta evaluando.
 *
 * El caso se lee del almacen del navegador (lib/almacen.ts) con
 * useSyncExternalStore: durante el render del servidor y la hidratacion se usa
 * el caso por defecto, y en cuanto hay navegador se cambia por lo que haya
 * guardado el usuario. De este modo nunca hay error de hidratacion.
 */

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  CASO_ESPITIA,
  CASO_PANADERIA,
  casoVacio,
  clonarCaso,
  nombreArchivo,
  validarArchivo,
  type Caso,
  type Pantalla,
} from "@/lib/datos";
import {
  argumentosMontado,
  guardarCaso,
  obtenerCaso,
  obtenerCasoDelServidor,
  suscribir,
} from "@/lib/almacen";

interface ContextoCaso {
  caso: Caso;
  /** Pantalla de captura visible. Vive aqui para que el dashboard pueda
   *  enviar al usuario directamente a la pantalla que tiene errores. */
  pasoActivo: Pantalla;
  setPasoActivo: (paso: Pantalla) => void;
  /**
   * Pasos cuyos errores ya se le muestran al usuario. Un paso con datos
   * faltantes se ve como "pendiente" (gris) hasta que el usuario intenta
   * avanzar con "Siguiente" desde el o entra a Resultados; solo entonces se
   * marca en rojo.
   */
  pasosRevisados: ReadonlySet<Pantalla>;
  revisarPaso: (paso: Pantalla) => void;
  revisarTodos: () => void;
  /** false mientras se renderiza en el servidor o durante la hidratacion. */
  montado: boolean;
  /** Modifica el caso con una funcion que recibe una copia editable. */
  actualizar: (cambio: (borrador: Caso) => void) => void;
  reemplazar: (caso: Caso) => void;
  cargarEspitia: () => void;
  cargarPanaderia: () => void;
  nuevoCaso: () => void;
  guardarArchivo: () => void;
  /** Devuelve null si todo salio bien, o el mensaje de error si no. */
  abrirArchivo: (archivo: File) => Promise<string | null>;
}

const Contexto = createContext<ContextoCaso | null>(null);

export function ProveedorCaso({ children }: { children: ReactNode }) {
  const caso = useSyncExternalStore(suscribir, obtenerCaso, obtenerCasoDelServidor);
  const montado = useSyncExternalStore(...argumentosMontado);
  const [pasoActivo, setPasoActivo] = useState<Pantalla>("negocio");
  const [pasosRevisados, setPasosRevisados] = useState<ReadonlySet<Pantalla>>(() => new Set());

  const revisarPaso = useCallback(
    (paso: Pantalla) =>
      setPasosRevisados((actual) => (actual.has(paso) ? actual : new Set(actual).add(paso))),
    [],
  );
  const revisarTodos = useCallback(
    () =>
      setPasosRevisados(
        new Set<Pantalla>(["negocio", "servicios", "inversion", "personal", "proyeccion", "parametros"]),
      ),
    [],
  );
  // Al cargar o crear otro caso, la revision empieza de nuevo.
  const cambiarCaso = useCallback((nuevo: Caso) => {
    setPasosRevisados(new Set());
    guardarCaso(nuevo);
  }, []);

  const actualizar = useCallback((cambio: (borrador: Caso) => void) => {
    const borrador = clonarCaso(obtenerCaso());
    cambio(borrador);
    guardarCaso(borrador);
  }, []);

  const reemplazar = useCallback((nuevo: Caso) => guardarCaso(clonarCaso(nuevo)), []);

  const guardarArchivo = useCallback(() => {
    const contenido = JSON.stringify(obtenerCaso(), null, 2);
    const blob = new Blob([contenido], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = nombreArchivo(obtenerCaso());
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
    URL.revokeObjectURL(url);
  }, []);

  const abrirArchivo = useCallback(async (archivo: File) => {
    const texto = await archivo.text();
    const resultado = validarArchivo(texto);
    if (!resultado.ok) return resultado.error;
    cambiarCaso(resultado.valor);
    return null;
  }, [cambiarCaso]);

  const valor = useMemo<ContextoCaso>(
    () => ({
      caso,
      montado,
      pasoActivo,
      setPasoActivo,
      pasosRevisados,
      revisarPaso,
      revisarTodos,
      actualizar,
      reemplazar,
      cargarEspitia: () => cambiarCaso(clonarCaso(CASO_ESPITIA)),
      cargarPanaderia: () => cambiarCaso(clonarCaso(CASO_PANADERIA)),
      nuevoCaso: () => cambiarCaso(casoVacio()),
      guardarArchivo,
      abrirArchivo,
    }),
    [
      caso,
      montado,
      pasoActivo,
      pasosRevisados,
      revisarPaso,
      revisarTodos,
      cambiarCaso,
      actualizar,
      reemplazar,
      guardarArchivo,
      abrirArchivo,
    ],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useCaso(): ContextoCaso {
  const contexto = useContext(Contexto);
  if (!contexto) {
    throw new Error("useCaso debe usarse dentro de <ProveedorCaso>.");
  }
  return contexto;
}
