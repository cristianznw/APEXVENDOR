"use client";

import TermsModal from "@/components/TermsModal";
import { useActionState, useState } from "react";
import { registerAction, checkEmailExistsAction } from "./actions";

type CertUI = {
  nombre: string;
  emisor: string;
  nivel: string;
  fechaEmision: string;
  fechaExpiracion: string;
  file: File | null;
};

/**
 * Página de registro de nuevos usuarios (proveedores).
 * Implementa un formulario de 5 pasos que recopila:
 * 1. Credenciales básicas y aceptación de TyC.
 * 2. Tipo de proveedor (Persona/Empresa).
 * 3. Información legal, de contacto y redes sociales.
 * 4. Disponibilidad horaria y días de servicio.
 * 5. Documentación legal (Hoja de Vida y Certificaciones).
 * 
 * @returns El elemento JSX del flujo de inscripción con validaciones en cada paso.
 */
export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(registerAction, null);

  const [step, setStep] = useState(1);

  // Paso 1
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [acceptedTyC, setAcceptedTyC] = useState(false);
  const [showTyC, setShowTyC] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [checkingEmail, setCheckingEmail] = useState(false);

  // Paso 2
  const [tipoProveedor, setTipoProveedor] = useState<"Persona" | "Empresa">(
    "Persona",
  );

  // Paso 3 (datos + redes)
  const [name, setName] = useState("");
  const [nit, setNit] = useState("");
  const [city, setCity] = useState("");

  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [portafolio, setPortafolio] = useState("");

  const [linkedin, setLinkedin] = useState("");
  const [github, setGithub] = useState("");
  const [website, setWebsite] = useState("");
  const [instagram, setInstagram] = useState("");

  // Paso 4 docs
  const [cv, setCv] = useState<File | null>(null);

  const [certs, setCerts] = useState<CertUI[]>([
    {
      nombre: "",
      emisor: "",
      nivel: "",
      fechaEmision: "",
      fechaExpiracion: "",
      file: null,
    },
  ]);

  // Disponibilidad
  const DAYS_OF_WEEK = [
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
    "Domingo",
  ];
  const [selectedDays, setSelectedDays] = useState<string[]>(["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"]);
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("17:00");

  const toggleDay = (day: string) => {
    setSelectedDays((prev) => {
      const next = prev.includes(day)
        ? prev.filter((d) => d !== day)
        : [...prev, day];
      return next.sort(
        (a, b) => DAYS_OF_WEEK.indexOf(a) - DAYS_OF_WEEK.indexOf(b),
      );
    });
  };

  const format12h = (time: string) => {
    if (!time) return "--:--";
    const [h, m] = time.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    return `${h12}:${m.toString().padStart(2, "0")} ${ampm}`;
  };

  /**
   * Componente selector de hora personalizado con formato de 12 horas.
   * Permite elegir hora, minuto y periodo (AM/PM).
   * 
   * @param props - Propiedades: etiqueta descriptiva, valor actual y callback de cambio.
   */
  const TimeSelector = ({
    label,
    value,
    onChange,
  }: {
    /** Etiqueta que describe el campo (ej: 'Desde', 'Hasta'). */
    label: string;
    /** Valor de la hora en formato 24h (HH:mm). */
    value: string;
    /** Función callback que se ejecuta al cambiar la selección. */
    onChange: (val: string) => void;
  }) => {
    const [h, m] = value.split(":");
    const hour24 = parseInt(h);
    const ampm = hour24 >= 12 ? "PM" : "AM";
    const hour12 = hour24 % 12 || 12;

    const handleHourChange = (newH12: number) => {
      let newH24 = newH12;
      if (ampm === "PM" && newH12 < 12) newH24 += 12;
      if (ampm === "AM" && newH12 === 12) newH24 = 0;
      onChange(`${newH24.toString().padStart(2, "0")}:${m}`);
    };

    const handleMinuteChange = (newM: string) => {
      onChange(`${h}:${newM}`);
    };

    const toggleAMPM = () => {
      let newH24 = hour24;
      if (ampm === "AM") {
        newH24 = (hour24 + 12) % 24;
      } else {
        newH24 = (hour24 - 12 + 24) % 24;
      }
      onChange(`${newH24.toString().padStart(2, "0")}:${m}`);
    };

    return (
      <div className="flex flex-col gap-2">
        <p className="text-[9px] font-black text-[#bba955] uppercase tracking-widest">
          {label}
        </p>
        <div className="flex items-center gap-2 bg-[#fcfcfc] border border-gray-100 rounded-2xl p-2 px-4 shadow-sm focus-within:border-[#e9d26a] transition-all group">
          <select
            value={hour12}
            onChange={(e) => handleHourChange(parseInt(e.target.value))}
            className="bg-transparent text-sm font-black outline-none cursor-pointer p-1 appearance-none hover:text-[#bba955] transition-colors"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((num) => (
              <option key={num} value={num}>
                {num.toString().padStart(2, "0")}
              </option>
            ))}
          </select>
          <span className="text-gray-300 font-bold">:</span>
          <select
            value={m}
            onChange={(e) => handleMinuteChange(e.target.value)}
            className="bg-transparent text-sm font-black outline-none cursor-pointer p-1 appearance-none hover:text-[#bba955] transition-colors"
          >
            {Array.from({ length: 60 }, (_, i) => i).map((min) => (
              <option key={min} value={min.toString().padStart(2, "0")}>
                {min.toString().padStart(2, "0")}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={toggleAMPM}
            className="ml-auto bg-[#252525] text-[#e9d26a] text-[10px] font-black px-4 py-2 rounded-xl active:scale-95 transition-all hover:bg-black hover:shadow-lg uppercase tracking-widest"
          >
            {ampm}
          </button>
        </div>
      </div>
    );
  };

  const passMismatch = confirm.length > 0 && password !== confirm;
  const isPasswordShort = password.length > 0 && password.length < 8;
  const isPhoneShort = telefono.length > 0 && telefono.length < 10;

  /**
   * Avanza al siguiente paso del formulario realizando validaciones de campos obligatorios
   * y lógicas específicas, como el chequeo de disponibilidad de correo electrónico.
   */
  const next = async () => {
    if (step === 1) {
      if (
        !correo ||
        !password ||
        !confirm ||
        passMismatch ||
        !acceptedTyC ||
        isPasswordShort
      )
        return;

      setCheckingEmail(true);
      setEmailError("");
      try {
        const exists = await checkEmailExistsAction(correo);
        if (exists) {
          setEmailError("Este correo ya está registrado.");
          setCheckingEmail(false);
          return;
        }
      } catch (err) {
        console.error("Error al verificar correo:", err);
      }
      setCheckingEmail(false);
    }
    if (step === 2) {
      if (!tipoProveedor) return;
    }
    if (step === 3) {
      if (!name || !nit || !city || isPhoneShort) return;
    }
    if (step === 4) {
      if (!selectedDays.length) return;
    }
    setStep((s) => Math.min(5, s + 1));
  };

  const back = () => setStep((s) => Math.max(1, s - 1));

  const addCert = () => {
    setCerts((prev) => [
      ...prev,
      {
        nombre: "",
        emisor: "",
        nivel: "",
        fechaEmision: "",
        fechaExpiracion: "",
        file: null,
      },
    ]);
  };

  const removeCert = (i: number) => {
    setCerts((prev) => prev.filter((_, idx) => idx !== i));
  };

  const updateCert = (i: number, patch: Partial<CertUI>) => {
    setCerts((prev) =>
      prev.map((c, idx) => (idx === i ? { ...c, ...patch } : c)),
    );
  };

  return (
    <div className="flex items-center justify-center min-h-screen py-10 px-4">
      <div className="form_div max-w-lg w-full">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-black text-[#252525] tracking-tighter uppercase">
            Registro
          </h2>
          <div className="h-1.5 w-12 bg-[#e9d26a] mx-auto mt-2 rounded-full" />
          <p className="text-sm text-gray-500 mt-2">Paso {step} de 5</p>
        </div>

        <form action={formAction} className="flex flex-col gap-4">
          {state?.error && (
            <div className="error text-sm mb-2">{state.error}</div>
          )}

          {/* Hidden fields para enviar todo al final */}
          <input type="hidden" name="correo" value={correo} />
          <input type="hidden" name="password" value={password} />
          <input type="hidden" name="tipo_proveedor" value={tipoProveedor} />

          <input type="hidden" name="name" value={name} />
          <input type="hidden" name="nit" value={nit} />
          <input type="hidden" name="city" value={city} />

          <input type="hidden" name="telefono" value={telefono} />
          <input type="hidden" name="direccion" value={direccion} />
          <input type="hidden" name="portafolio_resumen" value={portafolio} />

          <input type="hidden" name="linkedin" value={linkedin} />
          <input type="hidden" name="github" value={github} />
          <input type="hidden" name="website" value={website} />
          <input type="hidden" name="instagram" value={instagram} />

          <input type="hidden" name="dias_disponibles" value={JSON.stringify(selectedDays)} />
          <input type="hidden" name="horas_disponibles" value={JSON.stringify([startTime, endTime])} />

          <input type="hidden" name="is_admin" value="false" />

          {/* STEP 1 */}
          {step === 1 && (
            <>
              <div className="flex flex-col gap-1">
                <input
                  type="email"
                  placeholder="Correo electrónico"
                  className={`styled-input ${emailError ? "border-red-400" : ""}`}
                  value={correo}
                  onChange={(e) => {
                    setCorreo(e.target.value);
                    setEmailError("");
                  }}
                  required
                />
                {emailError && (
                  <span className="text-xs text-red-500">
                    {emailError}
                  </span>
                )}
              </div>

              <input
                type="password"
                placeholder="Contraseña"
                className={`styled-input ${isPasswordShort ? "border-red-400" : ""
                  }`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {isPasswordShort && (
                <span className="text-xs text-red-500">
                  La contraseña debe tener al menos 8 caracteres.
                </span>
              )}

              <div className="flex flex-col gap-1">
                <input
                  type="password"
                  placeholder="Confirmar contraseña"
                  className={`styled-input ${passMismatch ? "border-red-400" : ""
                    }`}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                />
                {passMismatch && (
                  <span className="text-xs text-red-500">
                    Las contraseñas no coinciden.
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  id="tyc"
                  className="w-4 h-4 text-[#e9d26a] bg-white border-gray-300 rounded focus:ring-[#e9d26a]"
                  checked={acceptedTyC}
                  onChange={(e) => setAcceptedTyC(e.target.checked)}
                />
                <label htmlFor="tyc" className="text-xs text-gray-500">
                  He leído y acepto los{" "}
                  <button
                    type="button"
                    onClick={() => setShowTyC(true)}
                    className="text-[#bba955] font-bold hover:underline"
                  >
                    Términos y Condiciones
                  </button>
                </label>
              </div>

              <button
                type="button"
                className={`btn-gold mt-2 py-3 ${checkingEmail ? "opacity-50 cursor-not-allowed" : ""}`}
                onClick={next}
                disabled={
                  !correo ||
                  !password ||
                  !confirm ||
                  passMismatch ||
                  !acceptedTyC ||
                  isPasswordShort ||
                  checkingEmail
                }
              >
                {checkingEmail ? "Verificando..." : "Siguiente"}
              </button>
            </>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <>
              <label className="text-xs font-bold text-gray-400 ml-1 uppercase">
                Tipo de proveedor
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex items-center gap-2 p-3 rounded-xl border cursor-pointer">
                  <input
                    type="radio"
                    checked={tipoProveedor === "Persona"}
                    onChange={() => setTipoProveedor("Persona")}
                  />
                  <span className="text-sm">Persona</span>
                </label>

                <label className="flex items-center gap-2 p-3 rounded-xl border cursor-pointer">
                  <input
                    type="radio"
                    checked={tipoProveedor === "Empresa"}
                    onChange={() => setTipoProveedor("Empresa")}
                  />
                  <span className="text-sm">Empresa</span>
                </label>
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  className="btn-secondary flex-1 py-3 cursor-pointer"
                  onClick={back}
                >
                  Atrás
                </button>
                <button
                  type="button"
                  className="btn-gold flex-1 py-3"
                  onClick={next}
                >
                  Siguiente
                </button>
              </div>
            </>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-400 ml-1 uppercase">
                  {tipoProveedor === "Empresa"
                    ? "Razón social"
                    : "Nombre completo"}
                </label>
                <input
                  placeholder={
                    tipoProveedor === "Empresa"
                      ? "Nombre legal de la empresa"
                      : "Nombres y apellidos"
                  }
                  className="styled-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  placeholder="NIT / Cédula"
                  className="styled-input"
                  value={nit}
                  type="number"
                  onChange={(e) => setNit(e.target.value)}
                  required
                />
                <input
                  placeholder="Ciudad"
                  className="styled-input"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <input
                    placeholder="Teléfono (opcional)"
                    className={`styled-input ${isPhoneShort ? "border-red-400" : ""
                      }`}
                    type="number"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                  />
                  {isPhoneShort && (
                    <span className="text-[10px] text-red-500">
                      Mínimo 10 caracteres.
                    </span>
                  )}
                </div>
                <input
                  placeholder="Dirección (opcional)"
                  className="styled-input"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                />
              </div>

              <textarea
                placeholder="Resumen portafolio / experiencia (opcional)"
                className="styled-input min-h-[110px]"
                value={portafolio}
                onChange={(e) => setPortafolio(e.target.value)}
              />

              <label className="text-xs font-bold text-gray-400 ml-1 uppercase mt-2">
                Redes sociales (opcional)
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  placeholder="LinkedIn"
                  className="styled-input"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                />
                <input
                  placeholder="GitHub"
                  className="styled-input"
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                />
                <input
                  placeholder="Website"
                  className="styled-input"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
                <input
                  placeholder="Instagram"
                  className="styled-input"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                />
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  className="btn-secondary flex-1 py-3 cursor-pointer"
                  onClick={back}
                >
                  Atrás
                </button>
                <button
                  type="button"
                  className="btn-gold flex-1 py-3"
                  onClick={next}
                  disabled={!name || !nit || !city || isPhoneShort}
                >
                  Siguiente
                </button>
              </div>
            </>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <div className="animate-in fade-in slide-in-from-right duration-500 space-y-6">
              <div>
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-4">
                  Días de Disponibilidad
                </h4>
                <div className="flex flex-wrap gap-2">
                  {DAYS_OF_WEEK.map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={`text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-full transition-all border ${selectedDays.includes(day)
                        ? "bg-[#e9d26a] text-[#252525] border-[#e9d26a] shadow-lg"
                        : "bg-transparent text-gray-400 border-gray-200 hover:border-[#e9d26a] hover:text-[#252525]"
                        }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-4 mt-6">
                  Horario de Disponibilidad
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <TimeSelector
                    label="Desde"
                    value={startTime}
                    onChange={setStartTime}
                  />
                  <TimeSelector
                    label="Hasta"
                    value={endTime}
                    onChange={setEndTime}
                  />
                </div>
                <p className="text-[10px] text-gray-400 font-bold uppercase mt-4">
                  Rango de servicio:{" "}
                  <span className="text-[#252525] font-black whitespace-nowrap">
                    {format12h(startTime)} — {format12h(endTime)}
                  </span>
                </p>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  type="button"
                  className="btn-secondary flex-1 py-3 cursor-pointer"
                  onClick={back}
                >
                  Atrás
                </button>
                <button
                  type="button"
                  className="btn-gold flex-1 py-3"
                  onClick={next}
                  disabled={!selectedDays.length}
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}

          {/* STEP 5 */}
          {step === 5 && (
            <>
              <label className="text-xs font-bold text-gray-400 ml-1 uppercase">
                Hoja de vida (PDF)
              </label>

              {/* Este input SI debe estar dentro del form para que FormData lo incluya */}
              <input
                type="file"
                name="hoja_vida_pdf"
                accept="application/pdf"
                className="styled-input cursor-pointer file:cursor-pointer"
                onChange={(e) => setCv(e.target.files?.[0] ?? null)}
              />

              <div className="mt-3 flex items-center justify-between">
                <label className="text-xs font-bold text-gray-400 ml-1 uppercase">
                  Certificaciones
                </label>
                <button
                  type="button"
                  className="btn-secondary px-3 py-2"
                  onClick={addCert}
                >
                  + Agregar
                </button>
              </div>

              <div className="flex flex-col gap-4">
                {certs.map((c, idx) => (
                  <div key={idx} className="p-3 rounded-xl border">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold">
                        Certificación #{idx + 1}
                      </span>
                      {certs.length > 1 && (
                        <button
                          type="button"
                          className="text-xs text-red-500 hover:underline"
                          onClick={() => removeCert(idx)}
                        >
                          Quitar
                        </button>
                      )}
                    </div>

                    {/* Nombres en arrays para que FormData.getAll(...) funcione */}
                    <input
                      name="cert_nombre[]"
                      placeholder="Nombre certificación"
                      className="styled-input"
                      value={c.nombre}
                      onChange={(e) =>
                        updateCert(idx, { nombre: e.target.value })
                      }
                    />
                    <input
                      name="cert_emisor[]"
                      placeholder="Emisor"
                      className="styled-input mt-2"
                      value={c.emisor}
                      onChange={(e) =>
                        updateCert(idx, { emisor: e.target.value })
                      }
                    />
                    <select
                      name="cert_nivel[]"
                      className="styled-input mt-2 text-sm text-gray-700 bg-white"
                      value={c.nivel}
                      onChange={(e) =>
                        updateCert(idx, { nivel: e.target.value })
                      }
                    >
                      <option value="">Nivel / categoría (opcional)</option>
                      <option value="Curso">Curso</option>
                      <option value="Diplomado">Diplomado</option>
                      <option value="Pregrado">Pregrado</option>
                      <option value="Postgrado">Postgrado</option>
                      <option value="Maestría">Maestría</option>
                      <option value="Doctorado">Doctorado</option>
                      <option value="Otro">Otro</option>
                    </select>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                      <input
                        name="cert_fecha_emision[]"
                        type="date"
                        className="styled-input"
                        value={c.fechaEmision}
                        onChange={(e) =>
                          updateCert(idx, { fechaEmision: e.target.value })
                        }
                      />
                      <input
                        name="cert_fecha_expiracion[]"
                        type="date"
                        className="styled-input"
                        value={c.fechaExpiracion}
                        onChange={(e) =>
                          updateCert(idx, { fechaExpiracion: e.target.value })
                        }
                      />
                    </div>

                    <label className="text-xs font-bold text-gray-400 ml-1 uppercase mt-2 block">
                      Archivo PDF
                    </label>
                    <input
                      type="file"
                      name="cert_file[]"
                      accept="application/pdf"
                      className="styled-input cursor-pointer file:cursor-pointer"
                      onChange={(e) =>
                        updateCert(idx, { file: e.target.files?.[0] ?? null })
                      }
                    />
                  </div>
                ))}
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  className="btn-secondary flex-1 py-3 cursor-pointer"
                  onClick={back}
                >
                  Atrás
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className={`btn-gold flex-1 py-3 ${pending ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                >
                  {pending ? "Creando cuenta..." : "Crear cuenta"}
                </button>
              </div>
            </>
          )}
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-gray-500">¿Ya tienes cuenta?</span>{" "}
          <a href="/login" className="text-[#bba955] font-bold hover:underline">
            Inicia sesión
          </a>
        </div>
      </div>

      {showTyC && (
        <TermsModal
          onAccept={() => {
            setAcceptedTyC(true);
            setShowTyC(false);
          }}
          onReject={() => {
            setAcceptedTyC(false);
            setShowTyC(false);
          }}
        />
      )}
    </div>
  );
}
