// lib/utils.ts
import crypto from "crypto";

/**
 * Genera un nombre de usuario pseudo-único basado en el nombre proporcionado.
 * Sigue el formato: "{base}-{primer_nombre}-{hash_corto}".
 * 
 * @param name - El nombre completo o parcial del usuario.
 * @param base - Prefijo base para el nombre de usuario (por defecto "p").
 * @param length - Longitud del hash que se incluirá al final (por defecto 8).
 * @returns El nombre de usuario generado en minúsculas.
 */
export function generateUsername(
  name: string = "user",
  base: string = "p",
  length: number = 8
): string {
  // Generamos un string aleatorio (equivalente a random.choices en Python)
  const randomStr = crypto.randomBytes(16).toString("hex");

  // Creamos el hash SHA256 (equivalente a hashlib.sha256)
  const hash = crypto.createHash("sha256").update(randomStr).digest("hex");

  // Tomamos la primera parte del nombre y el prefijo del hash
  const firstName = name.toLowerCase().split(" ")[0];

  return `${base}-${firstName}-${hash.substring(0, length)}`;
}
