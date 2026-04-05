import { db } from "@/lib/db";

/**
 * Obtiene todos los proveedores registrados en el sistema, incluyendo información básica de su usuario.
 * Los resultados están ordenados alfabéticamente por nombres o apellidos.
 * 
 * @returns Una lista de perfiles de proveedores con sus datos de usuario asociados.
 */
export async function getAllVendors() {
  return await db.perfilProveedor.findMany({
    include: {
      usuario: {
        select: {
          username: true,
          correo: true,
          estado_cuenta: true,
        },
      },
    },
    orderBy: {
      nombres_apellidos: "asc",
    },
  });
}
