"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Acción de servidor para cerrar la sesión del usuario.
 * Elimina las cookies de sesión (`session_id` y `username`) de las cabeceras HTTP
 * y redirige al usuario a la página de inicio de sesión.
 * 
 * @returns Redirige automáticamente al login tras limpiar la sesión.
 */
export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("session_id");
  cookieStore.delete("username");
  redirect("/login");
}
