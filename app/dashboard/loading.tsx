import LoadingCircle from "@/components/LoadingCircle";

/**
 * Componente de carga (Suspense) para el Dashboard.
 * Muestra una pantalla de carga armonizada con el diseño visual del sistema
 * mientras se resuelven las promesas de servidor de las subpáginas.
 * 
 * @returns El elemento JSX con el indicador de carga.
 */
export default function DashboardLoading() {
  return (
    <div className="flex-1 bg-[#fafae6] flex items-center justify-center p-8">
      <LoadingCircle />
    </div>
  );
}
