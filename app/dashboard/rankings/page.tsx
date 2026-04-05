import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import RankingsClient from "./RankingsClient";

/**
 * Página de Rankings del Dashboard.
 * Recupera los 10 mejores proveedores ordenados por su Apex Performance Score (APS).
 * Incluye información del usuario y su foto de perfil actual.
 * 
 * @returns El elemento JSX que renderiza el RankingsClient con los datos iniciales.
 */
export default async function RankingsPage() {
  const cookieStore = await cookies();
  const username = cookieStore.get("username")?.value;

  if (!username) redirect("/login");

  // Fetch all vendors ordered by score
  const vendors = await db.perfilProveedor.findMany({
    orderBy: {
      score: { sort: "desc", nulls: "last" },
    },
    take: 10,
    include: {
      usuario: {
        include: {
          pfps: true,
        },
      },
    },
  });

  return (
    <div className="min-h-screen bg-[#fafae6]">
      <RankingsClient initialVendors={vendors} />
    </div>
  );
}
