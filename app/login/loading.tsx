import LoadingCircle from "@/components/LoadingCircle";

/**
 * Componente de carga para la página de login.
 * Muestra un indicador circular centrado mientras se carga la página de inicio de sesión.
 * 
 * @returns El elemento JSX con el estado de carga.
 */
export default function LoginLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-[#f8f9fa]">
      <LoadingCircle />
    </div>
  );
}
