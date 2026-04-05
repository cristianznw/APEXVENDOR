"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

/**
 * Página informativa para usuarios con cuenta desactivada o suspendida.
 * Muestra un mensaje de advertencia y proporciona canales de contacto para la reactivación.
 * Estilo visual oscuro con acentos en rojo para indicar restricción.
 * 
 * @returns El elemento JSX de la página de cuenta desactivada.
 */
export default function DeactivatedPage() {
  return (
    <div className="min-h-screen bg-[#252525] flex flex-col items-center justify-center p-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mb-8"
      >
        <Image
          src="/TAK_Logo_Symbol.png"
          alt="TAK Logo"
          width={100}
          height={100}
          priority
          className="object-contain w-auto h-24 opacity-50 grayscale transition-all duration-1000 group-hover:grayscale-0 group-hover:opacity-100"
        />
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-black/20 border border-red-500/20 p-12 rounded-[2.5rem] backdrop-blur-xl max-w-lg shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500/50 to-transparent"></div>

        <div className="text-red-500 text-6xl mb-6">⚠️</div>

        <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-4 leading-none">
          Acceso <span className="text-red-500">Restringido</span>
        </h1>

        <p className="text-gray-400 font-medium mb-4 leading-relaxed text-sm">
          Lo sentimos, tu acceso al terminal central de{" "}
          <span className="text-[#e9d26a] font-bold">ApexVendor</span> ha sido
          suspendido temporalmente por un administrador de sistemas.
        </p>

        <p className="text-gray-500 text-xs mb-8 italic">
          Si quieres reactivar tu cuenta puedes enviar un correo con tu
          solicitud a{" "}
          <span className="text-white border-b border-white/20 pb-0.5">
            soporte@apexvendor.com
          </span>
        </p>

        <div className="flex flex-col gap-4">
          <Link
            href="/login"
            className="bg-[#e9d26a] text-[#252525] px-8 py-4 rounded-xl font-black uppercase tracking-widest hover:bg-[#bba955] transition-all shadow-lg shadow-[#e9d26a]/10"
          >
            Regresar al Login
          </Link>

          <p className="text-[10px] text-gray-600 uppercase tracking-widest mt-4">
            Security ID: DEACT_PROV_v2.5
          </p>
        </div>
      </motion.div>

      <footer className="absolute bottom-8 text-[10px] text-gray-600 uppercase tracking-[0.3em]">
        APEX INTELLIGENCE TERMINAL — DEACTIVATED STATUS
      </footer>
    </div>
  );
}
