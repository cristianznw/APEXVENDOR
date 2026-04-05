"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { projectService, type ProjectStatus } from "@/services/projectService";

async function getSessionUsername() {
  const cookieStore = await cookies();
  return cookieStore.get("username")?.value;
}

async function assertAdmin() {
  const username = await getSessionUsername();
  if (!username) throw new Error("No autorizado");

  const user = await db.usuario.findUnique({
    where: { username },
    include: { roles: { include: { rol: true } } },
  });

  const isAdmin = user?.roles?.some((r: any) => r.rol.nombre === "Admin");
  if (!isAdmin) throw new Error("No autorizado");

  return { username, user };
}

/**
 * Acción de servidor para actualizar los detalles generales de un proyecto.
 * 
 * @param prev - Estado anterior de la acción.
 * @param formData - Datos actualizados del proyecto (cliente, nombre, descripción, stack, fechas).
 * @returns Un objeto con el resultado de la operación.
 */
export async function updateProjectAction(prev: any, formData: FormData) {
  try {
    await assertAdmin();

    const id_proyecto = String(formData.get("id_proyecto") || "");
    const cliente = String(formData.get("cliente") || "");
    const nombre = String(formData.get("nombre") || "");
    const descripcion = (formData.get("descripcion") as string) || "";
    const tecnologia_stack = (formData.get("tecnologia_stack") as string) || "";
    const inicio = String(formData.get("inicio") || "");
    const fin = (formData.get("fin") as string) || "";

    if (!id_proyecto) return { error: "Falta id_proyecto" };
    if (!cliente || !nombre || !inicio)
      return { error: "Cliente, nombre e inicio son obligatorios" };

    await projectService.updateProject({
      id_proyecto,
      cliente,
      nombre,
      descripcion: descripcion || null,
      tecnologia_stack: tecnologia_stack || null,
      inicio,
      fin: fin || null,
    });

    revalidatePath(`/dashboard/projects/${id_proyecto}`);
    return { success: true };
  } catch (e: any) {
    return { error: e?.message || "No se pudo actualizar el proyecto" };
  }
}

/**
 * Acción de servidor para cambiar el estado de un proyecto desde su página de detalle.
 * 
 * @param prev - Estado anterior.
 * @param formData - Contiene 'id_proyecto' y el nuevo 'estado'.
 * @returns Un objeto indicando éxito o error.
 */
export async function updateProjectStatusAction(prev: any, formData: FormData) {
  try {
    await assertAdmin();

    const id_proyecto = String(formData.get("id_proyecto") || "");
    const estado = String(formData.get("estado") || "") as ProjectStatus;

    if (!id_proyecto || !estado) return { error: "Datos incompletos" };

    await projectService.updateProjectStatus(id_proyecto, estado);

    revalidatePath(`/dashboard/projects/${id_proyecto}`);
    return { success: true };
  } catch (e: any) {
    return { error: e?.message || "No se pudo cambiar el estado" };
  }
}

/**
 * Acción de servidor para asignar un proveedor a un proyecto específico.
 * Permite subir un contrato opcional y definir el rol del proveedor.
 * 
 * @param prev - Estado anterior.
 * @param formData - Datos de la asignación (id_proyecto, id_proveedor, rol, fechas, contrato).
 * @returns Un objeto con el resultado de la asiganción.
 */
export async function assignVendorAction(prev: any, formData: FormData) {
  try {
    const { user } = await assertAdmin();
    if (!user) throw new Error("Usuario no encontrado");

    const id_proyecto = String(formData.get("id_proyecto") || "");
    const id_proveedor = String(formData.get("id_proveedor") || "");
    const rol_en_proyecto = String(formData.get("rol_en_proyecto") || "");
    const inicio = (formData.get("inicio") as string) || "";
    const fin = (formData.get("fin") as string) || "";
    const contratoFile = formData.get("contrato") as File | null;

    if (!id_proyecto || !id_proveedor || !rol_en_proyecto) {
      return { error: "Proyecto, proveedor y rol son obligatorios" };
    }

    await projectService.assignVendorToProject({
      id_proyecto,
      id_proveedor,
      rol_en_proyecto,
      inicio: inicio || null,
      fin: fin || null,
      contrato: contratoFile,
      cargado_por: user.id_usuario,
    });

    revalidatePath(`/dashboard/projects/${id_proyecto}`);
    return { success: true };
  } catch (e: any) {
    return { error: e?.message || "No se pudo asignar el proveedor" };
  }
}

/**
 * Acción de servidor para remover la participación de un proveedor en un proyecto.
 * 
 * @param prev - Estado anterior.
 * @param formData - Contiene 'id_proyecto' e 'id_participacion'.
 * @returns Un objeto indicando el éxito de la eliminación.
 */
