# Registro de supuestos — KRONOS

Caso real: **Espitia Barber Shop**, San Pelayo (Córdoba). Propietario: **Álvaro Espitia**.
Proyecto evaluado: instalación de una segunda estación de trabajo y contratación de dos nuevos
barberos.

Este documento registra **todo dato que no sea un registro histórico directo del negocio**. La guía
del TCC exige que las tasas, periodos y demás hipótesis sean explícitas; dejarlas por escrito no
debilita el trabajo, muestra con qué se construyó la evaluación.

---

## 1. Datos suministrados por el propietario

Son la base del modelo. Fueron entregados por Álvaro Espitia con autorización para usarlos en este
trabajo.

| Dato | Valor | Unidad |
|---|---|---|
| Clientes atendidos | 600 | clientes/mes |
| Ingresos | 11.000.000 | $/mes |
| Días de operación | 25 | días/mes |
| Estaciones de trabajo | 1 | puestos |
| Barberos (incluido el propietario) | 2 | personas |
| Local | Propio | — |
| Gasto en productos, herramientas e insumos | 850.000 | $/mes |
| Inversión de la segunda estación | 8.300.000 | $ |
| Nuevos barberos por contratar | 2 | personas |
| Salario de cada nuevo barbero | 1.700.000 | $/mes |

Precios de los servicios registrados: corte $15.000 · corte + barba $25.000 · arreglo de barba
$10.000 · corte infantil $10.000 · diseño $20.000. Estos precios quedan en el catálogo del software
como información de contexto y **no entran en ninguna fórmula** (ver supuesto 3.1).

Detalle de la inversión:

| Elemento | Valor |
|---|---|
| Silla | $600.000 |
| Espejo | $150.000 |
| Mobiliario | $500.000 |
| Máquina de corte | $300.000 |
| Máquina de acabado | $120.000 |
| Secador | $280.000 |
| Iluminación | $250.000 |
| Aire acondicionado / ventilación | $1.400.000 |
| Adecuación del espacio | $1.700.000 |
| Instalación | $3.000.000 |
| **Total** | **$8.300.000** |

---

## 2. Parámetros de evaluación económica

| Parámetro | Valor | Justificación |
|---|---|---|
| **Tasa de evaluación (TMAR)** | 20 % anual | Rentabilidad mínima que el propietario exige a su dinero. Está por encima del rendimiento de alternativas financieras de bajo riesgo en Colombia, lo que incorpora una prima por el riesgo del negocio. Aparece dentro de la información financiera suministrada para el caso. |
| **Periodo de evaluación (vida útil)** | 10 años | Horizonte estimado de vida útil del mobiliario y los equipos de la nueva estación. |
| **Crecimiento anual del flujo** | 4 % anual | Crecimiento moderado del flujo neto del proyecto año tras año. Supone que ingresos y costos crecen en la misma proporción, de modo que es un crecimiento real del volumen de operación, no un ajuste por inflación. |
| **Valor de salvamento** | $830.000 | 10 % de la inversión inicial. Es lo que se estima recuperable vendiendo mobiliario y equipos al cabo de diez años. Se suma al flujo del último año. |
| **Prestaciones sociales** | 30 % sobre los salarios | Carga prestacional aproximada en Colombia: salud, pensión, cesantías, intereses sobre cesantías y primas. Equivale a $1.020.000 mensuales sobre los $3.400.000 de salarios. |

---

## 3. Supuestos del modelo

### 3.1 El ingreso promedio por cliente es una aproximación

El modelo usa:

```
ingreso promedio por cliente = $11.000.000 ÷ 600 = $18.333,33
```

**No es el precio de un servicio concreto.** Es el valor promedio que deja cada cliente que entra al
negocio, y tiene dos ventajas sobre promediar la lista de precios: ya refleja la mezcla real de
servicios que pide la clientela, e incorpora los servicios combinados y cualquier venta adicional.

Es importante notar que el promedio simple de la lista de precios es $16.000, inferior a los
$18.333. La diferencia indica que la mezcla real está cargada hacia los servicios de mayor valor
—principalmente corte + barba, a $25.000—. Se prefiere el dato derivado de los ingresos reales
porque es un registro observado y no una estimación de participación por servicio.

### 3.2 El costo variable por cliente se deriva del gasto actual en insumos

```
costo variable por cliente = $850.000 ÷ 600 = $1.416,67
```

Se asume que cada cliente adicional consume insumos en la misma proporción que un cliente actual.
El margen por cliente resultante es de **$16.916,67**.

### 3.3 Los nuevos barberos trabajan a salario fijo, no a comisión

**Este es el supuesto con mayor efecto sobre el resultado y conviene leerlo con atención.**

El modelo carga $1.700.000 mensuales por barbero más 30 % de prestaciones, como un **costo fijo**.
Así lo informó el propietario. Sin embargo, en el sector de barberías es frecuente la vinculación
**a comisión** sobre lo producido, que se comporta de manera distinta: sería un **costo variable por
cliente**, no un costo fijo.

El efecto de la diferencia es considerable. Con una comisión del 50 %, por ejemplo, el costo
variable por cliente pasaría de $1.416,67 a cerca de $10.584, el margen por cliente caería a unos
$7.750 y tanto el VPN como el punto de equilibrio cambiarían de forma sustancial.

Si otro negocio remunera por comisión, **no debe registrar ese valor como salario**: debe sumarlo al
campo de gasto en insumos, que es el que alimenta el costo variable por cliente. KRONOS lo absorbe
sin modificar el modelo.

### 3.4 Proyección de clientes adicionales

Se supone que la nueva estación no alcanza su capacidad plena de inmediato, sino que llena
gradualmente durante el primer semestre:

