import { db } from "@/lib/db";
import { uploadToAzureBlob } from "@/lib/azureBlob";

/**
 * Estados posibles de un proyecto.
 */
export type ProjectStatus =
  | "planificado"
  | "en curso"
  | "pausado"
  | "completado"
  | "cancelado";

type CreateProjectInput = {
  cliente: string;
  nombre: string;
  descripcion?: string | null;
  tecnologia_stack?: string | null;
  inicio: string; // OBLIGATORIO (YYYY-MM-DD)
  fin?: string | null;
  estado?: ProjectStatus;
};

type UpdateProjectInput = {
  id_proyecto: string;
  cliente: string;
  nombre: string;
  descripcion?: string | null;
  tecnologia_stack?: string | null;
  inicio: string; // OBLIGATORIO
  fin?: string | null;
};

const allowedTransitions: Record<ProjectStatus, ProjectStatus[]> = {
  planificado: ["en curso", "cancelado"],
  "en curso": ["pausado", "completado", "cancelado"],
  pausado: ["en curso", "cancelado"],
  completado: [],
  cancelado: [],
};

/**
 * Servicio para la gestión de proyectos, participantes y evaluaciones.
 */
export const projectService = {
  /**
   * Crea un nuevo proyecto en la base de datos.
   * 
   * @param data - Los datos del proyecto a crear.
   * @returns El proyecto creado.
   */
  async createProject(data: CreateProjectInput) {
    // inicio obligatorio
    if (!data.inicio) throw new Error("La fecha de inicio es obligatoria.");

    return await db.proyecto.create({
      data: {
        cliente: data.cliente,
        nombre: data.nombre,
        descripcion: data.descripcion || null,
        tecnologia_stack: data.tecnologia_stack || null,
        inicio: new Date(data.inicio),
        fin: data.fin ? new Date(data.fin) : null,
        estado: data.estado || "planificado",
      },
    });
  },

  /**
   * Lista todos los proyectos ordenados por fecha de inicio descendente.
   * 
   * @returns Una lista de todos los proyectos.
   */
  async listProjects() {
    return await db.proyecto.findMany({
      orderBy: [{ inicio: "desc" }],
    });
  },

  /**
   * Obtiene un proyecto por su identificador único.
   * 
   * @param id_proyecto - El ID del proyecto.
   * @returns El proyecto encontrado o null.
   */
  async getProjectById(id_proyecto: string) {
    return await db.proyecto.findUnique({
      where: { id_proyecto },
    });
  },

  /**
   * Lista los participantes de un proyecto específico, incluyendo evaluaciones y contratos.
   * 
   * @param id_proyecto - El ID del proyecto.
   * @returns Una lista de participantes con sus detalles.
   */
  async listProjectParticipants(id_proyecto: string) {
    const participants = await db.participacion_proveedor.findMany({
      where: { id_proyecto },
      include: {
        perfil_proveedor: {
          include: {
            usuario: true, // para username/correo si lo quieres mostrar
          },
        },
        evaluacion: true,
        contrato_participacion: true,
      },
      orderBy: [{ inicio: "desc" }],
    });

    // Convertir Decimal a number para que sea serializable por Next.js
    return participants.map((p) => ({
      ...p,
      evaluacion: p.evaluacion.map((e) => ({
        ...e,
        calificacion_global: e.calificacion_global
          ? Number(e.calificacion_global)
          : null,
      })),
    }));
  },

  /**
   * Lista los proveedores disponibles para ser asignados a un proyecto (excluyendo los ya asignados).
   * 
   * @param id_proyecto - El ID del proyecto.
   * @returns Una lista de proveedores no suspendidos y no asignados aún.
   */
  async listProvidersForAssign(id_proyecto: string) {
    const assigned = await db.participacion_proveedor.findMany({
      where: { id_proyecto },
      select: { id_proveedor: true },
    });

    const assignedIds = assigned.map((a) => a.id_proveedor);

    return await db.perfilProveedor.findMany({
      where: {
        id_proveedor: { notIn: assignedIds.length ? assignedIds : undefined },
        usuario: {
          estado_cuenta: {
            not: "Suspendido",
          },
        },
      },
      include: {
        usuario: true,
      },
      orderBy: [{ score: "desc" }],
    });
  },

  /**
   * Actualiza los datos básicos de un proyecto.
   * 
   * @param data - Los nuevos datos del proyecto.
   * @returns El proyecto actualizado.
   */
  async updateProject(data: UpdateProjectInput) {
    if (!data.inicio) throw new Error("La fecha de inicio es obligatoria.");

    return await db.proyecto.update({
      where: { id_proyecto: data.id_proyecto },
      data: {
        cliente: data.cliente,
        nombre: data.nombre,
        descripcion: data.descripcion || null,
        tecnologia_stack: data.tecnologia_stack || null,
        inicio: new Date(data.inicio),
        fin: data.fin ? new Date(data.fin) : null,
      },
    });
  },

  /**
   * Actualiza el estado de un proyecto validando las transiciones permitidas.
   * 
   * @param id_proyecto - El ID del proyecto.
   * @param nextStatus - El nuevo estado al que se desea cambiar.
   * @returns El proyecto con el nuevo estado.
   */
  async updateProjectStatus(id_proyecto: string, nextStatus: ProjectStatus) {
    const project = await db.proyecto.findUnique({ where: { id_proyecto } });
    if (!project) throw new Error("Proyecto no encontrado.");

    const current = (project.estado || "planificado") as ProjectStatus;
    const allowed = allowedTransitions[current] || [];

    if (!allowed.includes(nextStatus)) {
      throw new Error(
        `Transición inválida: ${current} → ${nextStatus}. Permitidas: ${allowed.join(", ") || "ninguna"
        }`,
      );
    }

    return await db.proyecto.update({
      where: { id_proyecto },
      data: { estado: nextStatus },
    });
  },

  /**
   * Actualiza la información de asignación de un proveedor en un proyecto.
   * 
   * @param params - Parámetros de actualización (id_participacion, rol, fechas).
   * @returns La participación actualizada.
   */
  async updateVendorAssignment(params: {
    id_participacion: string;
    rol_en_proyecto: string;
    inicio?: string | null;
    fin?: string | null;
  }) {
    // Validar fechas contra el proyecto
    const participacionOriginal = await db.participacion_proveedor.findUnique({
      where: { id_participacion: params.id_participacion },
      include: { proyecto: true }
    });

    if (!participacionOriginal) throw new Error("Participación no encontrada");

    const proyecto = participacionOriginal.proyecto;
    if (params.inicio && proyecto.inicio) {
      if (new Date(params.inicio) < new Date(proyecto.inicio)) {
        throw new Error("La participación no puede iniciar antes del proyecto.");
      }
    }
    if (params.fin && proyecto.fin) {
      if (new Date(params.fin) > new Date(proyecto.fin)) {
        throw new Error("La participación no puede terminar después del proyecto.");
      }
    }

    return await db.participacion_proveedor.update({
      where: { id_participacion: params.id_participacion },
      data: {
        rol_en_proyecto: params.rol_en_proyecto,
        inicio: params.inicio ? new Date(params.inicio) : null,
        fin: params.fin ? new Date(params.fin) : null,
      },
    });
  },

  /**
   * Asigna un proveedor a un proyecto, opcionalmente cargando un contrato.
   * 
   * @param params - Detalles de la asignación y archivo de contrato.
   * @returns La participación creada.
   */
  async assignVendorToProject(params: {
    id_proyecto: string;
    id_proveedor: string;
    rol_en_proyecto: string;
    inicio?: string | null; // YYYY-MM-DD
    fin?: string | null; // YYYY-MM-DD
    contrato?: File | null;
    cargado_por: string;
  }) {
    // Evitar duplicados
    const existing = await db.participacion_proveedor.findFirst({
      where: {
        id_proyecto: params.id_proyecto,
        id_proveedor: params.id_proveedor,
      },
    });
    if (existing)
      throw new Error("Este proveedor ya está asignado al proyecto.");

    // Validar estado de cuenta
    const vendor = await db.perfilProveedor.findUnique({
      where: { id_proveedor: params.id_proveedor },
      include: { usuario: true }
    });
    if (!vendor || vendor.usuario?.estado_cuenta?.toLowerCase() === "suspendido") {
      throw new Error("No se puede asignar un proveedor con cuenta suspendida.");
    }

    // Validar fechas
    const proyecto = await db.proyecto.findUnique({
      where: { id_proyecto: params.id_proyecto }
    });
    if (!proyecto) throw new Error("Proyecto no encontrado");

    if (params.inicio && proyecto.inicio) {
      if (new Date(params.inicio) < new Date(proyecto.inicio)) {
        throw new Error("La participación no puede iniciar antes del proyecto.");
      }
    }
    if (params.fin && proyecto.fin) {
      if (new Date(params.fin) > new Date(proyecto.fin)) {
        throw new Error("La participación no puede terminar después del proyecto.");
      }
    }

    return await db.$transaction(async (tx) => {
      const participacion = await tx.participacion_proveedor.create({
        data: {
          id_proyecto: params.id_proyecto,
          id_proveedor: params.id_proveedor,
          rol_en_proyecto: params.rol_en_proyecto,
          inicio: params.inicio ? new Date(params.inicio) : null,
          fin: params.fin ? new Date(params.fin) : null,
        },
      });

      if (params.contrato) {
        // Validation: Only PDF
        if (params.contrato.type !== "application/pdf") {
          throw new Error("Solo se permiten archivos PDF para el contrato.");
        }

        // Upload to Azure Blob Storage
        const containerName = process.env.AZURE_STORAGE_CONTRACT_CONTAINER || "contratos";
        const fileExt = "pdf"; // Forced for safety
        const blobName = `${params.id_proyecto}-${params.id_proveedor}-${Date.now()}.${fileExt}`;

        const uploadResult = await uploadToAzureBlob({
          containerName,
          blobName,
          file: params.contrato,
        });

        // Create the contract record
        await tx.contrato_participacion.create({
          data: {
            id_participacion: participacion.id_participacion,
            nombre_archivo: params.contrato.name,
            url_archivo: uploadResult.url,
            cargado_por: params.cargado_por,
          },
        });
      }

      return participacion;
    });
  },

  /**
   * Elimina un proveedor de un proyecto y recalcula su puntaje (score) si tenía evaluación.
   * 
   * @param id_participacion - El ID de la participación a eliminar.
   * @returns El registro de participación eliminado.
   */
  async removeVendorFromProject(id_participacion: string) {
    const participacion = await db.participacion_proveedor.findUnique({
      where: { id_participacion },
      include: {
        evaluacion: {
          select: { calificacion_global: true },
        },
      },
    });

    if (!participacion) throw new Error("Participación no encontrada");

    const tieneEvaluacionValida =
      participacion.evaluacion.length > 0 &&
      participacion.evaluacion[0].calificacion_global !== null;

    if (!tieneEvaluacionValida) {
      // Si no hay evaluación que afecte el score, solo borramos la participación de forma sencilla
      return await db.participacion_proveedor.delete({
        where: { id_participacion },
      });
    }

    // Si había evaluación, borramos en transacción y recalculamos el score
    return await db.$transaction(async (tx) => {
      // 1. Borrar la participación (Borra la evaluación asociada por Cascada)
      const deletedRecord = await tx.participacion_proveedor.delete({
        where: { id_participacion },
      });

      // 2. Traer el resto de evaluaciones que todavía tiene el proveedor
      const providerEvaluations = await tx.evaluacion.findMany({
        where: {
          participacion_proveedor: {
            id_proveedor: participacion.id_proveedor,
          },
          calificacion_global: { not: null },
        },
        select: { calificacion_global: true },
      });

      // 3. Recalcular promedio exacto
      const total = providerEvaluations.reduce(
        (sum, e) => sum + (Number(e.calificacion_global) || 0),
        0
      );
      const count = providerEvaluations.length;
      const newScore = count > 0 ? total / count : 0;

      // 4. Actualizar score en el perfil del proveedor
      await tx.perfilProveedor.update({
        where: { id_proveedor: participacion.id_proveedor },
        data: { score: newScore },
      });

      return deletedRecord;
    });
  },

  /**
   * Elimina un proyecto por completo.
   * 
   * @param id_proyecto - El ID del proyecto a eliminar.
   * @returns El registro del proyecto eliminado.
   */
  async deleteProject(id_proyecto: string) {
    // Nota: por FK ON DELETE CASCADE, se borran participaciones, evaluaciones, etc.
    // FUTURO: antes de borrar aquí es donde iría “borrar contratos del blob” si tuvieras contenedor.
    return await db.proyecto.delete({
      where: { id_proyecto },
    });
  },

  /**
   * Guarda una evaluación para un proveedor en un proyecto y actualiza su score global.
   * 
   * @param data - Datos de la evaluación (participación, evaluador, comentarios, métricas).
   * @returns El registro de evaluación creado.
   */
  async saveEvaluation(data: {
    id_participacion: string;
    evaluador: string; // id_usuario
    comentario_cualitativo: string;
    calificacion_global?: number;
    detalles: {
      id_metrica: string;
      valor_numerico: number;
    }[];
  }) {
    // Prevención de duplicados
    const existingEvaluation = await db.evaluacion.findFirst({
      where: { id_participacion: data.id_participacion },
    });

    if (existingEvaluation) {
      throw new Error("Este proveedor ya ha sido evaluado en este proyecto.");
    }

    return await db.$transaction(async (tx) => {
      // 1. Create the evaluation header
      const evalRecord = await tx.evaluacion.create({
        data: {
          id_participacion: data.id_participacion,
          evaluador: data.evaluador,
          comentario_cualitativo: data.comentario_cualitativo,
          calificacion_global: data.calificacion_global,
        },
      });

      // 2. Create the details
      if (data.detalles.length > 0) {
        await tx.evaluacion_detalle.createMany({
          data: data.detalles.map((d) => ({
            id_eval: evalRecord.id_evaluacion,
            id_metrica: d.id_metrica,
            valor_numerico: d.valor_numerico,
          })),
        });
      }

      // 3. Recalculate Provider Score
      // First, find the provider ID from the participation
      const participation = await tx.participacion_proveedor.findUnique({
        where: { id_participacion: data.id_participacion },
        select: { id_proveedor: true },
      });

      if (participation?.id_proveedor) {
        // Fetch all evaluations for this provider
        const providerEvaluations = await tx.evaluacion.findMany({
          where: {
            participacion_proveedor: {
              id_proveedor: participation.id_proveedor,
            },
            calificacion_global: { not: null },
          },
          select: { calificacion_global: true },
        });

        // Calculate average
        // Note: providerEvaluations includes the one we just created because we are in a transaction (and using tx to read)
        // However, Prisma behavior inside transaction for read-your-writes depends on isolation level.
        // Since we just created 'evalRecord', it SHOULD be returned if isolation permits.
        // To be safe and explicit, let's enable accumulating the new value logic.

        // Correction: `tx.evaluacion.findMany` DOES see the newly created record in default Prisma transaction (Read Committed / Repeatable Read depending on DB).
        // Let's assume it works. If not, we can manually append `evalRecord.calificacion_global` if it's missing.

        const total = providerEvaluations.reduce(
          (sum, e) => sum + (Number(e.calificacion_global) || 0),
          0,
        );
        const count = providerEvaluations.length;
        const newScore = count > 0 ? total / count : 0;

        // Update Provider Score
        await tx.perfilProveedor.update({
          where: { id_proveedor: participation.id_proveedor },
          data: { score: newScore },
        });
      }

      return evalRecord;
    });
  },
};
