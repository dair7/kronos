/**
 * Capa de logica economica de KRONOS.
 *
 * Son funciones puras: reciben un caso y devuelven numeros. Este archivo NO
 * importa nada de React y no conoce la interfaz. Toda la evaluacion economica
 * del software ocurre aqui, de modo que las pruebas de tests/ validan el
 * modelo completo sin levantar el navegador.
 *
 * Regla de precision: aqui nunca se redondea un valor intermedio. Redondear el
 * ingreso promedio a 18.333,33 antes de multiplicar cambiaria el VPN en mas de
 * $100.000. El redondeo vive solo en lib/formato.ts, al momento de mostrar.
 */

import type { Caso, Pantalla } from "./datos";

// ---------------------------------------------------------------------------
// Tipos del resultado
// ---------------------------------------------------------------------------

export interface ErrorValidacion {
  pantalla: Pantalla;
  mensaje: string;
}

export interface Derivados {
  /** Ingresos actuales / clientes actuales. */
  ingresoPromedio: number;
  /** Gasto en insumos / clientes actuales. */
  costoVariable: number;
  /** Ingreso promedio - costo variable. */
  margen: number;
  /** Nuevos trabajadores x salario mensual. */
  salarios: number;
  /** Salarios x % de prestaciones. */
  prestaciones: number;
  /** Suma de los otros costos fijos mensuales. */
  otrosCostos: number;
  /** Salarios + prestaciones + otros costos fijos. */
  costosFijosMensuales: number;
  /** Suma de cantidad x precio unitario de la inversion. */
  inversionTotal: number;
  /** Clientes actuales / dias de operacion. */
  clientesPorDia: number | null;
  /** Clientes adicionales minimos para cubrir los costos fijos adicionales. */
  puntoEquilibrio: number | null;
  /** Mayor valor de la proyeccion de 12 meses (capacidad plena). */
  proyeccionMaxima: number;
  /** Suma de los 12 meses de la proyeccion. */
  clientesAnio1: number;
}

export interface FilaFlujo {
  anio: number;
  flujo: number;
  factorDescuento: number;
  valorPresente: number;
  acumulado: number;
}

export interface Resultado {
  derivados: Derivados;
  /** Ingresos adicionales de cada mes del anio 1. */
  ingresosMensuales: number[];
  /** Costos adicionales (variables + fijos) de cada mes del anio 1. */
  costosMensuales: number[];
  /** Flujo neto de cada mes del anio 1. */
  flujosMensuales: number[];
  ingresosAnio1: number;
  costosAnio1: number;
  flujoAnio1: number;
  /** Flujo de caja anual, posiciones 0..vidaUtil. */
  flujosAnuales: number[];
  vpn: number;
  /** TIR como fraccion (1.716 = 171,6 %). null si no hay cambio de signo. */
  tir: number | null;
  /** Meses con decimales hasta recuperar la inversion. null si no se recupera. */
  recuperacionMeses: number | null;
  puntoEquilibrio: number | null;
  tablaFlujo: FilaFlujo[];
  /** Saldo acumulado mes a mes partiendo de -inversion (grafica 4). */
  saldoMensual: { mes: number; saldo: number }[];
}

export interface ResultadoEscenario {
  nombre: string;
  clientes: number;
  /** Proyeccion escalada y redondeada a enteros. */
  proyeccion: number[];
  /** Diferencia entre los clientes del escenario y el punto de equilibrio. */
  distanciaEquilibrio: number | null;
  sobreEquilibrio: boolean | null;
  ingresosAnio1: number;
  costosAnio1: number;
  flujoAnio1: number;
  vpn: number;
  tir: number | null;
  recuperacionMeses: number | null;
  /** Flujo acumulado por anio, para la grafica comparativa. */
  acumuladoPorAnio: number[];
}

// ---------------------------------------------------------------------------
// Utilidades internas
// ---------------------------------------------------------------------------

/** Convierte null/undefined/NaN en 0, para poder calcular con datos parciales. */
function n(valor: number | null | undefined): number {
  return typeof valor === "number" && Number.isFinite(valor) ? valor : 0;
}

const MESES_DEL_ANIO = 12;

// ---------------------------------------------------------------------------
// Valores derivados
// ---------------------------------------------------------------------------

