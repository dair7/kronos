/**
 * Capa de datos de KRONOS.
 *
 * Define el modelo de datos de un "caso" (un negocio con una inversion por
 * evaluar), los casos precargados y la validacion de los archivos .json que el
 * usuario abre con el boton "Abrir caso".
 *
 * Este archivo no contiene calculos ni nada de React: solo estructura y datos.
 */

/** Version del formato de archivo. Sirve para validar los .json importados. */
export const VERSION_CASO = "kronos-1";

/** Identificador de cada pantalla de captura. Se usa para agrupar errores. */
export type Pantalla =
  | "negocio"
  | "servicios"
  | "inversion"
  | "personal"
  | "proyeccion"
  | "parametros";

/** Datos generales del negocio que solicita la evaluacion. */
export interface Negocio {
  nombre: string;
  propietario: string;
  ubicacion: string;
  actividad: string;
  /** Clientes que el negocio atiende hoy, al mes. */
  clientesActuales: number | null;
  /** Ingresos mensuales actuales del negocio, en pesos. */
  ingresosActuales: number | null;
  /** Dias que el negocio opera al mes. */
  diasOperacion: number | null;
  /** Puestos o estaciones de trabajo con que opera hoy. */
  estacionesActuales: number | null;
  /** Trabajadores con que opera hoy. */
  trabajadoresActuales: number | null;
}

/**
 * Servicio del catalogo. Es informacion de contexto: NO entra en ninguna
 * formula. El ingreso promedio por cliente se calcula sobre los ingresos
 * reales del mes, no sobre esta lista de precios.
 */
export interface Servicio {
  id: string;
  nombre: string;
  precio: number | null;
}

/** Una linea de la inversion inicial. */
export interface ElementoInversion {
  id: string;
  elemento: string;
  cantidad: number | null;
  precioUnitario: number | null;
}

export interface Inversion {
  descripcion: string;
  /**
   * Estaciones o puestos de trabajo que agrega esta inversion. Es opcional y no
   * entra en ninguna formula: se usa solo para explicar la capacidad en la
   * interpretacion del resultado.
   */
  estacionesNuevas: number | null;
  elementos: ElementoInversion[];
}

/** Un costo fijo mensual adicional distinto de los salarios. */
export interface CostoFijo {
  id: string;
  concepto: string;
  valorMensual: number | null;
}

export interface Personal {
  /** Trabajadores que se contratan con la inversion. */
  nuevosTrabajadores: number | null;
  /** Salario mensual de cada nuevo trabajador, en pesos. */
  salarioMensual: number | null;
  /** Prestaciones sociales como porcentaje sobre los salarios (30 = 30 %). */
  porcentajePrestaciones: number | null;
  /** Otros costos fijos mensuales que aparecen con la ampliacion. */
  otrosCostosFijos: CostoFijo[];
  /** Gasto actual en productos, herramientas e insumos, al mes. */
  gastoInsumos: number | null;
}

export interface Parametros {
  /** Horizonte de evaluacion, en anios. */
  vidaUtil: number | null;
  /** Tasa de evaluacion o TMAR, en % anual (20 = 20 %). */
  tasaEvaluacion: number | null;
  /** Crecimiento anual del flujo, en % anual (4 = 4 %). */
  crecimientoAnual: number | null;
  /** Valor de salvamento al final del horizonte, en pesos. */
  valorSalvamento: number | null;
}

/** Un escenario de comparacion: clientes adicionales a capacidad plena. */
export interface Escenario {
  id: string;
  nombre: string;
  clientes: number | null;
}

/** Un caso completo de KRONOS. Es lo que se guarda y se abre como .json. */
export interface Caso {
  version: string;
  /** Nota opcional que se muestra como aviso en la cabecera del caso. */
  aviso?: string;
  negocio: Negocio;
  servicios: Servicio[];
  inversion: Inversion;
  personal: Personal;
  /** Clientes adicionales proyectados para los meses 1 a 12 del anio 1. */
  proyeccion: (number | null)[];
  parametros: Parametros;
  escenarios: Escenario[];
}

