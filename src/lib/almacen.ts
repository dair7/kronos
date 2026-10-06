/**
 * Almacenamiento del caso en el navegador.
 *
 * El caso vive en localStorage, que es un dato EXTERNO a React: el servidor no
 * puede leerlo. Por eso se expone como un almacen suscribible y los componentes
 * lo consumen con useSyncExternalStore, que durante la hidratacion usa la
 * version del servidor y despues cambia a la del navegador. Asi no hay error de
 * hidratacion ni hace falta leer localStorage dentro de un efecto.
 */

import { CASO_ESPITIA, clonarCaso, validarArchivo, type Caso } from "./datos";

const CLAVE_CASO = "kronos:caso";
const CLAVE_TOUR = "kronos:tour-visto";

/** Lo que ve el servidor mientras no hay navegador: el caso real precargado. */
const CASO_DEL_SERVIDOR: Caso = CASO_ESPITIA;

const oyentes = new Set<() => void>();

let casoEnMemoria: Caso | null = null;
let tourVistoEnMemoria: boolean | null = null;

function avisar() {
  oyentes.forEach((oyente) => oyente());
}

function leerCasoDelNavegador(): Caso {
  try {
    const guardado = window.localStorage.getItem(CLAVE_CASO);
    if (guardado) {
      const resultado = validarArchivo(guardado);
      if (resultado.ok) return resultado.valor;
    }
  } catch {
    // Si el navegador bloquea el almacenamiento se trabaja solo en memoria.
  }
  return clonarCaso(CASO_ESPITIA);
}

/** Suscribe un componente a los cambios del almacen. */
export function suscribir(oyente: () => void): () => void {
  oyentes.add(oyente);
  return () => {
    oyentes.delete(oyente);
  };
}

/**
 * Caso vigente en el navegador. Devuelve siempre la misma referencia mientras
 * no haya cambios, como exige useSyncExternalStore.
 */
export function obtenerCaso(): Caso {
  if (casoEnMemoria === null) casoEnMemoria = leerCasoDelNavegador();
  return casoEnMemoria;
}

/** Caso que se usa al renderizar en el servidor y durante la hidratacion. */
export function obtenerCasoDelServidor(): Caso {
  return CASO_DEL_SERVIDOR;
}

/** Reemplaza el caso, lo persiste y avisa a los componentes suscritos. */
export function guardarCaso(caso: Caso): void {
  casoEnMemoria = caso;
  try {
    window.localStorage.setItem(CLAVE_CASO, JSON.stringify(caso));
  } catch {
    // Sin almacenamiento la aplicacion sigue funcionando durante la sesion.
  }
  avisar();
}

// --- Preferencia del recorrido guiado del dashboard --------------------------

export function obtenerTourVisto(): boolean {
  if (tourVistoEnMemoria === null) {
    try {
      tourVistoEnMemoria = window.localStorage.getItem(CLAVE_TOUR) === "si";
    } catch {
      tourVistoEnMemoria = true; // Sin almacenamiento, no se insiste con el aviso.
    }
  }
  return tourVistoEnMemoria;
}

/** En el servidor se asume visto, para no mostrarlo y luego esconderlo. */
export function obtenerTourVistoDelServidor(): boolean {
  return true;
}

export function marcarTourVisto(): void {
  tourVistoEnMemoria = true;
  try {
    window.localStorage.setItem(CLAVE_TOUR, "si");
  } catch {
    // La preferencia solo dura esta sesion.
  }
  avisar();
}

// --- Utilidad ----------------------------------------------------------------

const sinSuscripcion = () => () => {};

/**
 * Indica si el componente ya se esta ejecutando en el navegador. Sirve para no
 * mostrar resultados calculados antes de leer los datos guardados.
 */
export const argumentosMontado = [sinSuscripcion, () => true, () => false] as const;