/**
 * Calcula los valores intermedios del caso. Tolera datos incompletos (devuelve
 * 0) porque las pantallas de captura lo usan para mostrar vistas previas en
 * vivo mientras el usuario todavia esta escribiendo.
 */
export function derivados(caso: Caso): Derivados {
  const clientesActuales = n(caso.negocio.clientesActuales);
  const ingresosActuales = n(caso.negocio.ingresosActuales);
  const diasOperacion = n(caso.negocio.diasOperacion);
  const gastoInsumos = n(caso.personal.gastoInsumos);

  // Ingreso promedio por cliente = ingresos actuales / clientes actuales.
  const ingresoPromedio = clientesActuales > 0 ? ingresosActuales / clientesActuales : 0;
  // Costo variable por cliente = gasto en insumos / clientes actuales.
  const costoVariable = clientesActuales > 0 ? gastoInsumos / clientesActuales : 0;
  const margen = ingresoPromedio - costoVariable;

  // Costos fijos adicionales = (trabajadores x salario) x (1 + prestaciones) + otros.
  const salarios = n(caso.personal.nuevosTrabajadores) * n(caso.personal.salarioMensual);
  const prestaciones = salarios * (n(caso.personal.porcentajePrestaciones) / 100);
  const otrosCostos = caso.personal.otrosCostosFijos.reduce(
    (suma, costo) => suma + n(costo.valorMensual),
    0,
  );
  const costosFijosMensuales = salarios + prestaciones + otrosCostos;

  // Inversion = suma de cantidad x precio unitario.
  const inversionTotal = caso.inversion.elementos.reduce(
    (suma, elemento) => suma + n(elemento.cantidad) * n(elemento.precioUnitario),
    0,
  );

  const proyeccionNumerica = caso.proyeccion.map(n);
  const proyeccionMaxima = proyeccionNumerica.length ? Math.max(...proyeccionNumerica) : 0;
  const clientesAnio1 = proyeccionNumerica.reduce((suma, c) => suma + c, 0);

  return {
    ingresoPromedio,
    costoVariable,
    margen,
    salarios,
    prestaciones,
    otrosCostos,
    costosFijosMensuales,
    inversionTotal,
    clientesPorDia: diasOperacion > 0 ? clientesActuales / diasOperacion : null,
    // Punto de equilibrio = costos fijos / margen, redondeado hacia arriba.
    puntoEquilibrio: margen > 0 ? Math.ceil(costosFijosMensuales / margen) : null,
    proyeccionMaxima,
    clientesAnio1,
  };
}

// ---------------------------------------------------------------------------
// Indicadores economicos
// ---------------------------------------------------------------------------

/**
 * Valor Presente Neto: VPN = suma de Ft / (1 + tasa)^t, con t = 0..n.
 * La tasa se recibe como fraccion (0.20 = 20 %).
 */
export function vpn(flujos: number[], tasa: number): number {
  return flujos.reduce((suma, flujo, t) => suma + flujo / Math.pow(1 + tasa, t), 0);
}

/**
 * Tasa Interna de Retorno: la tasa que hace VPN = 0, hallada por biseccion.
 *
 * El rango de busqueda llega hasta 1000 % porque en inversiones pequenas
 * frente al margen (el caso de Espitia) la TIR supera con facilidad el 100 %:
 * la del caso base es 171,6 % y la del escenario de expansion, 378 %.
 *
 * Si los flujos no cambian de signo no existe TIR y se devuelve null.
 */
export function tir(flujos: number[]): number | null {
  const hayPositivo = flujos.some((f) => f > 0);
  const hayNegativo = flujos.some((f) => f < 0);
  if (!hayPositivo || !hayNegativo) return null;

  let bajo = -0.9999;
  let alto = 10; // 1000 %
  let vpnBajo = vpn(flujos, bajo);
  const vpnAlto = vpn(flujos, alto);
  if (vpnBajo * vpnAlto > 0) return null;

  for (let i = 0; i < 200; i += 1) {
    const medio = (bajo + alto) / 2;
    const vpnMedio = vpn(flujos, medio);
    if (vpnMedio === 0) return medio;
    if (vpnBajo * vpnMedio < 0) {
      alto = medio;
    } else {
      bajo = medio;
      vpnBajo = vpnMedio;
    }
  }
  return (bajo + alto) / 2;
}