/** Genera un identificador unico para las filas editables de las tablas. */
let contadorId = 0;
export function nuevoId(prefijo = "f"): string {
  contadorId += 1;
  return `${prefijo}-${Date.now().toString(36)}-${contadorId}`;
}

/** Copia profunda de un caso, para no mutar los casos precargados. */
export function clonarCaso(caso: Caso): Caso {
  return JSON.parse(JSON.stringify(caso)) as Caso;
}

// ---------------------------------------------------------------------------
// CASO REAL: Espitia Barber Shop
// ---------------------------------------------------------------------------

/**
 * Caso real del TCC: Espitia Barber Shop (San Pelayo, Cordoba), propietario
 * Alvaro Espitia. Evalua instalar una segunda estacion de trabajo y contratar
 * dos nuevos barberos. Los datos fueron suministrados por el propietario.
 */
export const CASO_ESPITIA: Caso = {
  version: VERSION_CASO,
  negocio: {
    nombre: "Espitia Barber Shop",
    propietario: "Álvaro Espitia",
    ubicacion: "San Pelayo, Córdoba",
    actividad: "Barbería",
    clientesActuales: 600,
    ingresosActuales: 11_000_000,
    diasOperacion: 25,
    estacionesActuales: 1,
    trabajadoresActuales: 2,
  },
  servicios: [
    { id: "s-esp-1", nombre: "Corte de cabello", precio: 15_000 },
    { id: "s-esp-2", nombre: "Corte + barba", precio: 25_000 },
    { id: "s-esp-3", nombre: "Arreglo de barba", precio: 10_000 },
    { id: "s-esp-4", nombre: "Corte infantil", precio: 10_000 },
    { id: "s-esp-5", nombre: "Diseño", precio: 20_000 },
  ],
  inversion: {
    descripcion: "Instalación de una segunda estación de trabajo",
    estacionesNuevas: 1,
    elementos: [
      { id: "i-esp-1", elemento: "Silla", cantidad: 1, precioUnitario: 600_000 },
      { id: "i-esp-2", elemento: "Espejo", cantidad: 1, precioUnitario: 150_000 },
      { id: "i-esp-3", elemento: "Mobiliario", cantidad: 1, precioUnitario: 500_000 },
      { id: "i-esp-4", elemento: "Máquina de corte", cantidad: 1, precioUnitario: 300_000 },
      { id: "i-esp-5", elemento: "Máquina de acabado", cantidad: 1, precioUnitario: 120_000 },
      { id: "i-esp-6", elemento: "Secador", cantidad: 1, precioUnitario: 280_000 },
      { id: "i-esp-7", elemento: "Iluminación", cantidad: 1, precioUnitario: 250_000 },
      {
        id: "i-esp-8",
        elemento: "Aire acondicionado / ventilación",
        cantidad: 1,
        precioUnitario: 1_400_000,
      },
      { id: "i-esp-9", elemento: "Adecuación del espacio", cantidad: 1, precioUnitario: 1_700_000 },
      { id: "i-esp-10", elemento: "Instalación", cantidad: 1, precioUnitario: 3_000_000 },
    ],
  },
  personal: {
    nuevosTrabajadores: 2,
    salarioMensual: 1_700_000,
    porcentajePrestaciones: 30,
    otrosCostosFijos: [
      { id: "c-esp-1", concepto: "Electricidad adicional", valorMensual: 100_000 },
      { id: "c-esp-2", concepto: "Agua adicional", valorMensual: 30_000 },
    ],
    gastoInsumos: 850_000,
  },
  proyeccion: [150, 200, 250, 300, 350, 400, 400, 400, 400, 400, 400, 400],
  parametros: {
    vidaUtil: 10,
    tasaEvaluacion: 20,
    crecimientoAnual: 4,
    valorSalvamento: 830_000,
  },
  escenarios: [
    { id: "e-esp-a", nombre: "A — Conservador", clientes: 250 },
    { id: "e-esp-b", nombre: "B — Esperado", clientes: 400 },
    { id: "e-esp-c", nombre: "C — Expansión", clientes: 500 },
  ],
};

