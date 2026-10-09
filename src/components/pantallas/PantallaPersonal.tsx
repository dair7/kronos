"use client";

import type { ReactNode } from "react";
import { useCaso } from "../ProveedorCaso";
import { CampoNumero, CeldaNumero, CeldaTexto } from "../ui/Campo";
import { Aviso, EstadoVacio } from "../ui/Aviso";
import { Boton } from "../ui/Boton";
import { DisenoPantalla, SeccionFormulario } from "../ui/DisenoPantalla";
import { IconoAgregar } from "../ui/Iconos";
import { ResumenEnVivo } from "../ui/ResumenEnVivo";
import {
  CeldaEliminar,
  CeldaTabla,
  ContenedorTabla,
  EncabezadoTabla,
  FilaTabla,
} from "../ui/TablaEditable";
import { nuevoId } from "@/lib/datos";
import { advertencias, derivados } from "@/lib/calculos";
import { pesos, pesosDecimales } from "@/lib/formato";

const PLANTILLA = "md:grid-cols-[1fr_12rem_3rem]";

export function PantallaPersonal({ pie }: { pie: ReactNode }) {
  const { caso, actualizar } = useCaso();
  const { personal } = caso;
  const d = derivados(caso);
  const avisos = advertencias(caso);

  return (
    <DisenoPantalla
      pie={pie}
      formulario={
        <div className="space-y-8">
          <SeccionFormulario titulo="Personal nuevo">
            <div className="grid gap-4 sm:grid-cols-3">
              <CampoNumero
                etiqueta="Nuevos trabajadores"
                unidad="personas"
                unidadSingular="persona"
                placeholder="Ej.: 1"
                min={0}
                valor={personal.nuevosTrabajadores}
                ayuda="Se contratan con la inversión."
                onChange={(v) => actualizar((c) => void (c.personal.nuevosTrabajadores = v))}
              />
              <CampoNumero
                etiqueta="Salario mensual de cada uno"
                unidad="$/mes"
                placeholder="Ej.: 1.500.000"
                min={0}
                valor={personal.salarioMensual}
                ayuda="Antes de prestaciones."
                onChange={(v) => actualizar((c) => void (c.personal.salarioMensual = v))}
              />
              <CampoNumero
                etiqueta="Prestaciones sobre salarios"
                unidad="%"
                placeholder="Ej.: 30"
                min={0}
                valor={personal.porcentajePrestaciones}
                ayuda="Salud, pensión, cesantías, primas."
                onChange={(v) => actualizar((c) => void (c.personal.porcentajePrestaciones = v))}
              />
            </div>
          </SeccionFormulario>

          <SeccionFormulario
            titulo="Otros costos fijos adicionales"
            descripcion="Aparecen con la ampliación y no dependen de cuántos clientes se atiendan: servicios públicos, arriendo, internet, vigilancia."
          >
            <ContenedorTabla>
              <EncabezadoTabla
                plantilla={PLANTILLA}
                columnas={[
                  { titulo: "Concepto" },
                  { titulo: "Valor mensual", alineacion: "derecha" },
                  { titulo: "", alineacion: "centro" },
                ]}
              />
              {personal.otrosCostosFijos.length === 0 ? (
                <EstadoVacio titulo="No hay otros costos fijos registrados.">
                  Si la ampliación no genera costos fijos distintos de los salarios, puede dejar
                  esta tabla vacía.
                </EstadoVacio>
              ) : (
                personal.otrosCostosFijos.map((costo, indice) => (
                  <FilaTabla key={costo.id} plantilla={PLANTILLA}>
                    <CeldaTabla etiqueta="Concepto" className="pr-11 md:pr-0">
                      <CeldaTexto
                        etiquetaAccesible={`Concepto del costo fijo ${indice + 1}`}
                        valor={costo.concepto}
                        placeholder="Ej.: Energía adicional"
                        onChange={(v) =>
                          actualizar((c) => void (c.personal.otrosCostosFijos[indice].concepto = v))
                        }
                      />
                    </CeldaTabla>
                    <CeldaTabla etiqueta="Valor mensual">
                      <CeldaNumero
                        etiquetaAccesible={`Valor mensual del costo fijo ${indice + 1}, en pesos`}
                        valor={costo.valorMensual}
                        min={0}
                        unidad="$/mes"
                        placeholder="Ej.: 100.000"
                        onChange={(v) =>
                          actualizar(
                            (c) => void (c.personal.otrosCostosFijos[indice].valorMensual = v),
                          )
                        }
                      />
                    </CeldaTabla>
                    <CeldaEliminar
                        etiquetaAccesible={`Eliminar el costo fijo ${costo.concepto || indice + 1}`}
                        onClick={() =>
                          actualizar((c) => void c.personal.otrosCostosFijos.splice(indice, 1))
                        }
                      />
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
              <IconoAgregar tamano={16} />
              Agregar costo fijo
            </Boton>
          </SeccionFormulario>

          <SeccionFormulario titulo="Costo variable">
            <div className="max-w-md">
              <CampoNumero
                etiqueta="Gasto actual en productos, herramientas e insumos"
                unidad="$/mes"
                placeholder="Ej.: 600.000"
                requerido
                min={0}
                valor={personal.gastoInsumos}
                ayuda="Dividido entre los clientes actuales da el costo variable por cliente."
                onChange={(v) => actualizar((c) => void (c.personal.gastoInsumos = v))}
              />
            </div>
          </SeccionFormulario>

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
      }
      calculados={
        <ResumenEnVivo
          heroe={{
            etiqueta: "Costos fijos adicionales",
            valor: pesos(d.costosFijosMensuales),
            unidad: "/mes",
          }}
          lineas={[
            { etiqueta: "Salarios", valor: `${pesos(d.salarios)} /mes` },
            { etiqueta: "Prestaciones", valor: `${pesos(d.prestaciones)} /mes` },
            { etiqueta: "Otros costos fijos", valor: `${pesos(d.otrosCostos)} /mes` },
            {
              etiqueta: "Costo variable por cliente",
              valor: pesosDecimales(d.costoVariable),
              faltante:
                d.costoVariable > 0 ? undefined : "Falta el gasto en insumos o los clientes actuales",
              destacado: true,
            },
            {
              etiqueta: "Margen por cliente",
              valor: pesosDecimales(d.margen),
              faltante: d.margen !== 0 ? undefined : "Faltan datos del negocio",
              signo: d.margen < 0 ? "negativo" : "positivo",
            },
          ]}
          pie={
            <>
              Costos fijos = trabajadores × salario × (1 + prestaciones) + otros costos. El margen
              es lo que queda de cada cliente después de pagar sus insumos.
            </>
          }
        />
      }
    />
  );
}