| Mes | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Clientes adicionales | 150 | 200 | 250 | 300 | 350 | 400 | 400 | 400 | 400 | 400 | 400 | 400 |

Total del año 1: **4.050 clientes adicionales**. Capacidad plena: **400 clientes/mes**.

La meta de 400 clientes adicionales es conservadora frente a la capacidad instalada. Hoy el negocio
atiende 24 clientes al día con una estación y dos barberos, es decir, 12 por barbero. Con dos
estaciones y cuatro barberos la carga sería de 40 clientes al día, es decir, **10 por barbero**:
menos de lo que cada uno atiende actualmente. La proyección no exige más rendimiento del que el
negocio ya demuestra.

### 3.5 Costos adicionales considerados

Solo se incluyen los costos que **aparecen con la ampliación**, no los que el negocio ya tiene.

| Concepto | Valor mensual |
|---|---|
| Salarios de los dos nuevos barberos | $3.400.000 |
| Prestaciones (30 %) | $1.020.000 |
| Electricidad adicional | $100.000 |
| Agua adicional | $30.000 |
| **Costos fijos adicionales** | **$4.550.000** |

Los costos actuales del negocio —electricidad $400.000, agua $50.000, internet $80.000, salarios
$1.700.000, productos $500.000, máquinas y herramientas $150.000, otros insumos $200.000— no entran
en el flujo del proyecto, porque existen con o sin la inversión. El gasto en productos, herramientas
e insumos sí se usa, pero únicamente para derivar el costo variable por cliente (supuesto 3.2).

No se incluye arriendo porque el local es propio.

### 3.6 Supuesto prudente: el año 1 como base de los años siguientes

El flujo de cada año posterior se calcula como:

```
flujo del año t = flujo del año 1 × (1 + 4 %)^(t−1)
```

El año 1 incluye los meses de arranque, en los que la nueva estación todavía no está llena: su
total es de 4.050 clientes adicionales, no de 4.800. Tomarlo como base de los años siguientes
**subestima deliberadamente** la operación en régimen pleno.

Para dimensionar el efecto: si el año 2 se calculara a capacidad plena —4.800 clientes— su flujo
sería de unos **$26.600.000**, frente a los **$14.469.000** que usa el modelo. La evaluación es, por
tanto, más exigente con el proyecto de lo que la realidad proyectada indicaría.

Se eligió esta base porque un prototipo de evaluación debe equivocarse del lado conservador: si el
proyecto resulta conveniente bajo un supuesto pesimista, la conclusión es más robusta.

### 3.7 El catálogo de servicios es informativo

Los servicios y sus precios se registran en el software y aparecen entre los supuestos del
dashboard, pero no participan en ningún cálculo, por la razón explicada en el supuesto 3.1.

---

## 4. Lo que el modelo NO incluye

Estas son limitaciones conscientes de un prototipo académico:

- **Impuestos.** No se descuenta impuesto de renta ni ningún otro tributo sobre las utilidades del
  proyecto.
- **Depreciación.** No se calcula depreciación contable de los equipos ni su efecto fiscal.
- **Reposición de equipos.** Se asume que el mobiliario y las máquinas duran los diez años evaluados
  sin necesidad de reemplazo. En la práctica, las máquinas de corte y acabado probablemente
  requerirían reposición antes.
- **Inflación.** No se modela por separado: el crecimiento del 4 % anual se aplica al flujo neto, lo
  que supone que ingresos y costos se mueven en la misma proporción.
- **Estacionalidad.** La proyección no distingue meses de mayor o menor demanda.
- **Capital de trabajo.** No se considera la necesidad de caja para operar durante los primeros
  meses, en los que el flujo es negativo.
- **Financiación.** Se asume que la inversión se cubre con recursos propios: no hay créditos ni
  costos financieros.

---

## 5. Resultados obtenidos con estos supuestos

| Indicador | Valor |
|---|---|
| Inversión inicial | $8.300.000 |
| Ingreso promedio por cliente | $18.333,33 |
| Costo variable por cliente | $1.416,67 |
| Margen por cliente | $16.916,67 |
| Costos fijos adicionales | $4.550.000 /mes |
| Flujo neto del año 1 | $13.912.500 |
| Flujo del año 2 | $14.469.000 |
| Flujo del año 10 (con salvamento) | $20.631.826 |
| **VPN** | **$57.999.490** |
| **TIR** | **171,6 %** |
| **Periodo de recuperación** | **9,47 meses** (durante el mes 10) |
| **Punto de equilibrio** | **269 clientes adicionales/mes** |
| Margen de seguridad | 48,7 % por encima del punto de equilibrio |

### Sobre la magnitud de la TIR

Una TIR del 171,6 % no debe leerse como una promesa de rentabilidad. Aparece porque la inversión
($8.300.000) es pequeña frente al margen que deja cada cliente adicional ($16.916,67): bastan unos
pocos meses de operación para devolverla. En casos así, la decisión debe apoyarse en el **VPN** y en
el **punto de equilibrio**, que son menos sensibles al tamaño de la inversión.

### Escenarios evaluados

| Escenario | Clientes/mes | VPN | TIR | Recuperación |
|---|---|---|---|---|
| A — Conservador | 250 | −$64.127.764 | No existe | No se recupera |
| B — Esperado | 400 | $57.999.490 | 171,6 % | 9,5 meses |
| C — Expansión | 500 | $139.578.564 | 378,3 % | 6,2 meses |

El escenario A queda por debajo del punto de equilibrio de 269 clientes, de modo que todos sus
flujos son negativos. Al no haber cambio de signo en la serie de flujos, la TIR no está definida
matemáticamente y el software muestra «No existe».

---

## 6. Cómo verificar estos valores

Las pruebas automatizadas del proyecto comprueban cada una de las cifras de la sección 5:

```bash
npm test
```