/**
 * Serie de flujos mensuales de todo el horizonte, SIN valor de salvamento:
 * los 12 meses reales del anio 1 y los anios 2..n repartidos en 12 meses
 * iguales. Es la base del periodo de recuperacion y de la grafica de saldo.
 */
export function serieMensual(
  flujosMensualesAnio1: number[],
  flujoAnio1: number,
  vidaUtil: number,
  crecimiento: number,
): number[] {
  const serie = [...flujosMensualesAnio1];
  for (let anio = 2; anio <= vidaUtil; anio += 1) {
    const flujoDelAnio = flujoAnio1 * Math.pow(1 + crecimiento, anio - 1);
    for (let mes = 0; mes < MESES_DEL_ANIO; mes += 1) {
      serie.push(flujoDelAnio / MESES_DEL_ANIO);
    }
  }
  return serie;
}

/**
 * Periodo de recuperacion en meses con decimales: primer mes en que el
 * acumulado alcanza la inversion, interpolando la fraccion del mes.
 * Devuelve null si no se alcanza dentro del horizonte evaluado.
 */
export function recuperacion(serie: number[], inversion: number): number | null {
  if (inversion <= 0) return 0;
  let acumulado = 0;
  for (let i = 0; i < serie.length; i += 1) {
    const anterior = acumulado;
    acumulado += serie[i];
    if (acumulado >= inversion) {
      const faltante = inversion - anterior;
      const fraccion = serie[i] > 0 ? faltante / serie[i] : 1;
      return i + fraccion;
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Evaluacion completa
// ---------------------------------------------------------------------------

/**
 * Evalua el caso completo con la proyeccion que trae, o con una proyeccion
 * alterna (la de un escenario). Devuelve todo lo que necesita el dashboard.
 */
export function evaluar(caso: Caso, proyeccionAlterna?: number[]): Resultado {
  const d = derivados(caso);
  const proyeccion = (proyeccionAlterna ?? caso.proyeccion).map(n);

  const tasa = n(caso.parametros.tasaEvaluacion) / 100;
  const crecimiento = n(caso.parametros.crecimientoAnual) / 100;
  const vidaUtil = Math.max(0, Math.round(n(caso.parametros.vidaUtil)));
  const salvamento = n(caso.parametros.valorSalvamento);
  const inversion = d.inversionTotal;

  // Flujo del mes m del anio 1 = clientes_m x margen - costos fijos mensuales.
  const ingresosMensuales = proyeccion.map((clientes) => clientes * d.ingresoPromedio);
  const costosMensuales = proyeccion.map(
    (clientes) => clientes * d.costoVariable + d.costosFijosMensuales,
  );
  const flujosMensuales = proyeccion.map(
    (clientes) => clientes * d.margen - d.costosFijosMensuales,
  );

  const ingresosAnio1 = ingresosMensuales.reduce((s, v) => s + v, 0);
  const costosAnio1 = costosMensuales.reduce((s, v) => s + v, 0);
  const flujoAnio1 = flujosMensuales.reduce((s, v) => s + v, 0);

  // Flujo de caja anual: anio 0 = -inversion; anio t = flujo anio 1 x (1+g)^(t-1).
  // El ultimo anio suma el valor de salvamento.
  const flujosAnuales: number[] = [-inversion];
  for (let anio = 1; anio <= vidaUtil; anio += 1) {
    flujosAnuales.push(flujoAnio1 * Math.pow(1 + crecimiento, anio - 1));
  }
  if (vidaUtil >= 1) {
    flujosAnuales[vidaUtil] += salvamento;
  }

  const valorPresenteNeto = vpn(flujosAnuales, tasa);
  const tasaInterna = tir(flujosAnuales);

  const serie = serieMensual(flujosMensuales, flujoAnio1, vidaUtil, crecimiento);
  const recuperacionMeses = recuperacion(serie, inversion);

  // Tabla de flujo de caja descontado.
  let acumulado = 0;
  const tablaFlujo: FilaFlujo[] = flujosAnuales.map((flujo, anio) => {
    const factorDescuento = 1 / Math.pow(1 + tasa, anio);
    const valorPresente = flujo * factorDescuento;
    acumulado += valorPresente;
    return { anio, flujo, factorDescuento, valorPresente, acumulado };
  });

  // Grafica de recuperacion: saldo acumulado desde -inversion, mes a mes.
  // Se muestran al menos 12 meses y, si la recuperacion tarda mas, un par de
  // meses despues del cruce para que la linea de $0 quede visible.
  const mesesAMostrar = Math.min(
    serie.length,
    Math.max(MESES_DEL_ANIO, Math.ceil(recuperacionMeses ?? 0) + 2),
  );
  let saldo = -inversion;
  const saldoMensual = [{ mes: 0, saldo }];
  for (let i = 0; i < mesesAMostrar; i += 1) {
    saldo += serie[i];
    saldoMensual.push({ mes: i + 1, saldo });
  }

  return {
    derivados: d,
    ingresosMensuales,
    costosMensuales,
    flujosMensuales,
    ingresosAnio1,
    costosAnio1,
    flujoAnio1,
    flujosAnuales,
    vpn: valorPresenteNeto,
    tir: tasaInterna,
    recuperacionMeses,
    puntoEquilibrio: d.puntoEquilibrio,
    tablaFlujo,
    saldoMensual,
  };
}

/**
 * Escala la proyeccion del caso a la capacidad plena de un escenario.
 * Se conserva la misma curva de crecimiento y se redondea a clientes enteros,
 * porque "93,75 clientes" no es un dato presentable.
 *
 * Devuelve null si la proyeccion esta en cero: sin un maximo mayor que cero no
 * hay curva que escalar (evita una division por cero).
 */
export function proyeccionEscenario(caso: Caso, clientes: number): number[] | null {
  const proyeccion = caso.proyeccion.map(n);
  const maximo = proyeccion.length ? Math.max(...proyeccion) : 0;
  if (maximo <= 0) return null;
  const factor = clientes / maximo;
  return proyeccion.map((c) => Math.round(c * factor));
}

/** Evalua un escenario de comparacion y arma su fila de la tabla. */
export function evaluarEscenario(
  caso: Caso,
  nombre: string,
  clientes: number,
): ResultadoEscenario | null {
  const proyeccion = proyeccionEscenario(caso, clientes);
  if (!proyeccion) return null;

  const resultado = evaluar(caso, proyeccion);
  const equilibrio = resultado.puntoEquilibrio;

  // Flujo acumulado (sin descontar) por anio, para la grafica comparativa.
  let acumulado = 0;
  const acumuladoPorAnio = resultado.flujosAnuales.map((flujo) => {
    acumulado += flujo;
    return acumulado;
  });

  return {
    nombre,
    clientes,
    proyeccion,
    distanciaEquilibrio: equilibrio === null ? null : clientes - equilibrio,
    sobreEquilibrio: equilibrio === null ? null : clientes >= equilibrio,
    ingresosAnio1: resultado.ingresosAnio1,
    costosAnio1: resultado.costosAnio1,
    flujoAnio1: resultado.flujoAnio1,
    vpn: resultado.vpn,
    tir: resultado.tir,
    recuperacionMeses: resultado.recuperacionMeses,
    acumuladoPorAnio,
  };
}

// ---------------------------------------------------------------------------
// Validaciones
// ---------------------------------------------------------------------------

function vacio(valor: number | null | undefined): boolean {
  return valor === null || valor === undefined || !Number.isFinite(valor);
}

/**
 * Revisa el caso y devuelve los errores que impiden calcular, agrupados por
 * pantalla. Los mensajes estan en lenguaje sencillo: dicen que falta y por que
 * hace falta, no codigos tecnicos.
 */
export function validar(caso: Caso): ErrorValidacion[] {
  const errores: ErrorValidacion[] = [];
  const agregar = (pantalla: Pantalla, mensaje: string) => errores.push({ pantalla, mensaje });

  // --- Pantalla 1: Negocio ---
  if (!caso.negocio.nombre.trim()) {
    agregar("negocio", "Ingrese el nombre del negocio.");
  }
  if (vacio(caso.negocio.clientesActuales)) {
    agregar("negocio", "Ingrese la cantidad de clientes que el negocio atiende actualmente al mes.");
  } else if ((caso.negocio.clientesActuales as number) <= 0) {
    agregar(
      "negocio",
      "Los clientes actuales deben ser mayores que 0, porque con ellos se calcula el ingreso promedio por cliente.",
    );
  }
  if (vacio(caso.negocio.ingresosActuales)) {
    agregar("negocio", "Ingrese los ingresos mensuales actuales del negocio (en pesos).");
  } else if ((caso.negocio.ingresosActuales as number) < 0) {
    agregar("negocio", "Los ingresos mensuales actuales no pueden ser negativos.");
  }
  if (!vacio(caso.negocio.diasOperacion) && (caso.negocio.diasOperacion as number) < 0) {
    agregar("negocio", "Los días de operación al mes no pueden ser negativos.");
  }

  // --- Pantalla 2: Servicios (catalogo informativo, solo revisa negativos) ---
  caso.servicios.forEach((servicio) => {
    if (!vacio(servicio.precio) && (servicio.precio as number) < 0) {
      const nombre = servicio.nombre.trim() || "sin nombre";
      agregar("servicios", `El precio del servicio «${nombre}» no puede ser negativo.`);
    }
  });

  // --- Pantalla 3: Inversion ---
  const d = derivados(caso);
  if (d.inversionTotal <= 0) {
    agregar("inversion", "Ingrese el valor de la inversión: agregue al menos un elemento con cantidad y precio.");
  }
  caso.inversion.elementos.forEach((elemento) => {
    const nombre = elemento.elemento.trim() || "sin nombre";
    if (!vacio(elemento.cantidad) && (elemento.cantidad as number) < 0) {
      agregar("inversion", `La cantidad del elemento «${nombre}» no puede ser negativa.`);
    }
    if (!vacio(elemento.precioUnitario) && (elemento.precioUnitario as number) < 0) {
      agregar("inversion", `El precio unitario del elemento «${nombre}» no puede ser negativo.`);
    }
  });

  // --- Pantalla 4: Personal y costos ---
  const trabajadores = caso.personal.nuevosTrabajadores;
  if (!vacio(trabajadores) && (trabajadores as number) < 0) {
    agregar("personal", "La cantidad de nuevos trabajadores no puede ser negativa.");
  }
  if (!vacio(trabajadores) && (trabajadores as number) > 0 && vacio(caso.personal.salarioMensual)) {
    agregar("personal", "Ingrese el salario mensual de los nuevos trabajadores.");
  }
  if (!vacio(caso.personal.salarioMensual) && (caso.personal.salarioMensual as number) < 0) {
    agregar("personal", "El salario mensual de los nuevos trabajadores no puede ser negativo.");
  }
  if (
    !vacio(caso.personal.porcentajePrestaciones) &&
    (caso.personal.porcentajePrestaciones as number) < 0
  ) {
    agregar("personal", "El porcentaje de prestaciones no puede ser negativo.");
  }
  caso.personal.otrosCostosFijos.forEach((costo) => {
    if (!vacio(costo.valorMensual) && (costo.valorMensual as number) < 0) {
      const nombre = costo.concepto.trim() || "sin nombre";
      agregar("personal", `El costo fijo «${nombre}» no puede ser negativo.`);
    }
  });
  if (vacio(caso.personal.gastoInsumos)) {
    agregar(
      "personal",
      "Ingrese el gasto actual en productos, herramientas e insumos (en pesos al mes).",
    );
  } else if ((caso.personal.gastoInsumos as number) < 0) {
    agregar("personal", "El gasto en productos, herramientas e insumos no puede ser negativo.");
  }

  // --- Pantalla 5: Proyeccion ---
  const mesesVacios: number[] = [];
  caso.proyeccion.forEach((clientes, i) => {
    if (vacio(clientes)) {
      mesesVacios.push(i + 1);
    } else if ((clientes as number) < 0) {
      agregar("proyeccion", `Los clientes proyectados del mes ${i + 1} no pueden ser negativos.`);
    }
  });
  if (mesesVacios.length > 0) {
    agregar(
      "proyeccion",
      `Ingrese la cantidad de clientes proyectados en: ${mesesVacios
        .map((m) => `mes ${m}`)
        .join(", ")}.`,
    );
  } else if (d.proyeccionMaxima <= 0) {
    agregar(
      "proyeccion",
      "La proyección no puede quedar en 0 en los 12 meses: ingrese al menos un mes con clientes adicionales.",
    );
  }

  // --- Pantalla 6: Parametros ---
  const vidaUtil = caso.parametros.vidaUtil;
  if (
    vacio(vidaUtil) ||
    !Number.isInteger(vidaUtil as number) ||
    (vidaUtil as number) < 1 ||
    (vidaUtil as number) > 50
  ) {
    agregar("parametros", "Ingrese un periodo de evaluación válido: un número entero de años entre 1 y 50.");
  }
  if (vacio(caso.parametros.tasaEvaluacion)) {
    agregar("parametros", "Ingrese la tasa de evaluación.");
  } else if ((caso.parametros.tasaEvaluacion as number) < 0) {
    agregar("parametros", "La tasa debe ser mayor o igual a 0 %.");
  }
  if (vacio(caso.parametros.crecimientoAnual)) {
    agregar("parametros", "Ingrese el crecimiento anual (puede ser 0 %).");
  }
  if (!vacio(caso.parametros.valorSalvamento) && (caso.parametros.valorSalvamento as number) < 0) {
    agregar("parametros", "El valor de salvamento no puede ser negativo.");
  }

  return errores;
}

/**
 * Advertencias que NO impiden calcular, pero que el usuario debe conocer.
 */
export function advertencias(caso: Caso): string[] {
  const avisos: string[] = [];
  const d = derivados(caso);

  if (d.ingresoPromedio > 0 && d.costoVariable >= d.ingresoPromedio) {
    avisos.push(
      "El costo variable por cliente es igual o mayor que el ingreso promedio por cliente: " +
        "con estos datos cada cliente adicional genera pérdida. Revise el gasto en insumos y los ingresos actuales.",
    );
  }
  if (d.margen > 0 && d.puntoEquilibrio !== null && d.proyeccionMaxima > 0) {
    if (d.proyeccionMaxima < d.puntoEquilibrio) {
      avisos.push(
        `La proyección máxima (${d.proyeccionMaxima} clientes/mes) está por debajo del punto de ` +
          `equilibrio (${d.puntoEquilibrio} clientes/mes): el proyecto no alcanza a cubrir sus costos fijos.`,
      );
    }
  }
  return avisos;
}

// ---------------------------------------------------------------------------
// Interpretacion del resultado
// ---------------------------------------------------------------------------

export interface Interpretacion {
  titular: string;
  tono: "favorable" | "desfavorable" | "neutro";
  parrafos: string[];
  cierre: string;
}

/** Formatea un numero con separador de miles, sin depender de lib/formato. */
function num(valor: number, decimales = 0): string {
  return valor.toLocaleString("es-CO", {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  });
}

function dinero(valor: number): string {
  return `$${num(Math.round(valor))}`;
}

/**
 * Genera la interpretacion del resultado por reglas, no con texto fijo: el
 * mismo codigo explica el caso de Espitia o el de cualquier otro negocio.
 */
export function interpretar(caso: Caso, resultado: Resultado): Interpretacion {
  const d = resultado.derivados;
  const tasa = n(caso.parametros.tasaEvaluacion);
  const vidaUtil = n(caso.parametros.vidaUtil);
  const parrafos: string[] = [];

  // --- Titular ---
  let titular: string;
  let tono: Interpretacion["tono"];
  if (resultado.vpn > 0) {
    titular = "Bajo estos supuestos, la inversión es económicamente conveniente.";
    tono = "favorable";
  } else if (resultado.vpn < 0) {
    titular = "Bajo estos supuestos, la inversión no es económicamente conveniente.";
    tono = "desfavorable";
  } else {
    titular = "Bajo estos supuestos, la inversión apenas iguala la rentabilidad mínima exigida.";
    tono = "neutro";
  }

  // --- Que significa el VPN ---
  if (resultado.vpn > 0) {
    parrafos.push(
      `El VPN de ${dinero(resultado.vpn)} significa que, además de recuperar la inversión de ` +
        `${dinero(d.inversionTotal)} y de pagar una rentabilidad del ${num(tasa, 1)} % anual sobre el dinero ` +
        `invertido, el proyecto deja ese excedente expresado en pesos de hoy, a lo largo de ` +
        `${num(vidaUtil)} ${vidaUtil === 1 ? "año" : "años"}.`,
    );
  } else if (resultado.vpn < 0) {
    parrafos.push(
      `El VPN de ${dinero(resultado.vpn)} significa que, en pesos de hoy, el proyecto no alcanza a ` +
        `devolver la inversión de ${dinero(d.inversionTotal)} más la rentabilidad mínima exigida del ` +
        `${num(tasa, 1)} % anual. Faltarían ${dinero(Math.abs(resultado.vpn))} para igualar esa exigencia.`,
    );
  } else {
    parrafos.push(
      `Un VPN de $0 significa que el proyecto devuelve exactamente la inversión más la rentabilidad ` +
        `mínima exigida del ${num(tasa, 1)} % anual, sin excedente ni faltante.`,
    );
  }

  // --- TIR frente a la tasa ---
  if (resultado.tir === null) {
    parrafos.push(
      "No existe TIR para este escenario: todos los flujos del proyecto tienen el mismo signo, " +
        "es decir, la operación nunca llega a generar dinero que compense la inversión. " +
        "Cuando no hay cambio de signo, la tasa interna de retorno no está definida.",
    );
  } else {
    const tirPorcentaje = resultado.tir * 100;
    const comparacion =
      tirPorcentaje > tasa
        ? `supera la tasa de evaluación del ${num(tasa, 1)} % anual, por lo que el proyecto rinde más que la rentabilidad mínima exigida`
        : tirPorcentaje < tasa
          ? `queda por debajo de la tasa de evaluación del ${num(tasa, 1)} % anual, por lo que el proyecto rinde menos que la rentabilidad mínima exigida`
          : `coincide con la tasa de evaluación del ${num(tasa, 1)} % anual`;
    parrafos.push(`La TIR de ${num(tirPorcentaje, 1)} % ${comparacion}.`);

    if (tirPorcentaje > 100) {
      parrafos.push(
        `Una TIR tan alta no debe leerse como una promesa de rentabilidad: aparece porque la ` +
          `inversión (${dinero(d.inversionTotal)}) es pequeña frente al margen que deja cada cliente ` +
          `adicional (${dinero(d.margen)} por cliente). En casos así conviene tomar la decisión con el ` +
          `VPN y el punto de equilibrio, que son menos sensibles al tamaño de la inversión.`,
      );
    }
  }

  // --- Recuperacion ---
  if (resultado.recuperacionMeses === null) {
    parrafos.push(
      `La inversión no se recupera dentro de los ${num(vidaUtil)} ${vidaUtil === 1 ? "año" : "años"} ` +
        `evaluados: el flujo acumulado del proyecto nunca alcanza los ${dinero(d.inversionTotal)} invertidos.`,
    );
  } else {
    const meses = resultado.recuperacionMeses;
    const mesCalendario = Math.ceil(meses);
    parrafos.push(
      `La inversión se recupera a los ${num(meses, 1)} meses, es decir, durante el mes ${num(mesCalendario)} ` +
        `de operación: en ese momento el dinero acumulado por la ampliación iguala los ` +
        `${dinero(d.inversionTotal)} invertidos.`,
    );
  }

  // --- Punto de equilibrio y margen de seguridad ---
  if (d.puntoEquilibrio === null) {
    parrafos.push(
      "No es posible calcular un punto de equilibrio porque el margen por cliente no es positivo: " +
        "cada cliente adicional cuesta más de lo que deja.",
    );
  } else {
    const maximo = d.proyeccionMaxima;
    const holgura = maximo - d.puntoEquilibrio;
    const porcentajeHolgura = d.puntoEquilibrio > 0 ? (holgura / d.puntoEquilibrio) * 100 : 0;
    if (holgura >= 0) {
      parrafos.push(
        `El punto de equilibrio es de ${num(d.puntoEquilibrio)} clientes adicionales al mes: por debajo ` +
          `de esa cifra la ampliación no cubre sus propios costos fijos de ${dinero(d.costosFijosMensuales)} ` +
          `al mes. La proyección llega a ${num(maximo)} clientes adicionales, es decir, ` +
          `${num(porcentajeHolgura, 1)} % por encima del punto de equilibrio: ese es el margen de seguridad ` +
          `del proyecto frente a una demanda menor a la esperada.`,
      );
    } else {
      parrafos.push(
        `El punto de equilibrio es de ${num(d.puntoEquilibrio)} clientes adicionales al mes, pero la ` +
          `proyección solo llega a ${num(maximo)}. El proyecto opera por debajo de su punto de equilibrio ` +
          `y no alcanza a cubrir los costos fijos de ${dinero(d.costosFijosMensuales)} al mes.`,
      );
    }
  }

  // --- Capacidad operativa: la proyeccion es alcanzable? ---
  const parrafoCapacidad = interpretarCapacidad(caso, d);
  if (parrafoCapacidad) parrafos.push(parrafoCapacidad);

  return {
    titular,
    tono,
    parrafos,
    cierre:
      "Este resultado depende de los datos y supuestos registrados; no es una garantía de " +
      "comportamiento futuro.",
  };
}

/**
 * Explica si la proyeccion cabe en la capacidad instalada, comparando la carga
 * de trabajo por trabajador de hoy contra la que habria con la ampliacion.
 */
function interpretarCapacidad(caso: Caso, d: Derivados): string | null {
  const dias = n(caso.negocio.diasOperacion);
  const clientesActuales = n(caso.negocio.clientesActuales);
  const trabajadoresHoy = n(caso.negocio.trabajadoresActuales);
  const nuevosTrabajadores = n(caso.personal.nuevosTrabajadores);
  if (dias <= 0 || clientesActuales <= 0 || d.proyeccionMaxima <= 0) return null;

  const porDiaHoy = clientesActuales / dias;
  const porDiaAmpliado = (clientesActuales + d.proyeccionMaxima) / dias;

  const estacionesHoy = n(caso.negocio.estacionesActuales);
  const estacionesNuevas = n(caso.inversion.estacionesNuevas);
  const estacionesTexto =
    estacionesHoy > 0 && estacionesNuevas > 0
      ? ` con ${num(estacionesHoy)} ${estacionesHoy === 1 ? "estación" : "estaciones"} de trabajo`
      : "";
  const estacionesTextoAmpliado =
    estacionesHoy > 0 && estacionesNuevas > 0
      ? ` con ${num(estacionesHoy + estacionesNuevas)} estaciones`
      : "";

  if (trabajadoresHoy <= 0 || trabajadoresHoy + nuevosTrabajadores <= 0) {
    return (
      `En capacidad instalada: hoy el negocio atiende ${num(porDiaHoy, 0)} clientes por día` +
      `${estacionesTexto}; con la ampliación serían ${num(porDiaAmpliado, 0)} clientes por día` +
      `${estacionesTextoAmpliado}.`
    );
  }

  const trabajadoresTotal = trabajadoresHoy + nuevosTrabajadores;
  const porTrabajadorHoy = porDiaHoy / trabajadoresHoy;
  const porTrabajadorAmpliado = porDiaAmpliado / trabajadoresTotal;

  const comparacion =
    porTrabajadorAmpliado <= porTrabajadorHoy
      ? `menos que los ${num(porTrabajadorHoy, 0)} que atiende cada trabajador hoy. La proyección es ` +
        `alcanzable con la capacidad que deja la inversión, sin exigir más rendimiento del actual`
      : `más que los ${num(porTrabajadorHoy, 0)} que atiende cada trabajador hoy. Conviene revisar si la ` +
        `capacidad instalada alcanza para sostener esa carga`;

  return (
    `En capacidad operativa: hoy el negocio atiende ${num(porDiaHoy, 0)} clientes por día` +
    `${estacionesTexto} y ${num(trabajadoresHoy)} ${trabajadoresHoy === 1 ? "trabajador" : "trabajadores"} ` +
    `(${num(porTrabajadorHoy, 0)} por trabajador). Con la ampliación serían ${num(porDiaAmpliado, 0)} ` +
    `clientes por día${estacionesTextoAmpliado} y ${num(trabajadoresTotal)} trabajadores: ` +
    `${num(porTrabajadorAmpliado, 0)} por trabajador, ${comparacion}.`
  );
}
