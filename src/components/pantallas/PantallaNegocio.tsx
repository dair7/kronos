"use client";

import type { ReactNode } from "react";
import { useCaso } from "../ProveedorCaso";
import { CampoNumero, CampoTexto } from "../ui/Campo";
import { DisenoPantalla, SeccionFormulario } from "../ui/DisenoPantalla";
import { ResumenEnVivo } from "../ui/ResumenEnVivo";
import { derivados } from "@/lib/calculos";
import { numero, pesos, pesosDecimales } from "@/lib/formato";

export function PantallaNegocio({ pie }: { pie: ReactNode }) {
  const { caso, actualizar } = useCaso();
  const { negocio } = caso;
  const d = derivados(caso);

  const clientesPorTrabajador =
    d.clientesPorDia && negocio.trabajadoresActuales
      ? d.clientesPorDia / negocio.trabajadoresActuales
      : null;

  return (
    <DisenoPantalla
      pie={pie}
      formulario={
        <div className="space-y-7">
          <SeccionFormulario titulo="Identificación">
            <div className="grid gap-4 sm:grid-cols-2">
              <CampoTexto
                etiqueta="Nombre del negocio"
                requerido
                valor={negocio.nombre}
                placeholder="Ej.: Panadería La Espiga"
                onChange={(v) => actualizar((c) => void (c.negocio.nombre = v))}
              />
              <CampoTexto
                etiqueta="Propietario"
                valor={negocio.propietario}
                placeholder="Ej.: María Pérez"
                onChange={(v) => actualizar((c) => void (c.negocio.propietario = v))}
              />
              <CampoTexto
                etiqueta="Ubicación"
                valor={negocio.ubicacion}
                placeholder="Ej.: Montería, Córdoba"
                onChange={(v) => actualizar((c) => void (c.negocio.ubicacion = v))}
              />
              <CampoTexto
                etiqueta="Actividad económica"
                valor={negocio.actividad}
                placeholder="Ej.: Panadería"
                onChange={(v) => actualizar((c) => void (c.negocio.actividad = v))}
              />
            </div>
          </SeccionFormulario>

          <SeccionFormulario
            titulo="Operación actual"
            descripcion="Cómo funciona el negocio hoy, antes de la inversión que se va a evaluar."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <CampoNumero
                etiqueta="Clientes actuales"
                unidad="clientes/mes"
                unidadSingular="cliente/mes"
                placeholder="Ej.: 500"
                requerido
                min={0}
                valor={negocio.clientesActuales}
                ayuda="Cuántos clientes atiende el negocio en un mes normal."
                onChange={(v) => actualizar((c) => void (c.negocio.clientesActuales = v))}
              />
              <CampoNumero
                etiqueta="Ingresos actuales"
                unidad="$/mes"
                placeholder="Ej.: 8.000.000"
                requerido
                min={0}
                valor={negocio.ingresosActuales}
                ayuda="Lo que factura el negocio hoy en un mes."
                onChange={(v) => actualizar((c) => void (c.negocio.ingresosActuales = v))}
              />
              <CampoNumero
                etiqueta="Días de operación"
                unidad="días/mes"
                unidadSingular="día/mes"
                placeholder="Ej.: 26"
                min={0}
                valor={negocio.diasOperacion}
                ayuda="Días que el negocio abre al mes."
                onChange={(v) => actualizar((c) => void (c.negocio.diasOperacion = v))}
              />
              <CampoNumero
                etiqueta="Estaciones de trabajo actuales"
                unidad="puestos"
                unidadSingular="puesto"
                placeholder="Ej.: 2"
                min={0}
                valor={negocio.estacionesActuales}
                ayuda="Sillas, mesas, cajas o máquinas con que opera hoy."
                onChange={(v) => actualizar((c) => void (c.negocio.estacionesActuales = v))}
              />
              <CampoNumero
                etiqueta="Trabajadores actuales"
                unidad="personas"
                unidadSingular="persona"
                placeholder="Ej.: 3"
                min={0}
                valor={negocio.trabajadoresActuales}
                ayuda="Incluido el propietario si atiende."
                onChange={(v) => actualizar((c) => void (c.negocio.trabajadoresActuales = v))}
              />
            </div>
          </SeccionFormulario>
        </div>
      }
      calculados={
        <ResumenEnVivo
          heroe={{
            etiqueta: "Ingreso promedio por cliente",
            valor: pesos(d.ingresoPromedio),
            faltante:
              d.ingresoPromedio > 0 ? undefined : "Falta ingresar clientes e ingresos actuales",
          }}
          lineas={[
            {
              etiqueta: "Valor exacto",
              valor: pesosDecimales(d.ingresoPromedio),
              faltante: d.ingresoPromedio > 0 ? undefined : "—",
            },
            {
              etiqueta: "Clientes por día",
              valor: `${numero(d.clientesPorDia ?? 0, 1)} clientes/día`,
              faltante:
                d.clientesPorDia && d.clientesPorDia > 0
                  ? undefined
                  : "Faltan clientes y días de operación",
            },
            {
              etiqueta: "Clientes por trabajador",
              valor: `${numero(clientesPorTrabajador ?? 0, 1)} clientes/día`,
              faltante: clientesPorTrabajador ? undefined : "Faltan los trabajadores actuales",
            },
          ]}
          pie={
            <>
              Ingresos del mes ÷ clientes del mes. No es el precio de un servicio puntual: es lo que
              deja en promedio cada cliente que entra al negocio.
            </>
          }
        />
      }
    />
  );
}
