import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Manrope } from "next/font/google";
import "./globals.css";
import { ProveedorCaso } from "@/components/ProveedorCaso";
import { Marco } from "@/components/Marco";

const manrope = Manrope({
  variable: "--font-manrope",
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
  themeColor: "#f4f4f5",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className={`${manrope.variable} h-full antialiased`}>
      <body className="min-h-full bg-fondo">
        <ProveedorCaso>
          <Marco>{children}</Marco>
        </ProveedorCaso>
      </body>
    </html>
  );
}
