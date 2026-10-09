/**
 * Validacion del modelo economico de KRONOS con el caso real de
 * Espitia Barber Shop.
 *
 * Estas pruebas son la verificacion que exige la especificacion del software:
 * cargar el caso real y comprobar que los indicadores coinciden con el modelo
 * economico documentado en REGISTRO_SUPUESTOS.md.
 *
 * Ejecutar con: npm test
 */

import { describe, expect, it } from "vitest";
import { CASO_ESPITIA, clonarCaso, casoVacio } from "@/lib/datos";
import { derivados, evaluar, evaluarEscenario, validar } from "@/lib/calculos";

describe("Caso Espitia Barber Shop — valores derivados", () => {
  const d = derivados(CASO_ESPITIA);

  it("la inversion total es de $8.300.000", () => {
    expect(d.inversionTotal).toBe(8_300_000);
  });

  it("el ingreso promedio por cliente es $18.333,33 ($11.000.000 / 600)", () => {
    expect(d.ingresoPromedio).toBeCloseTo(18_333.33, 2);
  });

  it("el costo variable por cliente es $1.416,67 ($850.000 / 600)", () => {
    expect(d.costoVariable).toBeCloseTo(1_416.67, 2);
  });

  it("el margen por cliente es $16.916,67", () => {
    expect(d.margen).toBeCloseTo(16_916.67, 2);
  });

  it("los costos fijos adicionales son $4.550.000 al mes", () => {
    // (2 x 1.700.000) x 1,30 + 100.000 + 30.000
    expect(d.costosFijosMensuales).toBe(4_550_000);
    expect(d.salarios).toBe(3_400_000);
    expect(d.prestaciones).toBe(1_020_000);
    expect(d.otrosCostos).toBe(130_000);
  });

  it("el punto de equilibrio es de 269 clientes adicionales al mes", () => {
    expect(d.puntoEquilibrio).toBe(269);
    expect(d.puntoEquilibrioExacto as number).toBeCloseTo(268.97, 2);
  });

  it("el margen de seguridad es 32,8 % ((400 - 268,97) / 400)", () => {
    expect(d.margenSeguridad as number).toBeCloseTo(32.76, 2);
    // La holgura frente al equilibrio (48,7 %) es otro dato, no el margen de seguridad.
    expect(d.sobreEquilibrio as number).toBeCloseTo(48.7, 1);
  });

  it("la proyeccion del anio 1 suma 4.050 clientes adicionales", () => {
    expect(d.clientesAnio1).toBe(4_050);
    expect(d.proyeccionMaxima).toBe(400);
  });

  it("el negocio atiende 24 clientes por dia (600 / 25)", () => {
    expect(d.clientesPorDia).toBe(24);
  });
});

describe("Caso Espitia Barber Shop — flujo de caja e indicadores", () => {
  const r = evaluar(CASO_ESPITIA);

  it("el flujo neto del anio 1 es $13.912.500", () => {
    expect(r.flujoAnio1).toBeCloseTo(13_912_500, 4);
  });

  it("el flujo del anio 2 es $14.469.000 (crecimiento del 4 %)", () => {
    expect(r.flujosAnuales[2]).toBeCloseTo(14_469_000, 4);
  });

  it("el flujo del anio 10 es $20.631.826 e incluye el salvamento", () => {
    expect(Math.round(r.flujosAnuales[10])).toBe(20_631_826);
  });

  it("el anio 0 es la inversion con signo negativo", () => {
    expect(r.flujosAnuales[0]).toBe(-8_300_000);
    expect(r.flujosAnuales).toHaveLength(11); // anios 0 a 10
  });

  it("el VPN es $57.999.490 a una tasa del 20 % anual", () => {
    expect(Math.round(r.vpn)).toBe(57_999_490);
  });

  it("la TIR es 171,6 %", () => {
    expect(r.tir).not.toBeNull();
    expect((r.tir as number) * 100).toBeCloseTo(171.6, 1);
  });

  it("la inversion se recupera a los 9,47 meses (durante el mes 10)", () => {
    expect(r.recuperacionMeses).not.toBeNull();
    expect(r.recuperacionMeses as number).toBeCloseTo(9.47, 2);
    expect(Math.ceil(r.recuperacionMeses as number)).toBe(10);
  });

  it("la recuperacion descontada (tasa mensual (1,20)^(1/12) - 1) es de 10,07 meses", () => {
    expect(r.recuperacionDescontadaMeses).not.toBeNull();
    expect(r.recuperacionDescontadaMeses as number).toBeCloseTo(10.07, 2);
    expect(r.recuperacionDescontadaMeses as number).toBeGreaterThan(r.recuperacionMeses as number);
  });

  it("los tres primeros meses tienen flujo negativo por la rampa de clientes", () => {
    expect(r.flujosMensuales[0]).toBeLessThan(0);
    expect(r.flujosMensuales[1]).toBeLessThan(0);
    expect(r.flujosMensuales[2]).toBeLessThan(0);
    expect(r.flujosMensuales[3]).toBeGreaterThan(0);
  });

  it("la tabla de flujo descontado cierra en el VPN", () => {
    const ultima = r.tablaFlujo[r.tablaFlujo.length - 1];
    expect(ultima.acumulado).toBeCloseTo(r.vpn, 4);
  });
});

