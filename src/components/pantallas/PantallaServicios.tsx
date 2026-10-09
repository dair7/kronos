"use client";

import type { ReactNode } from "react";
import { useCaso } from "../ProveedorCaso";
import { CeldaNumero, CeldaTexto } from "../ui/Campo";
import { Aviso, EstadoVacio } from "../ui/Aviso";
import { Boton } from "../ui/Boton";
import { DisenoPantalla } from "../ui/DisenoPantalla";
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
import { serviciosValidos } from "../estadoPasos";
import { derivados } from "@/lib/calculos";
import { numero, pesos } from "@/lib/formato";

const PLANTILLA = "md:grid-cols-[1fr_12rem_3rem]";

export function PantallaServicios({ pie }: { pie: ReactNode }) {
  const { caso, actualizar } = useCaso();
  const { servicios } = caso;
  const d = derivados(caso);

  // Las filas vacias no cuentan: solo servicios con nombre y precio.
  const validos = serviciosValidos(caso);
  const conPrecio = validos.filter((s) => (s.precio as number) > 0);
  const promedioLista =
    conPrecio.length > 0
      ? conPrecio.reduce((suma, s) => suma + (s.precio as number), 0) / conPrecio.length
      : null;

  return (
    <DisenoPantalla
      pie={pie}
      formulario={
        <div className="space-y-5">
          <ContenedorTabla>
            <EncabezadoTabla
              plantilla={PLANTILLA}
              columnas={[
                { titulo: "Servicio" },
                { titulo: "Precio", alineacion: "derecha" },
                { titulo: "", alineacion: "centro" },
              ]}
            />

            {servicios.length === 0 ? (
              <EstadoVacio titulo="Todavía no hay servicios registrados.">
                Use «Agregar servicio» para describir qué vende el negocio. Este paso es opcional.
              </EstadoVacio>
            ) : (
              servicios.map((servicio, indice) => (
                <FilaTabla key={servicio.id} plantilla={PLANTILLA}>
                  <CeldaTabla etiqueta="Servicio" className="pr-11 md:pr-0">
                    <CeldaTexto
                      etiquetaAccesible={`Nombre del servicio ${indice + 1}`}
                      valor={servicio.nombre}
                      placeholder="Ej.: Pan tajado"
                      onChange={(v) => actualizar((c) => void (c.servicios[indice].nombre = v))}
                    />
                  </CeldaTabla>
                  <CeldaTabla etiqueta="Precio">
                    <CeldaNumero
                      etiquetaAccesible={`Precio del servicio ${indice + 1}, en pesos`}
                      valor={servicio.precio}
                      min={0}
                      unidad="$"
                      placeholder="Ej.: 5.000"
                      onChange={(v) => actualizar((c) => void (c.servicios[indice].precio = v))}
                    />
                  </CeldaTabla>
                    <CeldaEliminar
                      etiquetaAccesible={`Eliminar el servicio ${servicio.nombre || indice + 1}`}
                      onClick={() => actualizar((c) => void c.servicios.splice(indice, 1))}
                    />
                </FilaTabla>
              ))
            )}
          </ContenedorTabla>

          <Boton
            variante="secundario"
            onClick={() =>
              actualizar((c) =>
                void c.servicios.push({ id: nuevoId("s"), nombre: "", precio: null }),
              )
            }
          >
            <IconoAgregar tamano={16} />
            Agregar servicio
          </Boton>
        </div>
      }
      calculados={
        <>
          <ResumenEnVivo
            heroe={{
              etiqueta: "Ingreso promedio real por cliente",
              valor: pesos(d.ingresoPromedio),
              faltante:
                d.ingresoPromedio > 0 ? undefined : "Faltan los datos del paso Negocio",
            }}
            lineas={[
              {
                etiqueta: "Promedio simple de la lista",
                valor: pesos(promedioLista),
                faltante: promedioLista === null ? "Sin precios registrados" : undefined,
              },
              {
                etiqueta: "Servicios registrados",
                valor: numero(validos.length),
                faltante: validos.length === 0 ? "Ninguno todavía (paso opcional)" : undefined,
              },
            ]}
          />
          <Aviso tono="info" titulo="Este catálogo no cambia ningún cálculo">
            El ingreso promedio por cliente sale de los ingresos reales del mes, que ya reflejan la
            mezcla verdadera de servicios, combos y venta de productos. Promediar esta lista
            supondría que todo se vende en la misma proporción.
          </Aviso>
        </>
      }
    />
  );
}
