import LoadingCircle from "@/components/LoadingCircle";

/**
 * Componente de carga para la página de registro.
 * Proporciona un estado visual coherente mientras se carga el formulario de inscripción multicapa.
 * 
 * @returns El elemento JSX con el estado de carga.
 */
export default function RegisterLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen py-10 px-4 bg-[#fafae6]">
      <LoadingCircle />
    </div>
  );
}
