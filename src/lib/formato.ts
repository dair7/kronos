/**
 * Capa de formato de KRONOS.
 *
 * Centraliza la presentacion de numeros para que todo el software use el mismo
 * formato: pesos colombianos, porcentajes con coma decimal y periodos de tiempo.
 * La guia del TCC exige formato consistente y unidades visibles en todas las
 * etiquetas, por eso ninguna pantalla debe formatear numeros por su cuenta.
 *
 * Regla importante: aqui solo se redondea para MOSTRAR. Los calculos de
 * lib/calculos.ts siempre trabajan con precision completa.
 */

const formateadorPesos = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const formateadorPesosDecimales = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Pesos colombianos sin decimales: 8300000 -> "$ 8.300.000" */
export function pesos(valor: number | null | undefined): string {
  if (valor === null || valor === undefined || !Number.isFinite(valor)) return "—";
  return formateadorPesos.format(valor);
}

/** Pesos con dos decimales, para valores unitarios: 18333.3333 -> "$ 18.333,33" */
export function pesosDecimales(valor: number | null | undefined): string {
  if (valor === null || valor === undefined || !Number.isFinite(valor)) return "—";
  return formateadorPesosDecimales.format(valor);
}

/** Porcentaje con un decimal y coma: 1.716099 -> "171,6 %" (recibe la tasa ya en %) */
export function porcentaje(valor: number | null | undefined, decimales = 1): string {
  if (valor === null || valor === undefined || !Number.isFinite(valor)) return "—";
  return (
    valor.toLocaleString("es-CO", {
      minimumFractionDigits: decimales,
      maximumFractionDigits: decimales,
    }) + " %"
  );
}

/** Numero entero con separador de miles: 4050 -> "4.050" */
export function numero(valor: number | null | undefined, decimales = 0): string {
  if (valor === null || valor === undefined || !Number.isFinite(valor)) return "—";
  return valor.toLocaleString("es-CO", {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  });
}

/**
 * Periodo de recuperacion en meses con un decimal: 9.468 -> "9,5 meses".
 * Si supera los 24 meses se muestra en anios, porque "31,2 meses" se lee peor
 * que "2,6 anios".
 */
export function meses(valor: number | null | undefined): string {
  if (valor === null || valor === undefined || !Number.isFinite(valor)) {
    return "No se recupera en el periodo evaluado";
  }
  if (valor > 24) {
    const anios = valor / 12;
    return `${numero(anios, 1)} ${anios === 1 ? "año" : "años"}`;
  }
  return `${numero(valor, 1)} ${valor === 1 ? "mes" : "meses"}`;
}

/**
 * Mes calendario durante el cual ocurre la recuperacion.
 * 9.47 meses significa que el acumulado cruza la inversion DURANTE el mes 10.
 */
export function mesDeRecuperacion(valor: number | null | undefined): string | null {
  if (valor === null || valor === undefined || !Number.isFinite(valor)) return null;
  return `durante el mes ${Math.ceil(valor)}`;
}

/** Etiqueta corta para los ejes de las graficas: 13912500 -> "$13,9 M" */
export function pesosCompactos(valor: number): string {
  if (!Number.isFinite(valor)) return "—";
  const signo = valor < 0 ? "-" : "";
  const abs = Math.abs(valor);
  if (abs >= 1_000_000) return `${signo}$${numero(abs / 1_000_000, 1)} M`;
  if (abs >= 1_000) return `${signo}$${numero(abs / 1_000, 0)} mil`;
  return `${signo}$${numero(abs, 0)}`;
}
