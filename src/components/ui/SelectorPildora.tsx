"use client";

interface Opcion<T extends string> {
  id: T;
  titulo: string;
}

/**
 * Selector segmentado en forma de pildora (como "Monthly / Weekly" de las
 * referencias). Funciona como lista de pestanas accesible.
 */
export function SelectorPildora<T extends string>({
  opciones,
  valor,
  onCambiar,
  etiqueta,
}: {
  opciones: Opcion<T>[];
  valor: T;
  onCambiar: (valor: T) => void;
  etiqueta: string;
}) {
  return (
    <div role="tablist" aria-label={etiqueta} className="inline-flex h-11 rounded-full bg-tarjeta p-1 shadow-tarjeta">
      {opciones.map((opcion) => {
        const activa = opcion.id === valor;
        return (
          <button
            key={opcion.id}
            type="button"
            role="tab"
            id={`pestana-${opcion.id}`}
            aria-selected={activa}
            aria-controls={`panel-${opcion.id}`}
            onClick={() => onCambiar(opcion.id)}
            className={[
              "cursor-pointer rounded-full px-4 text-[13px] font-semibold transition-colors duration-150",
              activa ? "bg-tinta text-white" : "text-tenue hover:text-tinta",
            ].join(" ")}
          >
            {opcion.titulo}
          </button>
        );
      })}
    </div>
  );
}
