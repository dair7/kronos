# Documentación técnica — KRONOS

Documento dirigido a quien tenga que mantener, revisar o extender el software.

---

## 1. Stack

| Componente | Tecnología | Versión | Por qué |
|---|---|---|---|
| Framework | Next.js (App Router) | 16 | Despliegue en Vercel sin configuración y generación estática de las tres páginas |
| Lenguaje | TypeScript | 5 | El modelo de datos del caso queda verificado por el compilador |
| Estilos | Tailwind CSS | 4 | Sistema de diseño por tokens, sin hojas de estilo dispersas |
| Gráficas | Recharts | 3 | `ResponsiveContainer` resuelve el requisito de gráficas que no se salen de pantalla. Se usa la versión 3 porque la 2 no es compatible con React 19 |
| Pruebas | Vitest | 3 | Ejecuta las pruebas del modelo económico sin navegador |
| Persistencia | `localStorage` + archivos `.json` | — | Sin backend ni base de datos: el prototipo es gratuito de desplegar y portable |

Requisito de ejecución: **Node.js 20.9 o superior**.

---

## 2. Arquitectura

El software está separado en tres capas. La dependencia es siempre en un solo sentido: la interfaz
conoce la lógica, la lógica conoce los datos, y nunca al revés.

```
┌─────────────────────────────────────────────────────────────┐
│  INTERFAZ WEB            src/app/ + src/components/         │
│                                                             │
│  ├── app/page.tsx              Bienvenida                   │
│  ├── app/evaluar/              6 pantallas de captura        │
│  ├── app/resultados/           Dashboard de 2 pestañas       │
│  ├── components/ui/            Sistema de diseño reutilizable│
│  ├── components/pantallas/     Formularios de captura        │
│  └── components/dashboard/     KPIs, gráficas, tablas        │
└──────────────────────────┬──────────────────────────────────┘
                           │  llama funciones puras
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  LÓGICA DE NEGOCIO       src/lib/calculos.ts                │
│                                                             │
│  ├── Validaciones        validar(), advertencias()           │
│  ├── Cálculos económicos derivados(), vpn(), tir()           │
│  ├── Proyecciones        evaluar(), serieMensual()           │
│  │                       recuperacion()                      │
│  ├── Escenarios          proyeccionEscenario()               │
│  │                       evaluarEscenario()                  │
│  └── Interpretación      interpretar()                       │
│                                                             │
│  NO importa React. Se puede probar sin navegador.            │
└──────────────────────────┬──────────────────────────────────┘
                           │  opera sobre el tipo Caso
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  DATOS                   src/lib/datos.ts + almacen.ts      │
│                                                             │
│  ├── Negocio             Nombre, clientes, ingresos, días     │
│  ├── Servicios           Catálogo informativo                │
│  ├── Inversión           Elementos con cantidad y precio      │
│  ├── Personal y costos   Trabajadores, salarios, costos fijos │
│  ├── Proyección          12 meses de clientes adicionales     │
│  ├── Parámetros          Vida útil, tasa, crecimiento, salv.  │
│  ├── Escenarios          Tres alternativas de capacidad       │
│  └── Persistencia        localStorage + import/export .json   │
└─────────────────────────────────────────────────────────────┘
```

Además, `src/lib/formato.ts` es una utilidad transversal: centraliza la presentación de pesos,
porcentajes y periodos. **Es el único lugar donde se redondea.** Los cálculos siempre trabajan con
precisión completa, porque redondear el ingreso promedio a `18.333,33` antes de multiplicarlo
desplazaría el VPN en más de $100.000.

### Estado de la aplicación

El caso se guarda en `localStorage` bajo la clave `kronos:caso`. Como el servidor no puede leer el
almacenamiento del navegador, `src/lib/almacen.ts` lo expone como un **almacén suscribible** que los
componentes consumen con `useSyncExternalStore`: durante el renderizado del servidor y la
hidratación se usa el caso por defecto, y en cuanto hay navegador se cambia por lo que el usuario
tenga guardado. Esto evita los errores de hidratación sin leer `localStorage` dentro de un efecto.

---

## 3. Modelo de datos

