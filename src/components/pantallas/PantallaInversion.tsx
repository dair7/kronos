"use client";

import type { ReactNode } from "react";
import { useCaso } from "../ProveedorCaso";
import { CampoNumero, CampoTexto, CeldaNumero, CeldaTexto } from "../ui/Campo";
import { EstadoVacio } from "../ui/Aviso";
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
import { derivados } from "@/lib/calculos";
import { numero, pesos, porcentaje } from "@/lib/formato";

const PLANTILLA = "grid-cols-2 md:grid-cols-[1fr_6.5rem_10rem_8.5rem_3rem]";

export function PantallaInversion({ pie }: { pie: ReactNode }) {
  const { caso, actualizar } = useCaso();
  const elementos = caso.inversion.elementos;
  const d = derivados(caso);

  // Elemento de mayor peso dentro de la inversion, para la tarjeta en vivo.
  const subtotales = elementos.map((e) => ({
    nombre: e.elemento || "Sin nombre",
    valor: (e.cantidad ?? 0) * (e.precioUnitario ?? 0),
  }));
  const mayor = subtotales.reduce<{ nombre: string; valor: number } | null>(
    (max, actual) => (max === null || actual.valor > max.valor ? actual : max),
    null,
  );

  return (
    <DisenoPantalla
      pie={pie}
      formulario={
        <div className="space-y-7">
          <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
            <CampoTexto
              etiqueta="Descripción de la inversión"
              valor={caso.inversion.descripcion}
              placeholder="Ej.: Compra de un horno industrial"
              ayuda="En una frase: qué se va a comprar, adecuar o instalar."
              onChange={(v) => actualizar((c) => void (c.inversion.descripcion = v))}
            />
            <CampoNumero
              etiqueta="Estaciones que agrega"
              unidad="puestos"
              unidadSingular="puesto"
              placeholder="Ej.: 1"
              min={0}
              valor={caso.inversion.estacionesNuevas}
              ayuda="Opcional. Solo explica la capacidad."
              onChange={(v) => actualizar((c) => void (c.inversion.estacionesNuevas = v))}
            />
          </div>

          <SeccionFormulario titulo="Elementos de la inversión">
            <ContenedorTabla>
              <EncabezadoTabla
                plantilla={PLANTILLA}
                columnas={[
                  { titulo: "Elemento" },
                  { titulo: "Cantidad", alineacion: "derecha" },
                  { titulo: "Precio unitario", alineacion: "derecha" },
                  { titulo: "Subtotal", alineacion: "derecha" },
                  { titulo: "", alineacion: "centro" },
                ]}
              />

              {elementos.length === 0 ? (
                <EstadoVacio titulo="Todavía no hay elementos en la inversión.">
                  Agregue al menos un elemento con su cantidad y su precio: sin inversión no se puede
                  evaluar el proyecto.
                </EstadoVacio>
              ) : (
                elementos.map((elemento, indice) => {
                  const subtotal = (elemento.cantidad ?? 0) * (elemento.precioUnitario ?? 0);
                  const completo = elemento.cantidad !== null && elemento.precioUnitario !== null;
                  return (
                    <FilaTabla key={elemento.id} plantilla={PLANTILLA}>
                      <CeldaTabla etiqueta="Elemento" className="col-span-2 pr-11 md:col-span-1 md:pr-0">
                        <CeldaTexto
                          etiquetaAccesible={`Nombre del elemento ${indice + 1}`}
                          valor={elemento.elemento}
                          placeholder="Ej.: Horno"
                          onChange={(v) =>
                            actualizar((c) => void (c.inversion.elementos[indice].elemento = v))
                          }
                        />
                      </CeldaTabla>
                      <CeldaTabla etiqueta="Cantidad">
                        <CeldaNumero
                          etiquetaAccesible={`Cantidad del elemento ${indice + 1}`}
                          valor={elemento.cantidad}
                          min={0}
                          onChange={(v) =>
                            actualizar((c) => void (c.inversion.elementos[indice].cantidad = v))
                          }
                        />
                      </CeldaTabla>
                      <CeldaTabla etiqueta="Precio unitario">
                        <CeldaNumero
                          etiquetaAccesible={`Precio unitario del elemento ${indice + 1}, en pesos`}
                          valor={elemento.precioUnitario}
                          min={0}
                          unidad="$"
                          placeholder="Ej.: 2.500.000"
                          onChange={(v) =>
                            actualizar(
                              (c) => void (c.inversion.elementos[indice].precioUnitario = v),
                            )
                          }
                        />
                      </CeldaTabla>
                      <CeldaTabla etiqueta="Subtotal" alineacion="derecha" className="col-span-2 md:col-span-1">
                        <p
                          className={`cifra py-2 text-sm font-semibold ${completo ? "" : "text-tenue"}`}
                        >
                          {completo ? pesos(subtotal) : "Falta un dato"}
                        </p>
                      </CeldaTabla>
                    <CeldaEliminar
                          etiquetaAccesible={`Eliminar el elemento ${elemento.elemento || indice + 1}`}
                          onClick={() =>
                            actualizar((c) => void c.inversion.elementos.splice(indice, 1))
                          }
                        />
                    </FilaTabla>
                  );
                })
              )}
            </ContenedorTabla>

            <Boton
              className="mt-4"
              variante="secundario"
              onClick={() =>
                actualizar(
                  (c) =>
                    void c.inversion.elementos.push({
                      id: nuevoId("i"),
                      elemento: "",
                      cantidad: 1,
                      precioUnitario: null,
                    }),
                )
              }
            >
              <IconoAgregar tamano={16} />
              Agregar elemento
            </Boton>
          </SeccionFormulario>
        </div>
      }
      calculados={
        <ResumenEnVivo
          heroe={{
            etiqueta: "Inversión inicial total",
            valor: pesos(d.inversionTotal),
            faltante: d.inversionTotal > 0 ? undefined : "Agregue elementos con cantidad y precio",
          }}
          lineas={[
            { etiqueta: "Elementos", valor: numero(elementos.length) },
            {
              etiqueta: "Elemento de mayor peso",
              valor:
                mayor && d.inversionTotal > 0
                  ? `${mayor.nombre} · ${porcentaje((mayor.valor / d.inversionTotal) * 100, 0)}`
                  : "—",
            },
          ]}
          pie={
            <>
              Suma de cantidad × precio unitario. En el flujo de caja aparece como el año 0, con
              signo negativo.
            </>
          }
        />
      }
    />
  );
}