// ---------------------------------------------------------------------------
// CASO DE EJEMPLO (ILUSTRATIVO, NO REAL): Panadería El Buen Pan
// ---------------------------------------------------------------------------

/**
 * Segundo caso, creado para demostrar que KRONOS sirve para cualquier negocio.
 * ATENCION: los datos son ficticios. No corresponden a ninguna empresa real y
 * no deben citarse como evidencia en el documento del TCC.
 */
export const CASO_PANADERIA: Caso = {
  version: VERSION_CASO,
  aviso:
    "Ejemplo ilustrativo con datos ficticios. No corresponde a una empresa real; " +
    "sirve únicamente para mostrar cómo se reutiliza KRONOS en otro tipo de negocio.",
  negocio: {
    nombre: "Panadería El Buen Pan (ejemplo ilustrativo)",
    propietario: "Caso de demostración — datos ficticios",
    ubicacion: "Montería, Córdoba",
    actividad: "Panadería",
    clientesActuales: 3000,
    ingresosActuales: 9_000_000,
    diasOperacion: 30,
    estacionesActuales: 1,
    trabajadoresActuales: 3,
  },
  servicios: [
    { id: "s-pan-1", nombre: "Pan francés (unidad)", precio: 1_000 },
    { id: "s-pan-2", nombre: "Pan de queso", precio: 2_000 },
    { id: "s-pan-3", nombre: "Buñuelo", precio: 1_500 },
    { id: "s-pan-4", nombre: "Torta por porción", precio: 4_000 },
    { id: "s-pan-5", nombre: "Bebida fría", precio: 3_000 },
  ],
  inversion: {
    descripcion: "Compra e instalación de un horno rotatorio industrial",
    estacionesNuevas: 1,
    elementos: [
      {
        id: "i-pan-1",
        elemento: "Horno rotatorio industrial",
        cantidad: 1,
        precioUnitario: 12_000_000,
      },
      {
        id: "i-pan-2",
        elemento: "Instalación eléctrica y de gas",
        cantidad: 1,
        precioUnitario: 2_500_000,
      },
      { id: "i-pan-3", elemento: "Mesa de trabajo en acero", cantidad: 1, precioUnitario: 1_200_000 },
      { id: "i-pan-4", elemento: "Carro portabandejas", cantidad: 1, precioUnitario: 700_000 },
      { id: "i-pan-5", elemento: "Bandejas y moldes", cantidad: 1, precioUnitario: 800_000 },
    ],
  },
  personal: {
    nuevosTrabajadores: 1,
    salarioMensual: 1_500_000,
    porcentajePrestaciones: 30,
    otrosCostosFijos: [
      { id: "c-pan-1", concepto: "Gas adicional", valorMensual: 250_000 },
      { id: "c-pan-2", concepto: "Electricidad adicional", valorMensual: 180_000 },
    ],
    gastoInsumos: 3_600_000,
  },
  proyeccion: [600, 900, 1200, 1500, 1800, 2000, 2000, 2000, 2000, 2000, 2000, 2000],
  parametros: {
    vidaUtil: 10,
    tasaEvaluacion: 20,
    crecimientoAnual: 4,
    valorSalvamento: 1_720_000,
  },
  escenarios: [
    { id: "e-pan-a", nombre: "A — Conservador", clientes: 1200 },
    { id: "e-pan-b", nombre: "B — Esperado", clientes: 2000 },
    { id: "e-pan-c", nombre: "C — Expansión", clientes: 2600 },
  ],
};

// ---------------------------------------------------------------------------
// CASO VACIO
// ---------------------------------------------------------------------------

