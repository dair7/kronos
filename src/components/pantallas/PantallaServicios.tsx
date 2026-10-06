"use client";

import { useCaso } from "../ProveedorCaso";
import { CeldaNumero, CeldaTexto } from "../ui/Campo";
import { Aviso, EstadoVacio } from "../ui/Aviso";
import { Boton } from "../ui/Boton";
import {
  BotonEliminar,
  CeldaTabla,
  ContenedorTabla,
  EncabezadoTabla,
  FilaTabla,
} from "../ui/TablaEditable";
import { nuevoId } from "@/lib/datos";
import { derivados } from "@/lib/calculos";
import { pesos, pesosDecimales } from "@/lib/formato";

const PLANTILLA = "md:grid-cols-[1fr_12rem_3.5rem]";

export function PantallaServicios() {
  const { caso, actualizar } = useCaso();
  const { servicios } = caso;
  const d = derivados(caso);

  const conPrecio = servicios.filter((s) => typeof s.precio === "number" && s.precio > 0);
  const promedioLista =
    conPrecio.length > 0
      ? conPrecio.reduce((suma, s) => suma + (s.precio as number), 0) / conPrecio.length
      : null;

  return (
    <div className="space-y-5">
      <Aviso tono="info" titulo="Este catálogo no cambia ningún cálculo">
        <p>
          Los servicios y sus precios quedan registrados como información del caso y aparecen entre
          los supuestos del dashboard, pero <strong>no entran en ninguna fórmula</strong>.
        </p>
        <p className="mt-2">
          El <strong>ingreso promedio por cliente</strong> se calcula dividiendo los ingresos reales
          del mes entre los clientes del mes, no promediando esta lista de precios. Se hace así
          porque los ingresos reales ya reflejan la mezcla verdadera de servicios que pide la
          clientela —y además incluyen servicios combinados y venta de productos—, mientras que un
          promedio de la lista supondría que todos los servicios se venden en la misma proporción.
        </p>
      </Aviso>

      <ContenedorTabla>
        <EncabezadoTabla
          plantilla={PLANTILLA}
          columnas={[
            { titulo: "Servicio" },
            { titulo: "Precio ($)", alineacion: "derecha" },
            { titulo: "", alineacion: "centro" },
          ]}
        />

        {servicios.length === 0 ? (
          <EstadoVacio titulo="Todavía no hay servicios registrados.">
            Use el botón «Agregar servicio» para describir qué vende el negocio. Este paso es
            opcional.
          </EstadoVacio>
        ) : (
          servicios.map((servicio, indice) => (
            <FilaTabla key={servicio.id} plantilla={PLANTILLA}>
              <CeldaTabla etiqueta="Servicio">
                <CeldaTexto
                  etiquetaAccesible={`Nombre del servicio ${indice + 1}`}
                  valor={servicio.nombre}
                  placeholder="Corte de cabello"
                  onChange={(v) => actualizar((c) => void (c.servicios[indice].nombre = v))}
                />
              </CeldaTabla>
              <CeldaTabla etiqueta="Precio ($)">
                <CeldaNumero
                  etiquetaAccesible={`Precio del servicio ${indice + 1}`}
                  valor={servicio.precio}
                  min={0}
                  onChange={(v) => actualizar((c) => void (c.servicios[indice].precio = v))}
                />
              </CeldaTabla>
              <CeldaTabla etiqueta="Acción" alineacion="centro">
                <BotonEliminar
                  etiquetaAccesible={`Eliminar el servicio ${servicio.nombre || indice + 1}`}
                  onClick={() => actualizar((c) => void c.servicios.splice(indice, 1))}
                />
              </CeldaTabla>
            </FilaTabla>
          ))
        )}
      </ContenedorTabla>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Boton
          variante="secundario"
          onClick={() =>
            actualizar((c) => void c.servicios.push({ id: nuevoId("s"), nombre: "", precio: null }))
          }
        >
          + Agregar servicio
        </Boton>

        {promedioLista !== null && (
          <p className="text-xs text-marino-500">
            Promedio simple de la lista:{" "}
            <span className="cifra font-medium text-marino-700">{pesos(promedioLista)}</span> ·
            Ingreso promedio real por cliente:{" "}
            <span className="cifra font-medium text-marino-700">
              {pesosDecimales(d.ingresoPromedio)}
            </span>
          </p>
        )}
      </div>
    </div>
  );
}