describe("Comparacion de escenarios", () => {
  const escenarios = CASO_ESPITIA.escenarios;

  it("el escenario A (250 clientes) da VPN negativo, sin TIR y sin recuperacion", () => {
    const a = evaluarEscenario(CASO_ESPITIA, escenarios[0].nombre, 250);
    expect(a).not.toBeNull();
    expect(a!.clientes).toBe(250);
    expect(a!.flujoAnio1).toBeCloseTo(-11_767_000, 4);
    expect(Math.round(a!.vpn)).toBe(-64_127_764);
    expect(a!.vpn).toBeLessThan(0);
    expect(a!.tir).toBeNull(); // no hay cambio de signo en los flujos
    expect(a!.recuperacionMeses).toBeNull();
    expect(a!.sobreEquilibrio).toBe(false); // 250 < 269
  });

  it("el escenario B (400 clientes) coincide con el caso base", () => {
    const base = evaluar(CASO_ESPITIA);
    const b = evaluarEscenario(CASO_ESPITIA, escenarios[1].nombre, 400);
    expect(b).not.toBeNull();
    expect(b!.flujoAnio1).toBeCloseTo(base.flujoAnio1, 4);
    expect(b!.vpn).toBeCloseTo(base.vpn, 4);
    expect(b!.tir as number).toBeCloseTo(base.tir as number, 6);
    expect(b!.recuperacionMeses as number).toBeCloseTo(base.recuperacionMeses as number, 6);
    expect(b!.sobreEquilibrio).toBe(true);
  });

  it("el escenario C (500 clientes) da VPN $139.578.564, TIR 378,3 % y recuperacion 6,2 meses", () => {
    const c = evaluarEscenario(CASO_ESPITIA, escenarios[2].nombre, 500);
    expect(c).not.toBeNull();
    expect(c!.proyeccion).toEqual([188, 250, 313, 375, 438, 500, 500, 500, 500, 500, 500, 500]);
    expect(c!.flujoAnio1).toBeCloseTo(31_066_000, 4);
    expect(Math.round(c!.vpn)).toBe(139_578_564);
    expect((c!.tir as number) * 100).toBeCloseTo(378.3, 1);
    expect(c!.recuperacionMeses as number).toBeCloseTo(6.18, 2);
    expect(c!.sobreEquilibrio).toBe(true);
    expect(c!.distanciaEquilibrio).toBe(231); // 500 - 269
  });

  it("la proyeccion escalada se redondea a clientes enteros", () => {
    const a = evaluarEscenario(CASO_ESPITIA, "A", 250);
    expect(a!.proyeccion).toEqual([94, 125, 156, 188, 219, 250, 250, 250, 250, 250, 250, 250]);
    a!.proyeccion.forEach((c) => expect(Number.isInteger(c)).toBe(true));
  });

  it("no se puede escalar un escenario si la proyeccion esta en cero", () => {
    const caso = clonarCaso(CASO_ESPITIA);
    caso.proyeccion = Array(12).fill(0);
    expect(evaluarEscenario(caso, "A", 250)).toBeNull();
  });
});

describe("Validaciones", () => {
  const mensajes = (caso: Parameters<typeof validar>[0]) =>
    validar(caso).map((error) => error.mensaje);

  it("el caso Espitia no tiene errores", () => {
    expect(validar(CASO_ESPITIA)).toEqual([]);
  });

  it("detecta una tasa de evaluacion negativa", () => {
    const caso = clonarCaso(CASO_ESPITIA);
    caso.parametros.tasaEvaluacion = -5;
    const errores = validar(caso);
    expect(mensajes(caso)).toContain("La tasa debe ser mayor o igual a 0 %.");
    expect(errores.every((e) => e.pantalla === "parametros")).toBe(true);
  });

  it("detecta una vida util de 0 anios", () => {
    const caso = clonarCaso(CASO_ESPITIA);
    caso.parametros.vidaUtil = 0;
    expect(mensajes(caso)).toContain(
      "Ingrese un periodo de evaluación válido: un número entero de años entre 1 y 50.",
    );
  });

  it("detecta una inversion vacia", () => {
    const caso = clonarCaso(CASO_ESPITIA);
    caso.inversion.elementos = [];
    expect(mensajes(caso)).toContain(
      "Ingrese el valor de la inversión: agregue al menos un elemento con cantidad y precio.",
    );
  });

  it("detecta los meses sin clientes proyectados e indica cuales son", () => {
    const caso = clonarCaso(CASO_ESPITIA);
    caso.proyeccion[2] = null;
    caso.proyeccion[6] = null;
    expect(mensajes(caso)).toContain(
      "Ingrese la cantidad de clientes proyectados en: mes 3, mes 7.",
    );
  });

  it("exige clientes actuales mayores que 0 para poder calcular el ingreso promedio", () => {
    const caso = clonarCaso(CASO_ESPITIA);
    caso.negocio.clientesActuales = 0;
    expect(mensajes(caso)).toContain(
      "Los clientes actuales deben ser mayores que 0, porque con ellos se calcula el ingreso promedio por cliente.",
    );
  });

  it("el caso vacio reporta errores en todas las pantallas con datos obligatorios", () => {
    const errores = validar(casoVacio());
    const pantallas = new Set(errores.map((e) => e.pantalla));
    expect(pantallas).toContain("negocio");
    expect(pantallas).toContain("inversion");
    expect(pantallas).toContain("personal");
    expect(pantallas).toContain("proyeccion");
    expect(pantallas).toContain("parametros");
  });
});
