import type { ErrorValidacion } from "@/lib/calculos";
import type { Caso, Pantalla } from "@/lib/datos";

export type EstadoPaso = "completo" | "pendiente" | "error";

/** Servicios con nombre y precio: las filas vacias no cuentan. */
export function serviciosValidos(caso: Caso) {
  return caso.servicios.filter(
    (servicio) => servicio.nombre.trim() !== "" && typeof servicio.precio === "number",
  );
}

/**
 * Estado de un paso en el menu:
 * - "error" (rojo) solo si le faltan datos Y el usuario ya intento avanzar
 *   desde el o entro a Resultados;
 * - "pendiente" (circulo gris) si le faltan datos pero aun no se han revisado,
 *   o si es el catalogo de servicios (opcional) y no tiene ningun servicio;
 * - "completo" en cualquier otro caso.
 */
export function estadoPaso(
  caso: Caso,
  errores: ErrorValidacion[],
  revisados: ReadonlySet<Pantalla>,
  paso: Pantalla,
): EstadoPaso {
  const faltan = errores.some((error) => error.pantalla === paso);
  if (faltan) return revisados.has(paso) ? "error" : "pendiente";
  if (paso === "servicios" && serviciosValidos(caso).length === 0) return "pendiente";
  return "completo";
}
