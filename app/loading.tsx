import LoadingCircle from "@/components/LoadingCircle";

/**
 * Componente de carga global de la aplicación.
 * Se muestra mientras se cargan las rutas principales o durante la hidratación inicial.
 * Utiliza un estilo oscuro consistente con la identidad de ApexVendor.
 * 
 * @returns El elemento JSX con el indicador de carga centrado.
 */
export default function Loading() {
  return (
    <div className="min-h-screen bg-[#252525] flex items-center justify-center">
      <LoadingCircle />
    </div>
  );
}