Tipos definidos en `src/lib/datos.ts`. Los campos numéricos admiten `null` para distinguir «vacío»
de «cero»: así un dato que falta se muestra en blanco y la validación puede pedirlo, en lugar de
calcular con un cero que nadie escribió.

```ts
interface Caso {
  version: string;             // "kronos-1": se valida al abrir un archivo
  aviso?: string;              // Aviso que se muestra en la cabecera del caso
  negocio: Negocio;
  servicios: Servicio[];
  inversion: Inversion;
  personal: Personal;
  proyeccion: (number | null)[];   // Siempre 12 posiciones: meses 1 a 12
  parametros: Parametros;
  escenarios: Escenario[];         // Siempre 3
}

interface Negocio {
  nombre: string;
  propietario: string;
  ubicacion: string;
  actividad: string;
  clientesActuales: number | null;      // clientes/mes
  ingresosActuales: number | null;      // $/mes
  diasOperacion: number | null;         // días/mes
  estacionesActuales: number | null;    // puestos
  trabajadoresActuales: number | null;  // personas
}

interface Servicio {
  id: string;
  nombre: string;
  precio: number | null;                // $
}

interface Inversion {
  descripcion: string;
  estacionesNuevas: number | null;      // puestos que agrega (opcional)
  elementos: ElementoInversion[];
}

interface ElementoInversion {
  id: string;
  elemento: string;
  cantidad: number | null;
  precioUnitario: number | null;        // $
}

interface Personal {
  nuevosTrabajadores: number | null;    // personas
  salarioMensual: number | null;        // $/mes por trabajador
  porcentajePrestaciones: number | null; // 30 = 30 %
  otrosCostosFijos: CostoFijo[];
  gastoInsumos: number | null;          // $/mes
}

interface CostoFijo {
  id: string;
  concepto: string;
  valorMensual: number | null;          // $/mes
}

interface Parametros {
  vidaUtil: number | null;              // años (entero, 1 a 50)
  tasaEvaluacion: number | null;        // % anual (20 = 20 %)
  crecimientoAnual: number | null;      // % anual (4 = 4 %)
  valorSalvamento: number | null;       // $
}

interface Escenario {
  id: string;
  nombre: string;
  clientes: number | null;              // clientes/mes a capacidad plena
}
```

### Relaciones

- Un **caso** tiene un negocio, un conjunto de servicios, una inversión, una configuración de
  personal y costos, una proyección de doce meses, un conjunto de parámetros y tres escenarios.
- La **inversión** tiene muchos elementos; cada elemento aporta `cantidad × precioUnitario` al total.
- **Personal** tiene muchos costos fijos; cada uno aporta su valor mensual al costo fijo total.
- Los **servicios** no participan en ninguna fórmula: son información de contexto que aparece entre
  los supuestos del dashboard.

### Formato de archivo

El botón «Guardar caso» descarga el objeto `Caso` serializado como JSON con el nombre
`kronos-<negocio>.json`. «Abrir caso» lo valida con `validarArchivo()`, que **no confía en el
archivo**: verifica la versión y reconstruye el caso campo por campo, de modo que un archivo con
campos de más, de menos o con tipos equivocados nunca rompe la aplicación. Si no es válido muestra:

> El archivo no es un caso de KRONOS válido. Use un archivo creado con el botón Guardar caso.

---

## 4. Fórmulas implementadas

Todas en `src/lib/calculos.ts`.

### 4.1 Valores derivados

| Concepto | Fórmula |
|---|---|
| Ingreso promedio por cliente | `ingresos actuales ÷ clientes actuales` |
| Costo variable por cliente | `gasto en insumos ÷ clientes actuales` |
| Margen por cliente | `ingreso promedio − costo variable` |
| Costos fijos adicionales mensuales | `(trabajadores × salario) × (1 + % prestaciones) + Σ otros costos fijos` |
| Inversión inicial | `Σ (cantidad × precio unitario)` |
| Clientes por día | `clientes actuales ÷ días de operación` |

### 4.2 Flujo de caja

**Flujo del mes _m_ del año 1:**

```
flujo_m = clientes_m × margen − costos fijos mensuales
```

**Flujo del año 1:** suma de los doce flujos mensuales.

**Flujo de caja anual:**

