import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

/**
 * Servicio encargado de la autenticación de usuarios.
 */
export const authService = {
  /**
   * Autentica a un usuario verificando sus credenciales e inicializando su sesión.
   * Actualiza la fecha del último acceso tras una autenticación exitosa.
   * 
   * @param username - El nombre de usuario o correo electrónico proporcionado.
   * @param password - La contraseña en texto plano para verificar.
   * @returns Un objeto con el resultado de la operación (éxito, error y datos del usuario).
   */
  async authenticateUser(username: string, password: string) {
    const normalizedUsername = username ? username.trim().toLowerCase() : "";

    const user = await db.usuario.findUnique({
      where: { correo: normalizedUsername || undefined },
    });

    if (!user || !user.passwordHash) {
      return { success: false, error: "Usuario no encontrado" };
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);

    if (!isValid) {
      return { success: false, error: "Contraseña incorrecta" };
    }

    // Actualizar último acceso
    await db.usuario.update({
      where: { id_usuario: user.id_usuario },
      data: { ultimo_acceso: new Date() },
    });

    return {
      success: true,
      user: {
        id: user.id_usuario,
        username: user.username,
        email: user.correo,
      },
    };
  },
};
