# KRONOS

**Herramienta web para evaluar económicamente proyectos de inversión de pequeños negocios.**

KRONOS toma los datos de un negocio y de la inversión que quiere hacer, arma el flujo de caja del
proyecto y responde con indicadores de Ingeniería Económica —VPN, TIR, periodo de recuperación y
punto de equilibrio— presentados en un dashboard con gráficas, supuestos visibles y una
interpretación en palabras.

> Trabajo Colaborativo Contextualizado · Ingeniería Económica · Programa de Ingeniería de Software.

**URL del despliegue:** _(pendiente)_

---

## Qué es

Una aplicación web que convierte los datos operativos de un negocio en información para decidir si
una inversión conviene. No es un formulario que entrega un número suelto: es un dashboard que
muestra el estado completo del caso, sus supuestos, la comparación entre alternativas y una lectura
del resultado.

El **caso inicial** es real: **Espitia Barber Shop** (San Pelayo, Córdoba), cuyo propietario es
**Álvaro Espitia**. Evalúa instalar una segunda estación de trabajo y contratar dos nuevos barberos.
Los datos fueron suministrados por el propietario con autorización para usarlos en este trabajo.

## Para quién es

- **Dueños de pequeños negocios de servicios** que necesitan decidir sobre una inversión concreta:
  comprar una máquina, ampliar un local, abrir un área nueva o contratar personal.
- **Emprendedores** que quieren saber cuántos clientes necesitan para que un proyecto se sostenga.
- **Estudiantes de Ingeniería Económica** que requieren una herramienta para resolver y presentar
  casos de evaluación de inversiones.

## Qué problema resuelve

Espitia Barber Shop opera con una sola estación de trabajo y pierde clientes que no alcanza a
atender. El propietario quiere ampliar, pero decidir con la sola intuición de que «con otra silla
entran más clientes» deja por fuera la inversión inicial, los salarios de los nuevos barberos, las
prestaciones, los servicios públicos adicionales y el tiempo que toma llenar la nueva estación.

La decisión económica que hoy está mal soportada es esta: **¿la ampliación genera ingresos
adicionales suficientes para compensar la inversión y los nuevos costos de funcionamiento?** KRONOS
reúne esos datos, los proyecta en el tiempo y entrega los indicadores que permiten responderla.

El costo de no resolverlo es doble: seguir perdiendo clientes por falta de capacidad, o invertir
$8.300.000 sin una evaluación que respalde la decisión.

## Tecnologías

| Parte | Tecnología |
|---|---|
| Framework | Next.js 16 (App Router) |
| Lenguaje | TypeScript |
| Estilos | Tailwind CSS 4 |
| Gráficas | Recharts 3 |
| Pruebas | Vitest |
| Datos | `localStorage` del navegador y archivos `.json` |
| Despliegue | Vercel |

No hay backend ni base de datos: el caso vive en el navegador y se puede exportar e importar como
archivo, lo que hace la herramienta portable y gratuita de desplegar.

## Estructura del proyecto

```
.
├── src/
│   ├── lib/                     Capa de datos y lógica (sin React)
│   │   ├── datos.ts             Tipos del caso, caso Espitia, caso de ejemplo,
│   │   │                        caso vacío y validación de archivos .json
│   │   ├── calculos.ts          Validaciones, derivados, VPN, TIR, recuperación,
│   │   │                        punto de equilibrio, escenarios e interpretación
│   │   ├── formato.ts           Pesos colombianos, porcentajes y periodos
│   │   └── almacen.ts           Persistencia en el navegador
│   ├── components/              Capa de interfaz
│   │   ├── ui/                  Componentes reutilizables del sistema de diseño
│   │   ├── pantallas/           Las seis pantallas de captura de datos
│   │   └── dashboard/           KPIs, gráficas, tablas e interpretación
│   └── app/                     Páginas (App Router)
│       ├── page.tsx             Bienvenida
│       ├── evaluar/             Captura de datos por pasos
│       └── resultados/          Dashboard
├── tests/
│   └── validacion-espitia.test.ts
├── ejemplos/                    Casos .json listos para abrir
└── capturas/                    Imágenes del manual de usuario
```

La arquitectura está separada en tres capas y `src/lib/calculos.ts` **no importa nada de React**:
toda la evaluación económica se puede probar sin levantar el navegador.

## Cómo instalar

Requiere **Node.js 20.9 o superior**.

```bash
npm install
```

## Cómo ejecutar en local

```bash
npm run dev
```

Luego abra <http://localhost:3000>.

Para probar la versión de producción:

```bash
npm run build
npm run start
```

## Cómo correr las pruebas

```bash
npm test
```

Las pruebas cargan el caso real de Espitia Barber Shop y verifican que el modelo produzca
exactamente los valores documentados en `REGISTRO_SUPUESTOS.md`: inversión de $8.300.000, flujo del
año 1 de $13.912.500, VPN de $57.999.490, TIR de 171,6 %, recuperación a los 9,47 meses y punto de
equilibrio de 269 clientes adicionales al mes. También comprueban los tres escenarios de
comparación y las validaciones de datos.

Para dejarlas corriendo mientras se edita el código:

```bash
npm run test:watch
```

## Cómo desplegar en Vercel

1. Suba el proyecto a un repositorio de GitHub.
2. Entre a [vercel.com](https://vercel.com) e inicie sesión con la cuenta de GitHub.
3. **Add New → Project** y seleccione el repositorio.
4. Vercel detecta Next.js automáticamente: no hay que cambiar ninguna configuración, ni agregar
   variables de entorno, ni conectar bases de datos.
5. **Deploy**. En uno o dos minutos la URL queda publicada.
6. Copie esa URL y péguela arriba, en «URL del despliegue», y en los anexos del documento del TCC.

Cada vez que se haga `git push` a la rama principal, Vercel vuelve a desplegar automáticamente.

## Otros documentos

| Archivo | Contenido |
|---|---|
| [MANUAL_USUARIO.md](MANUAL_USUARIO.md) | Paso a paso de cada tarea, con capturas |
| [DOCUMENTACION_TECNICA.md](DOCUMENTACION_TECNICA.md) | Stack, arquitectura, modelo de datos y fórmulas |
| [REGISTRO_SUPUESTOS.md](REGISTRO_SUPUESTOS.md) | Todos los supuestos y parámetros del caso real |
| [GUIA_REUTILIZACION.md](GUIA_REUTILIZACION.md) | Cómo cargar el caso de otro negocio |

## Límites del prototipo

Los resultados dependen por completo de los datos que ingrese el usuario. El modelo no incluye
impuestos, depreciación ni reposición de equipos, y no reemplaza la contabilidad formal del negocio.
Es una herramienta de apoyo a la decisión, no una garantía de comportamiento futuro.
