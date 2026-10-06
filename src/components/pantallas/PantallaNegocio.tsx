"use client";

import { useCaso } from "../ProveedorCaso";
import { CampoNumero, CampoTexto } from "../ui/Campo";
import { ResumenEnVivo } from "../ui/ResumenEnVivo";
import { derivados } from "@/lib/calculos";
import { numero, pesosDecimales } from "@/lib/formato";

export function PantallaNegocio() {
  const { caso, actualizar } = useCaso();
  const { negocio } = caso;
  const d = derivados(caso);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-5 lg:col-span-2">
        <div className="grid gap-4 sm:grid-cols-2">
          <CampoTexto
            etiqueta="Nombre del negocio"
            requerido
            valor={negocio.nombre}
            placeholder="Espitia Barber Shop"
            onChange={(v) => actualizar((c) => void (c.negocio.nombre = v))}
          />
          <CampoTexto
            etiqueta="Propietario"
            valor={negocio.propietario}
            placeholder="Álvaro Espitia"
            onChange={(v) => actualizar((c) => void (c.negocio.propietario = v))}
          />
          <CampoTexto
            etiqueta="Ubicación"
            valor={negocio.ubicacion}
            placeholder="San Pelayo, Córdoba"
            onChange={(v) => actualizar((c) => void (c.negocio.ubicacion = v))}
          />
          <CampoTexto
            etiqueta="Actividad económica"
            valor={negocio.actividad}
            placeholder="Barbería"
            onChange={(v) => actualizar((c) => void (c.negocio.actividad = v))}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <CampoNumero
            etiqueta="Clientes actuales"
            unidad="(clientes/mes)"
            requerido
            min={0}
            valor={negocio.clientesActuales}
            ayuda="Cuántos clientes atiende el negocio hoy, en un mes normal. Con este dato se calcula cuánto deja en promedio cada cliente."
            onChange={(v) => actualizar((c) => void (c.negocio.clientesActuales = v))}
          />
          <CampoNumero
            etiqueta="Ingresos actuales"
            unidad="($/mes)"
            requerido
            min={0}
            valor={negocio.ingresosActuales}
            ayuda="Lo que factura el negocio hoy en un mes, antes de la inversión que se va a evaluar."
            onChange={(v) => actualizar((c) => void (c.negocio.ingresosActuales = v))}
          />
          <CampoNumero
            etiqueta="Días de operación"
            unidad="(días/mes)"
            min={0}
            valor={negocio.diasOperacion}
            ayuda="Días que el negocio abre al mes. Sirve para estimar la carga de trabajo diaria."
            onChange={(v) => actualizar((c) => void (c.negocio.diasOperacion = v))}
          />
          <CampoNumero
            etiqueta="Estaciones de trabajo actuales"
            unidad="(puestos)"
            min={0}
            valor={negocio.estacionesActuales}
            ayuda="Puestos de atención con los que opera hoy (sillas, mesas, cajas, máquinas)."
            onChange={(v) => actualizar((c) => void (c.negocio.estacionesActuales = v))}
          />
          <CampoNumero
            etiqueta="Trabajadores actuales"
            unidad="(personas)"
            min={0}
            valor={negocio.trabajadoresActuales}
            ayuda="Personas que trabajan hoy en el negocio, incluido el propietario si atiende."
            onChange={(v) => actualizar((c) => void (c.negocio.trabajadoresActuales = v))}
          />
        </div>
      </div>

      <ResumenEnVivo
        titulo="Lo que se deduce de estos datos"
        lineas={[
          {
            etiqueta: "Ingreso promedio por cliente",
            valor: pesosDecimales(d.ingresoPromedio),
            faltante:
              d.ingresoPromedio > 0
                ? undefined
                : "Falta ingresar clientes actuales e ingresos actuales",
          },
          {
            etiqueta: "Clientes por día",
            valor: `${numero(d.clientesPorDia ?? 0, 1)} clientes/día`,
            faltante:
              d.clientesPorDia && d.clientesPorDia > 0
                ? undefined
                : "Falta ingresar clientes actuales y días de operación",
          },
        ]}
        pie={
          <>
            El ingreso promedio por cliente se obtiene dividiendo los ingresos mensuales entre los
            clientes del mes. No es el precio de un servicio puntual: es el valor promedio que deja
            cada cliente que entra al negocio.
          </>
        }
      />
    </div>
  );
}