```
F₀ = − inversión
Fₜ = flujo año 1 × (1 + crecimiento)^(t−1)        para t = 1 … n
Fₙ = Fₙ + valor de salvamento
```

Tomar el año 1 como base de los años siguientes es un **supuesto prudente**: ese año todavía
incluye los meses de arranque con pocos clientes, de modo que el modelo subestima los años de
operación plena. Queda registrado en `REGISTRO_SUPUESTOS.md`.

### 4.3 Valor Presente Neto

```
VPN = Σ  Fₜ ÷ (1 + tasa)^t          con t = 0 … n
```

El año 0 entra con su factor de descuento igual a 1, es decir, la inversión completa.

### 4.4 Tasa Interna de Retorno

Es la tasa que hace `VPN = 0`. Se halla por **bisección** sobre el rango `[−99,99 %, 1000 %]` con
200 iteraciones.

El límite superior del rango es deliberadamente alto: en inversiones pequeñas frente al margen por
cliente la TIR supera con facilidad el 100 %. La del caso base es 171,6 % y la del escenario de
expansión, 378,3 %; un rango convencional de `[0, 100 %]` las dejaría por fuera.

Si los flujos **no cambian de signo** no existe TIR, la función devuelve `null` y la interfaz
muestra «No existe». Es lo que ocurre en el escenario conservador de Espitia: con 250 clientes
adicionales todos los flujos son negativos.

### 4.5 Periodo de recuperación

Se construye una serie mensual para todo el horizonte: los doce meses reales del año 1 y, a partir
del año 2, cada flujo anual repartido en doce meses iguales. **No incluye el valor de salvamento**,
porque ese dinero solo aparecería al liquidar el proyecto.

El periodo de recuperación es el primer mes en que el acumulado alcanza la inversión, interpolando
la fracción del mes:

```
recuperación = i + (inversión − acumulado anterior) ÷ flujo del mes i
```

Si el acumulado nunca alcanza la inversión devuelve `null` y se muestra «No se recupera en el
periodo evaluado». Se presenta en meses con un decimal («9,5 meses») e indicando el mes calendario
en que ocurre («durante el mes 10»). Por encima de 24 meses se muestra en años.

### 4.6 Punto de equilibrio

```
punto de equilibrio = ⌈ costos fijos mensuales ÷ margen por cliente ⌉
```

Redondeado hacia arriba, porque medio cliente no cubre medio costo. Si el margen es menor o igual a
cero devuelve `null`: cada cliente adicional costaría más de lo que deja.

### 4.7 Escenarios

Un escenario conserva **la misma curva de crecimiento** de la proyección y la reescala a la
capacidad plena que se quiere evaluar:

```
clientes_m del escenario = redondear( clientes_m × (clientes del escenario ÷ máximo de la proyección) )
```

Se redondea a enteros porque «93,75 clientes» no es un dato presentable. Si el máximo de la
proyección es cero no hay curva que escalar y la función devuelve `null`, lo que evita una división
por cero. Con la proyección escalada se recalcula todo: ingresos, costos, flujo, VPN, TIR y
recuperación.

---

## 5. Validaciones

`validar(caso)` devuelve una lista de errores con la pantalla donde se corrige cada uno. Mientras
haya errores el dashboard **no calcula**: muestra la lista agrupada por pantalla con un botón «Ir a
corregir». Los mensajes dicen qué falta y por qué hace falta, no códigos técnicos.

