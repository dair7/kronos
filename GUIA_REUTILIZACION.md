# Guía de reutilización — KRONOS

KRONOS no es una demostración de un solo caso cerrado. Está construido para que **cualquier negocio,
curso o comunidad** cargue sus propios datos y obtenga su propia evaluación.

Esta guía explica cómo hacerlo.

---

## 1. Qué clase de decisión se puede evaluar

KRONOS sirve para cualquier decisión que tenga esta forma:

> *Invierto una cantidad de dinero hoy para poder atender más clientes (o producir más) a partir de
> mañana. ¿Me conviene?*

Ejemplos que encajan directamente:

| Decisión | Qué sería la inversión | Qué serían los clientes adicionales |
|---|---|---|
| **Comprar una máquina** | Precio del equipo, instalación y puesta en marcha | Unidades o servicios extra que permite producir |
| **Ampliar un local** | Obra, mobiliario, adecuaciones | Clientes que caben en el espacio nuevo |
| **Contratar personal** | Dotación, equipos y puesto de trabajo | Clientes que alcanza a atender la persona nueva |
| **Abrir un área o servicio nuevo** | Equipos e insumos iniciales del área | Clientes del nuevo servicio |
| **Comprar un vehículo de reparto** | Vehículo y adecuación | Pedidos adicionales que se pueden entregar |
| **Ampliar el horario** | Equipos y adecuaciones necesarias | Clientes de la franja nueva |

Lo que **no** encaja: decisiones sin un ingreso identificable por cliente (por ejemplo, una campaña
de imagen sin meta de clientes) o proyectos donde el ingreso no crece con el volumen atendido.

---

## 2. El recorrido completo, en ocho pasos

### Paso 1 · Crear el caso nuevo

En el menú lateral, pulse **Más → Nuevo caso** y confirme. Queda un formulario en blanco con la misma
estructura del caso real.

### Paso 2 · Datos del negocio

Escriba cómo opera el negocio **hoy**: nombre, propietario, ubicación, actividad, clientes al mes,
ingresos al mes, días de operación, puestos de atención y trabajadores.

De estos dos datos sale la pieza más importante del modelo:

```
ingreso promedio por cliente = ingresos actuales ÷ clientes actuales
```

> Si el negocio no cuenta «clientes» sino unidades —panes, pedidos, horas facturadas—, use esa
> unidad de forma consistente en todo el caso. KRONOS no exige que sean personas: exige que sea
> siempre lo mismo.

### Paso 3 · Servicios

Liste los servicios o productos y sus precios. Es **opcional** y no cambia ningún cálculo: queda
como información de contexto en los supuestos del informe.

### Paso 4 · Inversión

Liste cada elemento con su cantidad y su precio unitario. El total se calcula solo. Incluya todo lo
que haya que desembolsar antes de empezar a operar: equipos, mobiliario, obra, instalación,
permisos.

### Paso 5 · Personal y costos

Registre **solo los costos que aparecen con la inversión**, no los que el negocio ya tiene:

- **Personal nuevo:** cuántas personas, cuánto gana cada una y el porcentaje de prestaciones.
- **Otros costos fijos:** servicios públicos adicionales, arriendo del espacio nuevo, internet,
  mantenimiento. Todo lo que se pague cada mes sin importar cuántos clientes entren.
- **Gasto en insumos:** lo que el negocio gasta hoy al mes en lo que se consume al atender clientes.
  De aquí sale el costo variable por cliente.

> **Si paga por comisión en vez de salario:** no lo registre como salario, porque el salario es un
> costo fijo. Súmelo al gasto en insumos, que es lo que alimenta el costo variable por cliente. Un
> barbero, estilista o vendedor a comisión se comporta como costo variable, no como costo fijo.

### Paso 6 · Proyección

Escriba cuántos clientes adicionales espera atender en cada uno de los doce meses del primer año.

Use el campo **«Llenar todos los meses con»** para poner una cifra base en los doce y luego ajuste
los primeros meses hacia abajo. Casi ningún proyecto llega a capacidad plena el primer mes: una
rampa de crecimiento es más realista y más prudente.

Mientras escribe, el panel lateral muestra el **punto de equilibrio**. Si su proyección máxima queda
por debajo de él, el proyecto no cubrirá sus costos fijos y KRONOS se lo advertirá.

### Paso 7 · Parámetros

