"use client";

import { useCaso } from "../ProveedorCaso";
import { CampoNumero, CeldaNumero, CeldaTexto } from "../ui/Campo";
import { Aviso, EstadoVacio } from "../ui/Aviso";
import { Boton } from "../ui/Boton";
import { ResumenEnVivo } from "../ui/ResumenEnVivo";
import {
  BotonEliminar,
  CeldaTabla,
  ContenedorTabla,
  EncabezadoTabla,
  FilaTabla,
} from "../ui/TablaEditable";
import { nuevoId } from "@/lib/datos";
import { advertencias, derivados } from "@/lib/calculos";
import { pesos, pesosDecimales } from "@/lib/formato";

const PLANTILLA = "md:grid-cols-[1fr_12rem_3.5rem]";

export function PantallaPersonal() {
  const { caso, actualizar } = useCaso();
  const { personal } = caso;
  const d = derivados(caso);
  const avisos = advertencias(caso);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <section>
          <h3 className="text-sm font-semibold text-marino-800">Personal nuevo</h3>
          <div className="mt-3 grid gap-4 sm:grid-cols-3">
            <CampoNumero
              etiqueta="Nuevos trabajadores"
              unidad="(personas)"
              min={0}
              valor={personal.nuevosTrabajadores}
              ayuda="Personas que se contratan con la inversión."
              onChange={(v) => actualizar((c) => void (c.personal.nuevosTrabajadores = v))}
            />
            <CampoNumero
              etiqueta="Salario mensual"
              unidad="($/mes c/u)"
              min={0}
              valor={personal.salarioMensual}
              ayuda="Salario de cada nuevo trabajador, antes de prestaciones."
              onChange={(v) => actualizar((c) => void (c.personal.salarioMensual = v))}
            />
            <CampoNumero
              etiqueta="Prestaciones"
              unidad="(% sobre salarios)"
              min={0}
              valor={personal.porcentajePrestaciones}
              ayuda="Carga prestacional sobre los salarios: salud, pensión, cesantías, primas."
              onChange={(v) => actualizar((c) => void (c.personal.porcentajePrestaciones = v))}
            />
          </div>
        </section>

        <section>
          <h3 className="text-sm font-semibold text-marino-800">
            Otros costos fijos adicionales{" "}
            <span className="font-normal text-marino-500">($/mes)</span>
          </h3>
          <p className="mb-3 mt-1 text-xs leading-relaxed text-marino-500">
            Costos que aparecen con la ampliación y no dependen de cuántos clientes se atiendan:
            servicios públicos adicionales, arriendo, internet, vigilancia.
          </p>

          <ContenedorTabla>
            <EncabezadoTabla
              plantilla={PLANTILLA}
              columnas={[
                { titulo: "Concepto" },
                { titulo: "Valor mensual ($)", alineacion: "derecha" },
                { titulo: "", alineacion: "centro" },
              ]}
            />
            {personal.otrosCostosFijos.length === 0 ? (
              <EstadoVacio titulo="No hay otros costos fijos registrados.">
                Si la ampliación no genera costos fijos distintos de los salarios, puede dejar esta
                tabla vacía.
              </EstadoVacio>
            ) : (
              personal.otrosCostosFijos.map((costo, indice) => (
                <FilaTabla key={costo.id} plantilla={PLANTILLA}>
                  <CeldaTabla etiqueta="Concepto">
                    <CeldaTexto
                      etiquetaAccesible={`Concepto del costo fijo ${indice + 1}`}
                      valor={costo.concepto}
                      placeholder="Electricidad adicional"
                      onChange={(v) =>
                        actualizar((c) => void (c.personal.otrosCostosFijos[indice].concepto = v))
                      }
                    />
                  </CeldaTabla>
                  <CeldaTabla etiqueta="Valor mensual ($)">
                    <CeldaNumero
                      etiquetaAccesible={`Valor mensual del costo fijo ${indice + 1}`}
                      valor={costo.valorMensual}
                      min={0}
                      onChange={(v) =>
                        actualizar(
                          (c) => void (c.personal.otrosCostosFijos[indice].valorMensual = v),
                        )
                      }
                    />
                  </CeldaTabla>
                  <CeldaTabla etiqueta="Acción" alineacion="centro">
                    <BotonEliminar
                      etiquetaAccesible={`Eliminar el costo fijo ${costo.concepto || indice + 1}`}
                      onClick={() =>
                        actualizar((c) => void c.personal.otrosCostosFijos.splice(indice, 1))
                      }
                    />
                  </CeldaTabla>
                </FilaTabla>
              ))
            )}
          </ContenedorTabla>

          <Boton
            className="mt-4"
            variante="secundario"
            onClick={() =>
              actualizar(
                (c) =>
                  void c.personal.otrosCostosFijos.push({
                    id: nuevoId("c"),
                    concepto: "",
                    valorMensual: null,
                  }),
              )
            }
          >
            + Agregar costo fijo
          </Boton>
        </section>

        <section>
          <h3 className="text-sm font-semibold text-marino-800">Costo variable</h3>
          <div className="mt-3 max-w-md">
            <CampoNumero
              etiqueta="Gasto actual en productos, herramientas e insumos"
              unidad="($/mes)"
              requerido
              min={0}
              valor={personal.gastoInsumos}
              ayuda="Lo que el negocio gasta hoy al mes en todo lo que se consume al atender clientes. Dividido entre los clientes actuales da el costo variable por cliente."
              onChange={(v) => actualizar((c) => void (c.personal.gastoInsumos = v))}
            />
          </div>
        </section>

        {avisos.length > 0 && (
          <Aviso tono="alerta" titulo="Revise estos datos">
            <ul className="list-disc space-y-1 pl-4">
              {avisos.map((aviso) => (
                <li key={aviso}>{aviso}</li>
              ))}
            </ul>
          </Aviso>
        )}
      </div>

      <ResumenEnVivo
        titulo="Costos que genera la inversión"
        lineas={[
          { etiqueta: "Salarios", valor: `${pesos(d.salarios)} /mes` },
          { etiqueta: "Prestaciones", valor: `${pesos(d.prestaciones)} /mes` },
          { etiqueta: "Otros costos fijos", valor: `${pesos(d.otrosCostos)} /mes` },
          {
            etiqueta: "Costos fijos totales",
            valor: `${pesos(d.costosFijosMensuales)} /mes`,
            destacado: true,
          },
          {
            etiqueta: "Costo variable por cliente",
            valor: pesosDecimales(d.costoVariable),
            faltante:
              d.costoVariable > 0 ? undefined : "Falta el gasto en insumos o los clientes actuales",
          },
          {
            etiqueta: "Margen por cliente",
            valor: pesosDecimales(d.margen),
            faltante: d.margen !== 0 ? undefined : "Faltan datos del negocio",
            destacado: true,
          },
        ]}
        pie={
          <>
            Costos fijos = (trabajadores × salario) × (1 + prestaciones) + otros costos fijos. El
            margen por cliente es lo que queda de cada cliente adicional después de pagar sus
            insumos, y es la pieza con la que se cubren los costos fijos.
          </>
        }
      />
    </div>
  );
}