/**
 * Caso en blanco con la misma estructura: proyeccion de 12 meses vacia, una
 * fila de inversion vacia y los tres escenarios con nombre pero sin clientes.
 */
export function casoVacio(): Caso {
  return {
    version: VERSION_CASO,
    negocio: {
      nombre: "",
      propietario: "",
      ubicacion: "",
      actividad: "",
      clientesActuales: null,
      ingresosActuales: null,
      diasOperacion: null,
      estacionesActuales: null,
      trabajadoresActuales: null,
    },
    servicios: [{ id: nuevoId("s"), nombre: "", precio: null }],
    inversion: {
      descripcion: "",
      estacionesNuevas: null,
      elementos: [{ id: nuevoId("i"), elemento: "", cantidad: null, precioUnitario: null }],
    },
    personal: {
      nuevosTrabajadores: null,
      salarioMensual: null,
      porcentajePrestaciones: null,
      otrosCostosFijos: [{ id: nuevoId("c"), concepto: "", valorMensual: null }],
      gastoInsumos: null,
    },
    proyeccion: Array(12).fill(null),
    parametros: {
      vidaUtil: null,
      tasaEvaluacion: null,
      crecimientoAnual: null,
      valorSalvamento: null,
    },
    escenarios: [
      { id: nuevoId("e"), nombre: "A — Conservador", clientes: null },
      { id: nuevoId("e"), nombre: "B — Esperado", clientes: null },
      { id: nuevoId("e"), nombre: "C — Expansión", clientes: null },
    ],
  };
}

// ---------------------------------------------------------------------------
// VALIDACION DE ARCHIVOS .json
// ---------------------------------------------------------------------------

const MENSAJE_ARCHIVO_INVALIDO =
  "El archivo no es un caso de KRONOS válido. Use un archivo creado con el botón Guardar caso.";

type Resultado<T> = { ok: true; valor: T } | { ok: false; error: string };

function esObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null && !Array.isArray(valor);
}

function aNumeroONulo(valor: unknown): number | null {
  if (typeof valor === "number" && Number.isFinite(valor)) return valor;
  return null;
}

function aTexto(valor: unknown): string {
  return typeof valor === "string" ? valor : "";
}

/**
 * Valida y normaliza el contenido de un archivo .json abierto por el usuario.
 * No confia en el archivo: reconstruye el caso campo por campo, de modo que un
 * archivo con campos de mas, de menos o con tipos equivocados nunca rompe la
 * aplicacion.
 */
