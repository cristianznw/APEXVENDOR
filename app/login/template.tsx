"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";

/**
 * Plantilla de animación para las rutas de login.
 * Utiliza `AnimatePresence` de `framer-motion` para proporcionar transiciones suaves
 * de entrada y salida entre las diferentes vistas del flujo de autenticación.
 * 
 * @param props - Contiene los elementos hijos a animar.
 * @returns El elemento JSX envuelto en animaciones de transición.
 */
export default function LoginTemplate({
  children,
}: {
  /** El contenido a renderizar dentro de la plantilla animada. */
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{
          duration: 0.3,
          ease: "easeInOut",
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
