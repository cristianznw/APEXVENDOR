import Navbar from "@/components/Navbar";
import { cookies } from "next/headers";

/**
 * Layout principal para la sección del Dashboard.
 * Este componente envuelve todas las páginas del dashboard, proporcionando el Navbar superior
 * y un contenedor principal con el estilo visual base del sistema.
 * Recupera la información de sesión (username y rol) de las cookies para la navegación.
 * 
 * @param props - Contiene los elementos hijos (páginas y componentes internos).
 * @returns El elemento JSX con la estructura compartida del dashboard.
 */
export default async function DashboardLayout({
  children,
}: {
  /** El contenido de la página actual a renderizar. */
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const username = cookieStore.get("username")?.value || "User";
  const role = cookieStore.get("user_role")?.value || "Admin";

  return (
    <div className="min-h-screen flex flex-col">
      {/* Esta es la barra que falta en tu captura */}
      <Navbar username={username} role={role} />

      {/* Aquí es donde se "inyecta" tu ChatPage */}
      <main className="flex-1 bg-[#fafae6]">{children}</main>
    </div>
  );
}
