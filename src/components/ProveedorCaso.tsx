"use client";

/**
 * Estado global del caso que se esta evaluando.
 *
 * Guarda el caso en localStorage del navegador, pero SOLO desde el cliente
 * (dentro de useEffect). Si se leyera durante el render, el HTML del servidor
 * y el del navegador no coincidirian y Next.js lanzaria un error de
 * hidratacion.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
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

const CLAVE_CASO = "kronos:caso";

interface ContextoCaso {
  caso: Caso;
  /** Pantalla de captura visible. Vive aqui para que el dashboard pueda
   *  enviar al usuario directamente a la pantalla que tiene errores. */
  pasoActivo: Pantalla;
  setPasoActivo: (paso: Pantalla) => void;
  /** false hasta que el navegador termina de leer localStorage. */
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
  const [caso, setCaso] = useState<Caso>(() => clonarCaso(CASO_ESPITIA));
  const [montado, setMontado] = useState(false);
  const [pasoActivo, setPasoActivo] = useState<Pantalla>("negocio");

  // Lectura inicial de localStorage: solo en el cliente, despues del montaje.
  useEffect(() => {
    try {
      const guardado = window.localStorage.getItem(CLAVE_CASO);
      if (guardado) {
        const resultado = validarArchivo(guardado);
        if (resultado.ok) setCaso(resultado.valor);
      }
    } catch {
      // Si el navegador bloquea localStorage se sigue con el caso por defecto.
    }
    setMontado(true);
  }, []);

  // Cada cambio se persiste, para que el usuario no pierda lo que escribio.
  useEffect(() => {
    if (!montado) return;
    try {
      window.localStorage.setItem(CLAVE_CASO, JSON.stringify(caso));
    } catch {
      // Sin almacenamiento disponible la aplicacion sigue funcionando en memoria.
    }
  }, [caso, montado]);

  const actualizar = useCallback((cambio: (borrador: Caso) => void) => {
    setCaso((anterior) => {
      const borrador = clonarCaso(anterior);
      cambio(borrador);
      return borrador;
    });
  }, []);

  const reemplazar = useCallback((nuevo: Caso) => setCaso(clonarCaso(nuevo)), []);

  const guardarArchivo = useCallback(() => {
    const contenido = JSON.stringify(caso, null, 2);
    const blob = new Blob([contenido], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = nombreArchivo(caso);
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
    URL.revokeObjectURL(url);
  }, [caso]);

  const abrirArchivo = useCallback(async (archivo: File) => {
    const texto = await archivo.text();
    const resultado = validarArchivo(texto);
    if (!resultado.ok) return resultado.error;
    setCaso(resultado.valor);
    return null;
  }, []);

  const valor = useMemo<ContextoCaso>(
    () => ({
      caso,
      montado,
      pasoActivo,
      setPasoActivo,
      actualizar,
      reemplazar,
      cargarEspitia: () => setCaso(clonarCaso(CASO_ESPITIA)),
      cargarPanaderia: () => setCaso(clonarCaso(CASO_PANADERIA)),
      nuevoCaso: () => setCaso(casoVacio()),
      guardarArchivo,
      abrirArchivo,
    }),
    [caso, montado, pasoActivo, actualizar, reemplazar, guardarArchivo, abrirArchivo],
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
