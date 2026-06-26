"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { signIn } from "next-auth/react";

/* ------------------------------------------------------------------ */
/*  Icônes (lucide-react déjà disponible, mais on garde des SVG inline */
/*  pour coller exactement à la maquette — œil, œil barré, cercle !).  */
/* ------------------------------------------------------------------ */

function EyeOpen() {
  return (
    <svg
      width={19}
      height={19}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
      <circle cx={12} cy={12} r={3} />
    </svg>
  );
}

function EyeOff() {
  return (
    <svg
      width={19}
      height={19}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 2l20 20M10.6 10.6a3 3 0 0 0 4.2 4.2M9.4 5.2A9.5 9.5 0 0 1 12 5c6.5 0 10 7 10 7a16 16 0 0 1-3.1 3.9M6.1 6.1A16 16 0 0 0 2 12s3.5 7 10 7a9.6 9.6 0 0 0 3.1-.5" />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg
      width={15}
      height={15}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx={12} cy={12} r={9} />
      <path d="M12 8v4M12 16h.01" />
    </svg>
  );
}

function CerebraMark() {
  return (
    <svg
      width={17}
      height={17}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.1}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 18V8a3 3 0 0 1 6 0M5 12a5 5 0 0 1 5-5M19 12a5 5 0 0 0-5-5M7.5 20h9" />
    </svg>
  );
}

function GoogleLogo() {
  return (
    <svg width={19} height={19} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.65l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.43 14.97.5 12 .5A11 11 0 0 0 2.18 7.05l3.66 2.84C6.71 7.29 9.14 4.75 12 4.75z"
      />
    </svg>
  );
}

function AppleLogo() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor">
      <path d="M16.37 12.78c.03 3.2 2.8 4.27 2.83 4.28-.02.07-.44 1.52-1.46 3.01-.88 1.3-1.8 2.58-3.24 2.61-1.42.03-1.87-.84-3.49-.84-1.62 0-2.12.81-3.46.87-1.39.05-2.45-1.4-3.34-2.69-1.82-2.64-3.22-7.46-1.35-10.72.93-1.62 2.59-2.64 4.39-2.67 1.37-.03 2.66.92 3.49.92.83 0 2.4-1.14 4.05-.97.69.03 2.63.28 3.87 2.1-.1.06-2.31 1.35-2.29 4.02M13.78 3.5c.74-.9 1.23-2.14 1.1-3.38-1.06.04-2.35.71-3.11 1.6-.69.79-1.29 2.06-1.13 3.27 1.18.09 2.39-.6 3.14-1.49" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Page Connexion                                                     */
