import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * Metadatos globales de la aplicación.
 * Define el título, descripción e iconos que aparecen en la pestaña del navegador y motores de búsqueda.
 */
export const metadata: Metadata = {
  title: "ApexVendor | AI Intelligence Terminal",
  description:
    "Plataforma inteligente de gestión de proveedores y licitaciones.",
  icons: {
    // Esto buscará favicon.ico o icon.png en la carpeta /public
    icon: "/favicon.ico",
    // Opcional: Icono para cuando guardan la web en iPhone
    apple: "/apple-icon.png",
  },
};

/**
 * Layout raíz de toda la aplicación.
 * Configura el HTML base, el idioma (español), las fuentes tipográficas globales y envuelve
 * la aplicación en el proveedor de contextos (NextUI/Providers).
 * Incluye efectos visuales globales como la 'scanline'.
 * 
 * @param props - Elementos hijos a renderizar dentro de la estructura base.
 * @returns El elemento JSX con la estructura HTML de primer nivel.
 */
export default function RootLayout({
  children,
}: {
  /** El contenido de la página o ruta actual. */
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        suppressHydrationWarning={true} // <--- Añade esto aquí
        className={`${geistSans.variable} ${geistMono.variable} antialiased no-scrollbar`}
      >
        <div className="scanline" />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
