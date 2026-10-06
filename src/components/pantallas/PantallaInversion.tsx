"use client";

import { useCaso } from "../ProveedorCaso";
import { CampoNumero, CampoTexto, CeldaNumero, CeldaTexto } from "../ui/Campo";
import { EstadoVacio } from "../ui/Aviso";
import { Boton } from "../ui/Boton";
import {
  BotonEliminar,
  CeldaTabla,
  ContenedorTabla,
  EncabezadoTabla,
  FilaTabla,
  PieTabla,
} from "../ui/TablaEditable";
import { nuevoId } from "@/lib/datos";
import { derivados } from "@/lib/calculos";
import { pesos } from "@/lib/formato";

const PLANTILLA = "md:grid-cols-[1fr_7rem_10rem_10rem_3.5rem]";

export function PantallaInversion() {
  const { caso, actualizar } = useCaso();
  const elementos = caso.inversion.elementos;
  const d = derivados(caso);

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
        <CampoTexto
          etiqueta="Descripción de la inversión"
          valor={caso.inversion.descripcion}
          placeholder="Instalación de una segunda estación de trabajo"
          ayuda="En una frase: qué se va a comprar, adecuar o instalar."
          onChange={(v) => actualizar((c) => void (c.inversion.descripcion = v))}
        />
        <CampoNumero
          etiqueta="Estaciones que agrega"
          unidad="(puestos)"
          min={0}
          valor={caso.inversion.estacionesNuevas}
          ayuda="Opcional. Puestos de atención que suma esta inversión; se usa solo para explicar la capacidad en los resultados."
          onChange={(v) => actualizar((c) => void (c.inversion.estacionesNuevas = v))}
        />
      </div>

      <ContenedorTabla>
        <EncabezadoTabla
          plantilla={PLANTILLA}
          columnas={[
            { titulo: "Elemento" },
            { titulo: "Cantidad", alineacion: "derecha" },
            { titulo: "Precio unitario ($)", alineacion: "derecha" },
            { titulo: "Subtotal ($)", alineacion: "derecha" },
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
                <CeldaTabla etiqueta="Elemento">
                  <CeldaTexto
                    etiquetaAccesible={`Nombre del elemento ${indice + 1}`}
                    valor={elemento.elemento}
                    placeholder="Silla"
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
                <CeldaTabla etiqueta="Precio unitario ($)">
                  <CeldaNumero
                    etiquetaAccesible={`Precio unitario del elemento ${indice + 1}`}
                    valor={elemento.precioUnitario}
                    min={0}
                    onChange={(v) =>
                      actualizar((c) => void (c.inversion.elementos[indice].precioUnitario = v))
                    }
                  />
                </CeldaTabla>
                <CeldaTabla etiqueta="Subtotal ($)" alineacion="derecha">
                  <p
                    className={`cifra py-2 text-sm font-medium ${completo ? "text-marino-900" : "text-marino-400"}`}
                  >
                    {completo ? pesos(subtotal) : "Falta cantidad o precio"}
                  </p>
                </CeldaTabla>
                <CeldaTabla etiqueta="Acción" alineacion="centro">
                  <BotonEliminar
                    etiquetaAccesible={`Eliminar el elemento ${elemento.elemento || indice + 1}`}
                    onClick={() => actualizar((c) => void c.inversion.elementos.splice(indice, 1))}
                  />
                </CeldaTabla>
              </FilaTabla>
            );
          })
        )}
      </ContenedorTabla>

      <Boton
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
        + Agregar elemento
      </Boton>

      <PieTabla
        etiqueta="Inversión inicial total"
        nota="Suma de cantidad × precio unitario de todos los elementos"
        valor={pesos(d.inversionTotal)}
      />
    </div>
  );
}