- **Periodo de evaluación:** años que durará lo que compró.
- **Tasa de evaluación (TMAR):** la rentabilidad mínima que usted le exige a su dinero.
- **Crecimiento anual:** cuánto crece el flujo cada año. Puede ser 0 %.
- **Valor de salvamento:** lo recuperable al vender los equipos al final. Puede ser 0.

### Paso 8 · Resultados y guardado

Pulse **Calcular y ver resultados →**. Revise los indicadores, la interpretación y los escenarios.

Antes de cerrar, pulse **Guardar caso**: se descarga un archivo `.json` con todo. Guárdelo donde
quiera y recupérelo después con **Abrir caso**, en este o en cualquier otro computador.

---

## 3. Caso de ejemplo incluido

La opción **Más → Caso de ejemplo** del menú lateral carga un segundo caso completo: una **panadería que
compra un horno rotatorio industrial**. El mismo caso está en la carpeta `ejemplos/` como archivo
`.json`, junto con el caso real de Espitia, por si prefiere cargarlo con **Abrir caso** o llevarlo
en una memoria USB.

> ⚠️ **Los datos de ese caso son ficticios.** No corresponden a ninguna empresa real y no deben
> citarse como evidencia en ningún documento. Existe únicamente para mostrar que la herramienta
> funciona con un negocio y una decisión distintos a los del caso original.

Sirve para ver cómo cambia todo el modelo cuando cambia la naturaleza del negocio:

| | Espitia Barber Shop (caso real) | Panadería (ejemplo ilustrativo) |
|---|---|---|
| Decisión | Segunda estación de trabajo | Horno rotatorio industrial |
| Inversión | $8.300.000 | $17.200.000 |
| Unidad de medida | Clientes atendidos | Clientes atendidos |
| Ingreso promedio | $18.333 por cliente | $3.000 por cliente |
| Margen por cliente | $16.917 | $1.800 |
| Personal nuevo | 2 barberos | 1 panadero |
| Punto de equilibrio | 269 clientes/mes | 1.323 clientes/mes |
| VPN | $57.999.490 | $18.461.141 |
| TIR | 171,6 % | 45,9 % |
| Recuperación | 9,5 meses | 2,3 años (mes 28) |

El contraste es útil: un negocio de **margen alto y volumen bajo** recupera la inversión en meses,
mientras que uno de **margen bajo y volumen alto** necesita años y mucho más volumen para lograrlo.
El mismo modelo describe correctamente los dos.

---

## 4. Compartir un caso

El archivo `.json` que descarga **Guardar caso** es el caso completo. Se puede:

- enviar por correo o WhatsApp a un socio, un asesor o un profesor;
- guardar como respaldo antes de probar otros números;
- usar como punto de partida para un caso parecido: ábralo, cambie lo que corresponda y vuelva a
  guardarlo con el nuevo nombre;
- entregarlo como anexo de un trabajo académico, para que quien lo revise reproduzca los resultados
  exactos.

El archivo no contiene información personal ni credenciales: solo los datos económicos que usted
escribió.

---

## 5. Usarlo en clase

Para un curso de Ingeniería Económica, KRONOS funciona bien como herramienta de taller:

1. El docente prepara un caso base y lo distribuye como archivo `.json`.
2. Cada estudiante lo abre con **Abrir caso** y modifica una variable: la tasa, el crecimiento, el
   salario, la proyección.
3. Comparan qué le pasa al VPN, a la TIR y al punto de equilibrio.
4. La pestaña **Escenarios** permite discutir tres alternativas con las mismas cifras a la
   vista, sin que el software sugiera cuál es «la correcta».

La tarjeta **«Supuestos del escenario»** del dashboard hace explícito cada parámetro, lo que facilita
discutir de dónde sale cada número en lugar de aceptar un resultado cerrado.

---

## 6. Límites que conviene conocer antes de reutilizarlo

KRONOS es un prototipo académico. Antes de apoyar una decisión real en él, tenga presente que el
modelo:

- **no incluye impuestos** sobre las utilidades del proyecto;
- **no calcula depreciación** ni su efecto fiscal;
- **no contempla reposición de equipos** durante el periodo evaluado;
- **no modela estacionalidad**: la proyección es la que usted escriba, mes a mes;
- **no considera capital de trabajo** para sostener los meses de flujo negativo;
- **asume financiación con recursos propios**: no hay créditos ni costos financieros;
- **supone que el ingreso promedio por cliente se mantiene** durante todo el horizonte.

Los resultados dependen por completo de los datos ingresados y de estos supuestos. KRONOS organiza y
calcula; la decisión y su responsabilidad siguen siendo de quien conoce el negocio.
