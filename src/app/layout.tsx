import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Geist } from "next/font/google";
import "./globals.css";
import { ProveedorCaso } from "@/components/ProveedorCaso";
import { Encabezado } from "@/components/Encabezado";
import { PieDePagina } from "@/components/PieDePagina";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "KRONOS — Evaluación económica de proyectos de inversión",
  description:
    "Herramienta web para evaluar económicamente proyectos de inversión de pequeños negocios: " +
    "VPN, TIR, periodo de recuperación y punto de equilibrio.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#12263c",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className={`${geistSans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-lienzo">
        <ProveedorCaso>
          <Encabezado />
          <main id="contenido" className="flex-1">
            {children}
          </main>
          <PieDePagina />
        </ProveedorCaso>
      </body>
    </html>
  );
}
