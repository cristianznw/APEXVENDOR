"use client";

import { HeroUIProvider } from "@heroui/system";

/**
 * Componente envoltorio para los proveedores de contexto de la aplicación.
 * Actualmente configura `HeroUIProvider` para el sistema de diseño y componentes UI.
 * 
 * @param props - Contiene los elementos hijos que requieren acceso a los contextos.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return <HeroUIProvider>{children}</HeroUIProvider>;
}
