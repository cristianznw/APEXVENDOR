"use client";

import { useState } from "react";
import { toggleVendorStatusAction } from "./actions";

export default function AdminListModal({
    admins,
}: {
    admins: {
        id_usuario: string;
        username: string | null;
        correo: string;
        creado_en: Date;
        estado_cuenta: string;
    }[];
}) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="bg-white text-[#252525] text-[10px] font-black px-6 py-3 rounded-2xl uppercase tracking-tighter shadow-sm border border-gray-200 hover:border-[#e9d26a]/60 hover:shadow-md transition-all active:scale-95 cursor-pointer"
            >
                Administradores
            </button>

            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    <div
                        className="absolute inset-0 bg-black/40"
                        onClick={() => setOpen(false)}
                    />

                    <div className="relative w-full max-w-2xl bg-[#fafae6] rounded-[2rem] shadow-2xl border border-black/10 p-8 animate-in fade-in zoom-in duration-200 overflow-hidden flex flex-col max-h-[80vh]">
                        <div className="flex items-start justify-between mb-6 shrink-0">
                            <div>
                                <h3 className="text-[#252525] font-black text-xl uppercase tracking-tighter">
                                    Directorio de Admins
                                </h3>
                                <p className="text-gray-400 text-[10px] uppercase tracking-widest font-bold mt-1">
                                    Cuentas con acceso administrativo temporal y permanente
                                </p>
                            </div>

                            <button
                                onClick={() => setOpen(false)}
                                className="text-gray-400 hover:text-black font-black text-xl leading-none cursor-pointer"
                                aria-label="Cerrar"
                            >
                                ×
                            </button>
                        </div>

                        <div className="overflow-y-auto pr-2 custom-scrollbar flex-1">
                            <div className="space-y-3">
                                {admins.map((admin) => (
                                    <div
                                        key={admin.id_usuario}
                                        className="flex flex-col sm:flex-row sm:items-center justify-between bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:border-[#e9d26a]/40 transition-colors"
                                    >
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                <div className="font-bold text-[#252525] text-base leading-tight">
                                                    @{admin.username || "sin_usuario"}
                                                </div>
                                                {admin.estado_cuenta?.toLowerCase() === "suspendido" && (
                                                    <span className="bg-red-100 text-red-600 text-[8px] font-black uppercase px-2 py-0.5 rounded-full">
                                                        Suspendido
                                                    </span>
                                                )}
                                                {(admin.estado_cuenta?.toLowerCase() === "activo" || !admin.estado_cuenta) && (
                                                    <span className="bg-green-100 text-green-600 text-[8px] font-black uppercase px-2 py-0.5 rounded-full">
                                                        Activo
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-none">
                                                {admin.correo}
                                            </div>
                                            <div className="text-[9px] text-[#bba955] font-black uppercase tracking-tighter mt-1">
                                                Creado: {new Date(admin.creado_en).toLocaleDateString()}
                                            </div>
                                        </div>

                                        <div className="mt-4 sm:mt-0">
                                            <form action={(formData) => { toggleVendorStatusAction(formData); }}>
                                                <input type="hidden" name="id_usuario" value={admin.id_usuario} />
                                                <input type="hidden" name="currentStatus" value={admin.estado_cuenta || 'Activo'} />
                                                <button
                                                    type="submit"
                                                    className={`inline-flex items-center justify-center px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-md transition-all cursor-pointer ${(admin.estado_cuenta?.toLowerCase() || 'activo') === 'activo'
                                                        ? 'bg-red-50/50 text-red-600 hover:bg-red-100 border border-red-200'
                                                        : 'bg-green-50/50 text-green-600 hover:bg-green-100 border border-green-200'
                                                        }`}
                                                >
                                                    {(admin.estado_cuenta?.toLowerCase() || 'activo') === 'activo' ? 'Desactivar' : 'Activar'}
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                ))}

                                {admins.length === 0 && (
                                    <div className="py-10 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">
                                        No hay administradores registrados
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end pt-6 shrink-0 border-t border-black/5 mt-4">
                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                className="bg-[#252525] text-[#e9d26a] text-[10px] font-black px-8 py-3 rounded-2xl uppercase tracking-tighter shadow-xl hover:bg-black transition cursor-pointer"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
