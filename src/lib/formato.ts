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

/**
 * Formato unico de pesos en toda la aplicacion: el signo $ pegado a la cifra,
 * sin espacio ("$8.300.000", "-$8.300.000"). Intl agrega un espacio duro
 * despues del $; aqui se quita para que todas las cifras se vean iguales.
 */
function sinEspacio(texto: string): string {
  return texto.replace(/\$\s+/u, "$");
}

/** Pesos colombianos sin decimales: 8300000 -> "$8.300.000" */
export function pesos(valor: number | null | undefined): string {
  if (valor === null || valor === undefined || !Number.isFinite(valor)) return "—";
  return sinEspacio(formateadorPesos.format(valor));
}

/** Pesos con dos decimales, para valores unitarios: 18333.3333 -> "$18.333,33" */
export function pesosDecimales(valor: number | null | undefined): string {
  if (valor === null || valor === undefined || !Number.isFinite(valor)) return "—";
  return sinEspacio(formateadorPesosDecimales.format(valor));
}

/** Porcentaje con un decimal y coma: 1.716099 -> "171,6 %" (recibe la tasa ya en %) */
export function porcentaje(valor: number | null | undefined, decimales = 1): string {
  if (valor === null || valor === undefined || !Number.isFinite(valor)) return "—";
  return (
    valor.toLocaleString("es-CO", {
      minimumFractionDigits: decimales,
      maximumFractionDigits: decimales,
    }) + " %" // espacio duro: el % nunca queda solo en otra linea
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

/**
 * Etiqueta de eje con valores redondos: muestra decimales solo si el valor los
 * tiene. 10000000 -> "$10 M", 2500000 -> "$2,5 M", -100000000 -> "-$100 M".
 */
export function pesosEje(valor: number): string {
  if (!Number.isFinite(valor)) return "—";
  const signo = valor < 0 ? "-" : "";
  const abs = Math.abs(valor);
  const corto = (v: number) => numero(v, Number.isInteger(Math.round(v * 10) / 10) ? 0 : 1);
  if (abs >= 1_000_000) return `${signo}$${corto(abs / 1_000_000)} M`;
  if (abs >= 1_000) return `${signo}$${corto(abs / 1_000)} mil`;
  return `${signo}$${numero(abs, 0)}`;
}

/** Singular o plural segun la cantidad: plural(1, "puesto", "puestos") -> "puesto". */
export function plural(cantidad: number | null | undefined, singular: string, plural: string): string {
  return cantidad === 1 ? singular : plural;
}

/**
 * Escala redonda para un eje: devuelve el dominio y las marcas con un paso
 * "redondo" (1, 2, 2,5 o 5 x 10^k) que incluye el minimo, el maximo y el 0.
 */
export function escalaRedonda(minimo: number, maximo: number, marcas = 4): { dominio: [number, number]; marcas: number[] } {
  const bajo = Math.min(0, minimo);
  const alto = Math.max(0, maximo);
  const rango = alto - bajo || 1;
  const crudo = rango / marcas;
  const potencia = Math.pow(10, Math.floor(Math.log10(crudo)));
  const paso = [1, 2, 2.5, 5, 10].map((m) => m * potencia).find((p) => p >= crudo) ?? 10 * potencia;
  const inicio = Math.floor(bajo / paso) * paso;
  const fin = Math.ceil(alto / paso) * paso;
  const lista: number[] = [];
  for (let v = inicio; v <= fin + paso / 2; v += paso) lista.push(Math.round(v / paso) * paso);
  return { dominio: [inicio, fin], marcas: lista };
}