export async function removeVendorAction(prev: any, formData: FormData) {
  try {
    await assertAdmin();

    const id_proyecto = String(formData.get("id_proyecto") || "");
    const id_participacion = String(formData.get("id_participacion") || "");

    if (!id_participacion || !id_proyecto) return { error: "Datos incompletos" };

    await projectService.removeVendorFromProject(id_participacion);

    revalidatePath(`/dashboard/projects/${id_proyecto}`);
    return { success: true };
  } catch (e: any) {
    return { error: e?.message || "No se pudo quitar el proveedor" };
  }
}

/**
 * Acción de servidor para eliminar un proyecto por completo.
 * Requiere permisos de administrador.
 * 
 * @param prev - Estado anterior.
 * @param formData - Contiene el 'id_proyecto' a eliminar.
 * @returns Un objeto con el resultado de la eliminación.
 */
export async function deleteProjectAction(prev: any, formData: FormData) {
  try {
    await assertAdmin();

    const id_proyecto = String(formData.get("id_proyecto") || "");
    if (!id_proyecto) return { error: "Falta id_proyecto" };

    await projectService.deleteProject(id_proyecto);

    revalidatePath("/dashboard/projects");
    return { success: true };
  } catch (e: any) {
    return { error: e?.message || "No se pudo eliminar el proyecto" };
  }
}
/**
 * Acción de servidor para actualizar los detalles de una asignación de proveedor existente.
 * Permite modificar el rol y las fechas de participación.
 * 
 * @param prev - Estado anterior.
 * @param formData - Datos actualizados de la participación.
 * @returns Un objeto con el resultado de la actualización.
 */
export async function updateProjectAssignmentAction(prev: any, formData: FormData) {
  try {
    await assertAdmin();

    const id_participacion = String(formData.get("id_participacion") || "");
    const id_proyecto = String(formData.get("id_proyecto") || "");
    const rol_en_proyecto = String(formData.get("rol_en_proyecto") || "");
    const inicio = (formData.get("inicio") as string) || "";
    const fin = (formData.get("fin") as string) || "";

    if (!id_participacion || !id_proyecto || !rol_en_proyecto) {
      return { error: "Datos incompletos" };
    }

    await projectService.updateVendorAssignment({
      id_participacion,
      rol_en_proyecto,
      inicio: inicio || null,
      fin: fin || null,
    });

    revalidatePath(`/dashboard/projects/${id_proyecto}`);
    return { success: true };
  } catch (e: any) {
    return { error: e?.message || "No se pudo actualizar la asignación" };
  }
}

/**
 * Acción de servidor para guardar una evaluación de desempeño para un proveedor en un proyecto.
 * Procesa múltiples métricas dinámicas y calcula la calificación global.
 * 
 * @param prev - Estado anterior.
 * @param formData - Datos de la evaluación (participación, evaluador, comentario, métricas).
 * @returns Un objeto indicando el éxito del guardado.
 */
export async function saveEvaluationAction(prev: any, formData: FormData) {
  try {
    const { user } = await assertAdmin();

    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    const id_participacion = String(formData.get("id_participacion") || "");
    const id_evaluador = String(formData.get("id_evaluador") || "");
    const comentario = String(formData.get("comentario") || "");

    if (!id_participacion || !id_evaluador || !comentario) {
      return { error: "Faltan datos obligatorios" };
    }

    // Extract metrics from formData. Keys are like "metric_<uuid>"
    const detalles: { id_metrica: string; valor_numerico: number }[] = [];
    let totalScore = 0;
    let count = 0;

    for (const [key, value] of Array.from(formData.entries())) {
      if (key.startsWith("metric_")) {
        const id_metrica = key.replace("metric_", "");
        const valor = Number(value);
        if (id_metrica && !isNaN(valor)) {
          detalles.push({ id_metrica, valor_numerico: valor });
          totalScore += valor;
          count++;
        }
      }
    }

    const calificacion_global = count > 0 ? totalScore / count : 0;

    await projectService.saveEvaluation({
      id_participacion,
      evaluador: user.id_usuario,
      comentario_cualitativo: comentario,
      calificacion_global,
      detalles,
    });

    // Revalidate project page
    const participation = await db.participacion_proveedor.findUnique({
      where: { id_participacion },
      select: { id_proyecto: true }
    });

    if (participation?.id_proyecto) {
      revalidatePath(`/dashboard/projects/${participation.id_proyecto}`);
    }

    return { success: true };
  } catch (e: any) {
    return { error: e?.message || "Error al guardar evaluación" };
  }
}
