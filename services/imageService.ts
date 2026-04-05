import { db } from "@/lib/db";

/**
 * Servicio para la gestión de imágenes de perfil almacenadas en la base de datos.
 */
export const imageService = {
  /**
   * Establece o actualiza la imagen de perfil de un usuario.
   * 
   * @param username - El nombre de usuario único.
   * @param base64Image - La imagen en formato base64.
   * @returns El registro de la imagen creada o actualizada.
   */
  async setProfileImage(username: string, base64Image: string) {
    // Usamos el username como identificador único
    return await db.pfps.upsert({
      where: { username: username },
      update: { image_base64: base64Image },
      create: {
        username: username,
        image_base64: base64Image,
      },
    });
  },

  /**
   * Obtiene la imagen de perfil de un usuario.
   * 
   * @param username - El nombre de usuario único.
   * @returns La cadena de texto en formato base64 de la imagen o null si no se encuentra.
   */
  async getProfileImage(username: string) {
    const res = await db.pfps.findUnique({
      where: { username: username },
    });
    return res?.image_base64 || null;
  },
};
