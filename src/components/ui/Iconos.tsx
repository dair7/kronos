import type { ReactNode, SVGProps } from "react";

/**
 * Iconos de trazo de KRONOS. Son SVG en linea (24 x 24, trazo de 1,75) para no
 * agregar dependencias: heredan el color del texto con currentColor.
 */

type PropsIcono = SVGProps<SVGSVGElement> & { tamano?: number };

function Base({ tamano = 18, children, ...resto }: PropsIcono & { children: ReactNode }) {
  return (
    <svg
      width={tamano}
      height={tamano}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      focusable="false"
      {...resto}
    >
      {children}
    </svg>
  );
}

export const IconoNegocio = (p: PropsIcono) => (
  <Base {...p}>
    <path d="M3 9.5 4.5 4h15L21 9.5" />
    <path d="M3 9.5a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0" />
    <path d="M5 12v8h14v-8" />
    <path d="M10 20v-4h4v4" />
  </Base>
);

export const IconoServicios = (p: PropsIcono) => (
  <Base {...p}>
    <circle cx="6" cy="6" r="3" />
    <circle cx="6" cy="18" r="3" />
    <path d="M20 4 8.1 15.9" />
    <path d="M14.5 14.5 20 20" />
    <path d="M8.1 8.1 12 12" />
  </Base>
);

export const IconoInversion = (p: PropsIcono) => (
  <Base {...p}>
    <path d="M19 7V5a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h14a1 1 0 0 1 1 1v3" />
    <path d="M3 6v12a2 2 0 0 0 2 2h14a1 1 0 0 0 1-1v-3" />
    <path d="M21 12v4h-4a2 2 0 0 1 0-4z" />
  </Base>
);

export const IconoPersonal = (p: PropsIcono) => (
  <Base {...p}>
    <circle cx="9" cy="8" r="3.5" />
    <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
    <path d="M16 4.5a3.5 3.5 0 0 1 0 7" />
    <path d="M18.5 14.5A6.5 6.5 0 0 1 21.5 20" />
  </Base>
);

export const IconoProyeccion = (p: PropsIcono) => (
  <Base {...p}>
    <path d="m3 17 6-6 4 4 8-8" />
    <path d="M15 7h6v6" />
  </Base>
);

export const IconoParametros = (p: PropsIcono) => (
  <Base {...p}>
    <path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1" />
    <circle cx="15" cy="6" r="2" />
    <circle cx="9" cy="12" r="2" />
    <circle cx="17" cy="18" r="2" />
  </Base>
);

export const IconoResultados = (p: PropsIcono) => (
  <Base {...p}>
    <rect x="3" y="3" width="7.5" height="9" rx="2" />
    <rect x="13.5" y="3" width="7.5" height="5" rx="2" />
    <rect x="13.5" y="11" width="7.5" height="10" rx="2" />
    <rect x="3" y="15" width="7.5" height="6" rx="2" />
  </Base>
);

export const IconoCheck = (p: PropsIcono) => (
  <Base {...p}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </Base>
);

export const IconoAlerta = (p: PropsIcono) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7.5v5" />
    <path d="M12 16.2v.1" />
  </Base>
);

export const IconoInfo = (p: PropsIcono) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5" />
    <path d="M12 7.8v.1" />
  </Base>
);

export const IconoAyuda = (p: PropsIcono) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M9.5 9.5a2.5 2.5 0 1 1 3.4 2.3c-.6.3-.9.8-.9 1.4v.3" />
    <path d="M12 16.8v.1" />
  </Base>
);

export const IconoDescargar = (p: PropsIcono) => (
  <Base {...p}>
    <path d="M12 4v11" />
    <path d="m7 10 5 5 5-5" />
    <path d="M5 20h14" />
  </Base>
);

export const IconoGuardar = (p: PropsIcono) => (
  <Base {...p}>
    <path d="M5 3h11l3 3v13a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z" />
    <path d="M8 3v5h7V3" />
    <path d="M8 21v-6h8v6" />
  </Base>
);

export const IconoAbrir = (p: PropsIcono) => (
  <Base {...p}>
    <path d="M3 19V6a2 2 0 0 1 2-2h4l2 2.5h7a2 2 0 0 1 2 2V10" />
    <path d="M3 19 5.8 11.7A1 1 0 0 1 6.7 11H21l-2.8 7.3a1 1 0 0 1-.9.7H3z" />
  </Base>
);

export const IconoEstrella = (p: PropsIcono) => (
  <Base {...p}>
    <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" />
  </Base>
);

export const IconoMas = (p: PropsIcono) => (
  <Base {...p}>
    <circle cx="5.5" cy="12" r="1" fill="currentColor" />
    <circle cx="12" cy="12" r="1" fill="currentColor" />
    <circle cx="18.5" cy="12" r="1" fill="currentColor" />
  </Base>
);

export const IconoMenu = (p: PropsIcono) => (
  <Base {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Base>
);

export const IconoCerrar = (p: PropsIcono) => (
  <Base {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Base>
);

export const IconoFlechaDerecha = (p: PropsIcono) => (
  <Base {...p}>
    <path d="M5 12h14" />
    <path d="m13 6 6 6-6 6" />
  </Base>
);

export const IconoFlechaIzquierda = (p: PropsIcono) => (
  <Base {...p}>
    <path d="M19 12H5" />
    <path d="m11 6-6 6 6 6" />
  </Base>
);

export const IconoAgregar = (p: PropsIcono) => (
  <Base {...p}>
    <path d="M12 5v14M5 12h14" />
  </Base>
);

export const IconoDocumento = (p: PropsIcono) => (
  <Base {...p}>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
    <path d="M14 3v5h5" />
  </Base>
);

export const IconoMoneda = (p: PropsIcono) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M15 9.2c-.5-.9-1.6-1.4-3-1.4-1.8 0-3 .9-3 2.1 0 2.8 6 1.4 6 4.2 0 1.2-1.3 2.1-3 2.1-1.5 0-2.6-.6-3.1-1.5" />
    <path d="M12 6v1.8M12 16.2V18" />
  </Base>
);

export const IconoDiana = (p: PropsIcono) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="12" cy="12" r="1" fill="currentColor" />
  </Base>
);

export const IconoReloj = (p: PropsIcono) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </Base>
);

export const IconoCapacidad = (p: PropsIcono) => (
  <Base {...p}>
    <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
  </Base>
);

export const IconoLogo = (p: PropsIcono) => (
  <svg
    width={p.tamano ?? 18}
    height={p.tamano ?? 18}
    viewBox="0 0 24 24"
    aria-hidden
    focusable="false"
    className={p.className}
  >
    <path d="M6 4h3.2v6.4L15.4 4h4L12.6 11l7 9h-4.1l-5.2-6.9-1.1 1.1V20H6z" fill="currentColor" />
  </svg>
);
