import type { Pantalla } from "@/lib/datos";

export interface DefinicionPaso {
  id: Pantalla;
  /** Nombre corto para la barra de pasos. */
  titulo: string;
  /** Titulo largo para el encabezado de la pantalla. */
  tituloLargo: string;
  descripcion: string;
}

/** Orden de las pantallas de captura. La barra de pasos lo usa tal cual. */
export const PASOS: DefinicionPaso[] = [
  {
    id: "negocio",
    titulo: "Negocio",
    tituloLargo: "Información del negocio",
    descripcion:
      "Cómo opera el negocio hoy. Con estos datos se calcula cuánto deja en promedio cada cliente.",
  },
  {
    id: "servicios",
    titulo: "Servicios",
    tituloLargo: "Catálogo de servicios",
    descripcion:
      "Los servicios que presta el negocio y sus precios. Es información de contexto: no entra en los cálculos.",
  },
  {
    id: "inversion",
    titulo: "Inversión",
    tituloLargo: "Inversión inicial",
    descripcion: "Todo lo que hay que comprar o adecuar para poner en marcha el proyecto.",
  },
  {
    id: "personal",
    titulo: "Personal y costos",
    tituloLargo: "Personal y costos",
    descripcion:
      "Los costos que aparecen con la inversión: salarios, prestaciones, servicios públicos e insumos.",
  },
  {
    id: "proyeccion",
    titulo: "Proyección",
    tituloLargo: "Proyección de clientes",
    descripcion:
      "Cuántos clientes adicionales espera atender cada mes durante el primer año de operación.",
  },
  {
    id: "parametros",
    titulo: "Parámetros",
    tituloLargo: "Parámetros de evaluación económica",
    descripcion:
      "El horizonte, la rentabilidad mínima exigida y los demás supuestos con los que se evalúa el proyecto.",
  },
];

export function indiceDePaso(paso: Pantalla): number {
  const indice = PASOS.findIndex((p) => p.id === paso);
  return indice === -1 ? 0 : indice;
}