/* ------------------------------------------------------------------ */

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [needsTotp, setNeedsTotp] = useState(false);
  const [totpCode, setTotpCode] = useState("");

  const isLogin = mode === "login";

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const emailOk = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim());
    if (!emailOk) { setError("Entre une adresse e-mail valide."); return; }
    if (password.length < 6) { setError("Le mot de passe doit faire 6 caractères au moins."); return; }
    if (!isLogin && !name.trim()) { setError("Indique ton prénom."); return; }
    setError("");
    setLoading(true);
    try {
      if (isLogin) {
        const result = await signIn("credentials", { email: email.trim(), password, redirect: false });
        if (result?.error === "TOTP_REQUIRED") {
          setNeedsTotp(true);
          toast.info("Code 2FA requis");
          return;
        }
        if (result?.error) { setError("Email ou mot de passe incorrect."); return; }
        if (result?.ok) { toast.success("Bienvenue !"); router.push("/"); router.refresh(); }
      } else {
        const res = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim(), password, name: name.trim() }),
        });
        const data = await res.json();
        if (!res.ok) { setError(data.error); return; }
        // Auto-login après inscription
        const loginResult = await signIn("credentials", { email: email.trim(), password, redirect: false });
        if (loginResult?.ok) { toast.success("Compte créé — bienvenue !"); router.push("/"); router.refresh(); }
      }
    } catch (e) {
      setError((e as Error).message);
    } finally { setLoading(false); }
  };

  const forgot = () => toast.success("Lien de réinitialisation envoyé");
  const social = async (provider: "google" | "apple") => {
    setLoading(true);
    try { await signIn(provider, { callbackUrl: "/" }); }
    catch { setLoading(false); }
  };

  const toggleMode = () => {
    setMode((m) => (m === "login" ? "signup" : "login"));
    setError("");
  };

  const heading = isLogin ? "Content de\nte revoir." : "Crée ton\ncompte.";
  const subhead = isLogin
    ? "Reprends tes révisions là où tu les as laissées."
    : "Transforme tes cours en révisions, en quelques secondes.";
  const kickerLabel = isLogin ? "CONNEXION" : "INSCRIPTION";
  const submitLabel = isLogin ? "Se connecter" : "Créer mon compte";
  const switchPrompt = isLogin ? "Pas encore de compte ?" : "Déjà inscrit ?";
  const switchAction = isLogin ? "S'inscrire" : "Se connecter";

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center px-4 py-10 cb-grain"
      style={{
        background:
          "radial-gradient(120% 90% at 50% 0%, #ECE2D0 0%, #DED2BC 70%, #D3C6AE 100%)",
        fontFamily: "var(--font-hanken), sans-serif",
        color: "var(--ink)",
      }}
    >
      <div
        className="animate-cb-float w-full max-w-md"
        style={{
          background:
            "linear-gradient(168deg, var(--surface), var(--bg) 52%)",
          borderRadius: 28,
          padding: "32px 30px 36px",
          position: "relative",
          zIndex: 20,
        }}
      >
        {/* brand -> /landing */}
        <Link
          href="/landing"
          data-press
          className="inline-flex items-center gap-2.5 pt-1.5"
          style={{ textDecoration: "none", color: "var(--ink)" }}
        >
          <span
            className="cb-tile"
            style={{
              width: 30,
              height: 30,
              borderRadius: 9,
              background: "var(--clay)",
              color: "#FBF6EC",
              transform: "none",
            }}
          >
            <CerebraMark />
          </span>
          <span
            className="font-heading"
            style={{ fontWeight: 800, fontSize: 19, letterSpacing: "-0.5px" }}
          >
            Cerebra
          </span>
        </Link>

        {/* heading */}
        <div style={{ paddingTop: 46 }}>
          <div
            className="cb-mono"
            style={{
              fontSize: 10,
              fontWeight: 500,
              letterSpacing: "2.5px",
              color: "var(--clay)",
              marginBottom: 18,
            }}
          >
            {kickerLabel}
          </div>
          <h1
            className="font-heading"
            style={{
              margin: 0,
              fontWeight: 800,
              fontSize: 38,
              lineHeight: 1.02,
              letterSpacing: "-1.4px",
              whiteSpace: "pre-line",
            }}
          >
            {heading}
          </h1>
          <p
            style={{
              margin: "18px 0 0",
              color: "var(--muted)",
              fontSize: 16,
              lineHeight: 1.5,
              maxWidth: 280,
            }}
          >
            {subhead}
          </p>
        </div>

        {/* form */}
        <form
          onSubmit={submit}
          style={{ paddingTop: 34, display: "flex", flexDirection: "column", gap: 14 }}
        >
          {/* name (signup only) */}
          {!isLogin && (
            <label className="flex flex-col gap-[7px] animate-cb-fade">
              <span
                className="cb-mono"
                style={{
                  fontSize: "9.5px",
                  fontWeight: 500,
                  letterSpacing: "1.6px",
                  color: "var(--muted)",
                }}
              >
                PRÉNOM
              </span>
              <input
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError("");
                }}
                placeholder="Camille"
                style={inputStyle}
              />
            </label>
          )}

          {/* email */}
          <label className="flex flex-col gap-[7px]">
            <span
              className="cb-mono"
              style={{
                fontSize: "9.5px",
                fontWeight: 500,
                letterSpacing: "1.6px",
                color: "var(--muted)",
              }}
            >
              E-MAIL
            </span>
            <input
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              type="email"
              placeholder="toi@exemple.com"
              style={inputStyle}
            />
          </label>

          {/* password */}
          <label className="flex flex-col gap-[7px]">
            <span
              className="cb-mono"
              style={{
                fontSize: "9.5px",
                fontWeight: 500,
                letterSpacing: "1.6px",
                color: "var(--muted)",
              }}
            >
              MOT DE PASSE
            </span>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                border: "2px solid var(--line)",
                background: "var(--surface)",
                borderRadius: 13,
                padding: "0 13px 0 15px",
              }}
            >
              <input
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                type={showPw ? "text" : "password"}
                placeholder="••••••••"
                style={{
                  flex: 1,
                  minWidth: 0,
                  border: "none",
                  background: "transparent",
                  padding: "14px 0",
                  fontFamily: "inherit",
                  fontSize: "15.5px",
                  fontWeight: 600,
                  color: "var(--ink)",
                  outline: "none",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                aria-label="Afficher le mot de passe"
                data-press
                style={{
                  flex: "none",
                  width: 34,
                  height: 34,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "none",
                  background: "transparent",
                  color: "var(--muted)",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                {showPw ? <EyeOff /> : <EyeOpen />}
              </button>
            </div>
          </label>

          {/* 2FA code */}
          {needsTotp && (
            <label className="flex flex-col gap-[7px] animate-cb-fade">
              <span className="cb-mono" style={{ fontSize: "9.5px", fontWeight: 500, letterSpacing: "1.6px", color: "var(--muted)" }}>CODE 2FA</span>
              <input value={totpCode} onChange={(e) => { setTotpCode(e.target.value); setError(""); }} type="text" maxLength={6} placeholder="000000" style={{ ...inputStyle, fontFamily: "var(--font-dm-mono), monospace", fontSize: 22, letterSpacing: 8, textAlign: "center" }} autoFocus />
            </label>
          )}

          {/* forgot (login only) */}
          {isLogin && (
            <div className="flex justify-end" style={{ marginTop: -3 }}>
              <button
                type="button"
                onClick={forgot}
                data-press
                style={{
                  border: "none",
                  background: "transparent",
                  color: "var(--clay-deep)",
                  fontFamily: "inherit",
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer",
                  padding: "4px 0",
                }}
              >
                Mot de passe oublié ?
              </button>
            </div>
          )}

          {/* error */}
          {error && (
            <div
              className="flex items-center gap-[7px] animate-cb-fade"
              style={{
                color: "var(--crimson)",
                fontSize: 13,
                fontWeight: 600,
                marginTop: -2,
              }}
            >
              <ErrorIcon />
              <span>{error}</span>
            </div>
          )}

          {/* submit */}
          <button
            type="submit"
            data-press
            disabled={loading}
            style={{
              marginTop: 6,
              width: "100%",
              border: "2.5px solid var(--ink)",
              background: "var(--ink)",
              color: "var(--bg)",
              fontFamily: "var(--font-bricolage), sans-serif",
              fontWeight: 700,
              fontSize: 17,
              padding: 16,
              borderRadius: 16,
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: "4px 4px 0 var(--clay)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 9,
              opacity: loading ? 0.9 : 1,
            }}
          >
            {loading ? (
              <span
                className="animate-cb-spin"
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  border: "2.5px solid rgba(251,246,236,.35)",
                  borderTopColor: "#FBF6EC",
                  display: "inline-block",
                }}
              />
            ) : (
              <span>{submitLabel}</span>
            )}
          </button>
        </form>

        {/* divider */}
        <div
          className="flex items-center"
          style={{ gap: 14, padding: "26px 0 22px" }}
        >
          <div style={{ flex: 1, height: "1.5px", background: "var(--line)" }} />
          <span
            className="cb-mono"
            style={{
              fontSize: "9.5px",
              fontWeight: 500,
              letterSpacing: "1.6px",
              color: "var(--muted)",
            }}
          >
            OU
          </span>
          <div style={{ flex: 1, height: "1.5px", background: "var(--line)" }} />
        </div>

        {/* social */}
        <div className="flex flex-col" style={{ gap: 11 }}>
          <button
            type="button"
            onClick={() => social("google")}
            disabled={loading}
            data-press
            style={socialBtnStyle}
          >
            <GoogleLogo />
            <span>Continuer avec Google</span>
          </button>
          <button
            type="button"
            onClick={() => social("apple")}
            disabled={loading}
            data-press
            style={socialBtnStyle}
          >
            <AppleLogo />
            <span>Continuer avec Apple</span>
          </button>
        </div>

        {/* switch mode */}
        <div style={{ textAlign: "center", marginTop: 28 }}>
          <span
            style={{
              color: "var(--muted)",
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            {switchPrompt}{" "}
          </span>
          <button
            type="button"
            onClick={toggleMode}
            data-press
            style={{
              border: "none",
              background: "transparent",
              color: "var(--clay-deep)",
              fontFamily: "inherit",
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
              padding: 0,
              textDecoration: "underline",
              textUnderlineOffset: "3px",
            }}
          >
            {switchAction}
          </button>
        </div>

        {/* legal */}
        <p
          style={{
            textAlign: "center",
            margin: "22px 0 0",
            color: "var(--muted)",
            fontSize: "11.5px",
            lineHeight: 1.5,
            maxWidth: 260,
            alignSelf: "center",
          }}
        >
          En continuant, tu acceptes nos{" "}
          <span
            style={{
              color: "var(--ink-2)",
              textDecoration: "underline",
            }}
          >
            Conditions
          </span>{" "}
          et notre{" "}
          <span
            style={{
              color: "var(--ink-2)",
              textDecoration: "underline",
            }}
          >
            Politique de confidentialité
          </span>
          .
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Styles partagés                                                     */
/* ------------------------------------------------------------------ */

const inputStyle: React.CSSProperties = {
  width: "100%",
  border: "2px solid var(--line)",
  background: "var(--surface)",
  borderRadius: 13,
  padding: "14px 15px",
  fontFamily: "inherit",
  fontSize: "15.5px",
  fontWeight: 600,
  color: "var(--ink)",
  outline: "none",
};

const socialBtnStyle: React.CSSProperties = {
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 11,
  border: "2px solid var(--line)",
  background: "var(--surface)",
  color: "var(--ink)",
  fontFamily: "inherit",
  fontWeight: 700,
  fontSize: 15,
  padding: 14,
  borderRadius: 14,
  cursor: "pointer",
};