| Pantalla | Condición | Mensaje |
|---|---|---|
| Negocio | Nombre vacío | Ingrese el nombre del negocio. |
| Negocio | Clientes actuales vacíos | Ingrese la cantidad de clientes que el negocio atiende actualmente al mes. |
| Negocio | Clientes actuales ≤ 0 | Los clientes actuales deben ser mayores que 0, porque con ellos se calcula el ingreso promedio por cliente. |
| Negocio | Ingresos vacíos | Ingrese los ingresos mensuales actuales del negocio (en pesos). |
| Servicios | Precio negativo | El precio del servicio «X» no puede ser negativo. |
| Inversión | Total en 0 | Ingrese el valor de la inversión: agregue al menos un elemento con cantidad y precio. |
| Inversión | Cantidad o precio negativo | Se nombra el elemento y se indica que no puede ser negativo. |
| Personal | Trabajadores > 0 sin salario | Ingrese el salario mensual de los nuevos trabajadores. |
| Personal | Salario, prestaciones o costo negativo | Se nombra el campo y se indica que no puede ser negativo. |
| Personal | Gasto en insumos vacío | Ingrese el gasto actual en productos, herramientas e insumos (en pesos al mes). |
| Proyección | Meses sin clientes | Ingrese la cantidad de clientes proyectados en: mes X, mes Y. |
| Proyección | Los 12 meses en 0 | La proyección no puede quedar en 0 en los 12 meses: ingrese al menos un mes con clientes adicionales. |
| Parámetros | Vida útil no entera o fuera de 1–50 | Ingrese un periodo de evaluación válido: un número entero de años entre 1 y 50. |
| Parámetros | Tasa vacía | Ingrese la tasa de evaluación. |
| Parámetros | Tasa negativa | La tasa debe ser mayor o igual a 0 %. |
| Parámetros | Crecimiento vacío | Ingrese el crecimiento anual (puede ser 0 %). |

### Advertencias

`advertencias(caso)` devuelve avisos que **no bloquean** el cálculo:

- Si el costo variable por cliente es igual o mayor que el ingreso promedio, se avisa que cada
  cliente adicional genera pérdida.
- Si la proyección máxima queda por debajo del punto de equilibrio, se avisa que el proyecto no
  alcanza a cubrir sus costos fijos.

---

## 6. Pruebas

`tests/validacion-espitia.test.ts` ejecuta 29 pruebas con Vitest. Verifica, con el caso real:

- Los valores derivados: inversión, ingreso promedio, costo variable, margen, costos fijos, punto de
  equilibrio y clientes por día.
- El flujo de caja: años 0, 1, 2 y 10, y que la tabla descontada cierre exactamente en el VPN.
- Los indicadores: VPN, TIR y periodo de recuperación.
- Los tres escenarios, incluido que el conservador no tenga TIR ni recuperación y que el esperado
  coincida con el caso base.
- Las validaciones de tasa negativa, vida útil 0, inversión vacía, meses sin clientes y clientes
  actuales en 0.

```bash
npm test
```

---

## 7. Diseño responsive

| Ancho | Comportamiento |
|---|---|
| 390 px (celular) | KPIs en 2 columnas. Las tablas editables se convierten en tarjetas apiladas con la etiqueta de cada campo. Las barras de pasos y de acciones se desplazan horizontalmente dentro de su contenedor. |
| 768 px (tablet) | KPIs en 3 columnas. Las tablas editables vuelven a su forma de tabla con encabezados. |
| 1366 px (computador) | KPIs en 6 columnas. Las gráficas se organizan en dos columnas. |

`html { overflow-x: hidden }` garantiza que la página nunca tenga scroll horizontal. Las tablas de
resultados, que sí necesitan ancho, se desplazan **dentro de su propio contenedor**
(`.desplazable-x`). Todas las gráficas van en `ResponsiveContainer`, por lo que se ajustan al ancho
disponible.

Accesibilidad: todos los campos tienen etiqueta asociada, los controles miden al menos 44 px de
alto, el foco es visible con un contorno dorado de 3 px, hay un enlace «Saltar al contenido» y las
pestañas usan `role="tab"` con `aria-selected`.

---

## 8. Impresión

El botón «Imprimir o guardar en PDF» llama a `window.print()`. La hoja de estilos de impresión
(`src/app/globals.css`) oculta todo lo marcado con `.sin-impresion` —encabezado, navegación,
pestañas y botones—, muestra el bloque `.solo-impresion` con el nombre del caso, evita que las
tarjetas se partan entre páginas y expande las tablas que en pantalla tienen scroll.

---

## 9. Despliegue

El proyecto se despliega en **Vercel** sin configuración adicional: no usa variables de entorno,
rutas dinámicas ni servicios externos. Las cuatro rutas se generan como contenido estático.

```bash
npm run build   # debe terminar sin errores ni advertencias de TypeScript
npm run start   # sirve la versión de producción en local
```

Pasos en Vercel: importar el repositorio de GitHub → Deploy. Cada `git push` a la rama principal
vuelve a desplegar automáticamente.