export function validarArchivo(texto: string): Resultado<Caso> {
  let crudo: unknown;
  try {
    crudo = JSON.parse(texto);
  } catch {
    return { ok: false, error: MENSAJE_ARCHIVO_INVALIDO };
  }

  if (!esObjeto(crudo)) return { ok: false, error: MENSAJE_ARCHIVO_INVALIDO };
  if (crudo.version !== VERSION_CASO) return { ok: false, error: MENSAJE_ARCHIVO_INVALIDO };

  const negocio = crudo.negocio;
  const inversion = crudo.inversion;
  const personal = crudo.personal;
  const parametros = crudo.parametros;
  if (!esObjeto(negocio) || !esObjeto(inversion) || !esObjeto(personal) || !esObjeto(parametros)) {
    return { ok: false, error: MENSAJE_ARCHIVO_INVALIDO };
  }
  if (!Array.isArray(crudo.proyeccion) || crudo.proyeccion.length !== 12) {
    return { ok: false, error: MENSAJE_ARCHIVO_INVALIDO };
  }
  if (!Array.isArray(inversion.elementos) || !Array.isArray(crudo.escenarios)) {
    return { ok: false, error: MENSAJE_ARCHIVO_INVALIDO };
  }

  const servicios = Array.isArray(crudo.servicios) ? crudo.servicios : [];
  const otrosCostos = Array.isArray(personal.otrosCostosFijos) ? personal.otrosCostosFijos : [];

  const caso: Caso = {
    version: VERSION_CASO,
    aviso: typeof crudo.aviso === "string" ? crudo.aviso : undefined,
    negocio: {
      nombre: aTexto(negocio.nombre),
      propietario: aTexto(negocio.propietario),
      ubicacion: aTexto(negocio.ubicacion),
      actividad: aTexto(negocio.actividad),
      clientesActuales: aNumeroONulo(negocio.clientesActuales),
      ingresosActuales: aNumeroONulo(negocio.ingresosActuales),
      diasOperacion: aNumeroONulo(negocio.diasOperacion),
      estacionesActuales: aNumeroONulo(negocio.estacionesActuales),
      trabajadoresActuales: aNumeroONulo(negocio.trabajadoresActuales),
    },
    servicios: servicios.map((s, i) => ({
      id: esObjeto(s) && typeof s.id === "string" ? s.id : `s-imp-${i}`,
      nombre: esObjeto(s) ? aTexto(s.nombre) : "",
      precio: esObjeto(s) ? aNumeroONulo(s.precio) : null,
    })),
    inversion: {
      descripcion: aTexto(inversion.descripcion),
      estacionesNuevas: aNumeroONulo(inversion.estacionesNuevas),
      elementos: inversion.elementos.map((e, i) => ({
        id: esObjeto(e) && typeof e.id === "string" ? e.id : `i-imp-${i}`,
        elemento: esObjeto(e) ? aTexto(e.elemento) : "",
        cantidad: esObjeto(e) ? aNumeroONulo(e.cantidad) : null,
        precioUnitario: esObjeto(e) ? aNumeroONulo(e.precioUnitario) : null,
      })),
    },
    personal: {
      nuevosTrabajadores: aNumeroONulo(personal.nuevosTrabajadores),
      salarioMensual: aNumeroONulo(personal.salarioMensual),
      porcentajePrestaciones: aNumeroONulo(personal.porcentajePrestaciones),
      otrosCostosFijos: otrosCostos.map((c, i) => ({
        id: esObjeto(c) && typeof c.id === "string" ? c.id : `c-imp-${i}`,
        concepto: esObjeto(c) ? aTexto(c.concepto) : "",
        valorMensual: esObjeto(c) ? aNumeroONulo(c.valorMensual) : null,
      })),
      gastoInsumos: aNumeroONulo(personal.gastoInsumos),
    },
    proyeccion: crudo.proyeccion.map(aNumeroONulo),
    parametros: {
      vidaUtil: aNumeroONulo(parametros.vidaUtil),
      tasaEvaluacion: aNumeroONulo(parametros.tasaEvaluacion),
      crecimientoAnual: aNumeroONulo(parametros.crecimientoAnual),
      valorSalvamento: aNumeroONulo(parametros.valorSalvamento),
    },
    escenarios: crudo.escenarios.slice(0, 3).map((e, i) => ({
      id: esObjeto(e) && typeof e.id === "string" ? e.id : `e-imp-${i}`,
      nombre: esObjeto(e) ? aTexto(e.nombre) : `Escenario ${i + 1}`,
      clientes: esObjeto(e) ? aNumeroONulo(e.clientes) : null,
    })),
  };

  // Garantiza siempre tres escenarios, aunque el archivo traiga menos.
  const nombresPorDefecto = ["A — Conservador", "B — Esperado", "C — Expansión"];
  while (caso.escenarios.length < 3) {
    const i = caso.escenarios.length;
    caso.escenarios.push({ id: `e-imp-${i}`, nombre: nombresPorDefecto[i], clientes: null });
  }

  return { ok: true, valor: caso };
}

/** Nombre sugerido para el archivo que descarga el boton "Guardar caso". */
export function nombreArchivo(caso: Caso): string {
  const base = (caso.negocio.nombre || "caso-kronos")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
  return `kronos-${base || "caso"}.json`;
}
