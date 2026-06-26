"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  Crown,
  Flame,
  LogOut,
  Settings,
  Sparkles,
  Trophy,
  UserPlus,
  Users,
  Copy,
  Check,
  ExternalLink,
  Camera,
  X,
} from "lucide-react";
import { useCourses } from "@/lib/store";
import { useLevel } from "@/lib/levels";
import { useStreak } from "@/lib/streak";
import { useAchievements } from "@/lib/achievements";
import { toast } from "sonner";

type Tab = "profil" | "amis" | "premium";

interface Friend {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  friend_code: string;
  added_at: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, status, update } = useSession();
  const { courses } = useCourses();
  const { totalXp, current: level, next: nextLvl, pct: levelPct } = useLevel();
  const { streak } = useStreak();
  const { unlockedCount, totalCount } = useAchievements();

  const [tab, setTab] = useState<Tab>("profil");
  const [profileData, setProfileData] = useState<any>(null);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendCode, setFriendCode] = useState("");
  const [addCode, setAddCode] = useState("");
  const [adding, setAdding] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [showAvatarInput, setShowAvatarInput] = useState(false);
  const [savingAvatar, setSavingAvatar] = useState(false);
  const [copied, setCopied] = useState(false);

  const isLoading = status === "loading";
  const isLoggedIn = status === "authenticated";
  const user = session?.user;
  const completed = courses.filter((c) => c.progress >= 100).length;

  // Charger les données profil
  useEffect(() => {
    if (!isLoggedIn) return;
    fetch("/api/profile/data").then(r => r.json()).then(d => {
      if (d.user) {
        setProfileData(d.user);
        setFriendCode(d.user.friend_code || "");
        setAvatarUrl(d.user.avatar || "");
      }
    }).catch(() => {});
    fetch("/api/friends/list").then(r => r.json()).then(d => {
      if (d.friends) setFriends(d.friends);
    }).catch(() => {});
  }, [isLoggedIn]);

  const handleAddFriend = async () => {
    if (!addCode.trim() || addCode.length < 6) {
      toast.error("Entre un code à 6 chiffres");
      return;
    }
    setAdding(true);
    try {
      const r = await fetch("/api/friends/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: addCode.trim() }),
      });
      const d = await r.json();
      if (d.error) {
        toast.error(d.error);
      } else {
        toast.success(`${d.friend.name} ajouté à tes amis !`);
        setAddCode("");
        // Recharger la liste
        const res = await fetch("/api/friends/list");
        const data = await res.json();
        if (data.friends) setFriends(data.friends);
      }
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setAdding(false);
    }
  };

  const handleSaveAvatar = async () => {
    if (!avatarUrl.trim()) {
      toast.error("Entre une URL d'image");
      return;
    }
    setSavingAvatar(true);
    try {
      const r = await fetch("/api/profile/avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatar: avatarUrl.trim() }),
      });
      const d = await r.json();
      if (d.success) {
        toast.success("Photo de profil mise à jour !");
        setShowAvatarInput(false);
        setProfileData((prev: any) => ({ ...prev, avatar: avatarUrl.trim() }));
      }
    } catch {
      toast.error("Erreur");
    } finally {
      setSavingAvatar(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(friendCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <main className="mx-auto flex min-h-screen max-w-lg items-center justify-center px-5">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--line)] border-t-[var(--clay)]" />
      </main>
    );
  }

  if (!isLoggedIn) {
    return (
      <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-5 text-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-[20px] border-2 border-[var(--line)] bg-[var(--surface)]">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="text-[var(--muted-ink)]">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
        <h1 className="mb-2 font-heading text-2xl font-extrabold text-[var(--ink)]">Connecte-toi</h1>
        <p className="mb-6 max-w-xs text-[14px] leading-relaxed text-[var(--muted-ink)]">Pour voir ton profil et suivre ta progression.</p>
        <Link href="/login" className="inline-flex items-center gap-2 rounded-[14px] bg-[var(--clay)] px-6 py-3 text-[15px] font-bold text-white shadow-[3px_3px_0_var(--ink)] transition-all active:translate-x-[3px] active:translate-y-[3px] active:shadow-none">Se connecter</Link>
        <button onClick={() => router.push("/")} className="mt-4 text-[13px] font-semibold text-[var(--muted-ink)] underline underline-offset-2">Retour à l'accueil</button>
      </main>
    );
  }

  const avatarSrc = profileData?.avatar || null;
  const initial = user?.name ? user.name.charAt(0).toUpperCase() : "?";

  return (
    <main className="mx-auto min-h-screen max-w-lg px-5 pt-4">
      {/* Header */}
      <div className="mb-4 flex items-center gap-3">
        <button onClick={() => router.back()} data-press className="flex h-10 w-10 items-center justify-center rounded-[12px] border-2 border-[var(--line)] bg-[var(--surface)] text-[var(--ink)]" aria-label="Retour">
          <ArrowLeft className="h-5 w-5" strokeWidth={2} />
        </button>
        <h1 className="font-heading text-xl font-extrabold text-[var(--ink)]">Profil</h1>
      </div>

      {/* Tabs */}
      <div className="mb-5 flex gap-1 rounded-[14px] border-2 border-[var(--line)] bg-[var(--surface)] p-1">
        {[
          { id: "profil" as Tab, label: "Profil", icon: null },
          { id: "amis" as Tab, label: "Amis", icon: Users },
          { id: "premium" as Tab, label: "Premium", icon: Crown },
        ].map((t) => {
          const active = tab === t.id;
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              data-press
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-[10px] py-2 text-[13px] font-bold transition-all ${
                active ? "bg-[var(--clay)] text-white shadow-sm" : "text-[var(--muted-ink)] hover:text-[var(--ink)]"
              }`}
            >
              {Icon && <Icon className="h-4 w-4" strokeWidth={2.4} />}
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Onglet Profil */}
      {tab === "profil" && (
        <>
          {/* Carte utilisateur */}
          <div className="mb-5 overflow-hidden rounded-[22px] border-2 border-[var(--line)] bg-[var(--surface)] shadow-[4px_4px_0_var(--ink)]">
            <div className="px-5 pb-5 pt-8 text-center" style={{ background: "linear-gradient(180deg, #CC6B43 0%, #D98A5A 100%)" }}>
              <div className="relative mb-3 inline-block">
                {avatarSrc ? (
                  <img src={avatarSrc} alt="Avatar" className="h-20 w-20 rounded-full border-4 border-white/60 object-cover shadow-lg" />
                ) : (
                  <span className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white/60 bg-[var(--clay)] text-[28px] font-bold text-white shadow-lg">
                    {initial}
                  </span>
                )}
                <button
                  onClick={() => setShowAvatarInput(!showAvatarInput)}
                  data-press
                  className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[var(--surface)] text-[var(--muted-ink)] shadow-sm hover:text-[var(--clay)]"
                  title="Changer la photo"
                >
                  <Camera className="h-4 w-4" strokeWidth={2} />
                </button>
              </div>
              {showAvatarInput && (
                <div className="mb-3 animate-cb-fade">
                  <div className="flex gap-2">
                    <input
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="https://exemple.com/avatar.jpg"
                      className="flex-1 rounded-[10px] border-2 border-[var(--line)] bg-white/90 px-3 py-2 text-[12px] text-[var(--ink)] outline-none placeholder:text-[var(--muted)]"
                    />
                    <button
                      onClick={handleSaveAvatar}
                      disabled={savingAvatar}
                      data-press
                      className="rounded-[10px] bg-[var(--clay)] px-3 py-2 text-[12px] font-bold text-white disabled:opacity-50"
                    >
                      {savingAvatar ? "..." : "OK"}
                    </button>
                  </div>
                </div>
              )}
              <h2 className="text-[20px] font-extrabold text-white">{user?.name || "Utilisateur"}</h2>
              <p className="text-[13px] text-white/80">{user?.email}</p>
            </div>
            <div className="grid grid-cols-3 divide-x divide-[var(--line)]">
              {[
                { label: "Niveau", value: `${level.level}`, icon: level.icon },
                { label: "XP", value: totalXp, icon: "⭐" },
                { label: "Série", value: `${streak}j`, icon: "🔥" },
              ].map((stat) => (
                <div key={stat.label} className="flex flex-col items-center gap-0.5 py-3.5">
                  <span className="text-lg leading-none">{stat.icon}</span>
                  <span className="font-heading text-[18px] font-extrabold text-[var(--ink)]">{stat.value}</span>
                  <span className="text-[10.5px] font-semibold text-[var(--muted-ink)]">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Code ami */}
          {friendCode && (
            <div className="mb-5 rounded-[16px] border-2 border-[var(--line)] bg-[var(--surface)] p-4">
              <div className="mb-2 text-[12px] font-semibold text-[var(--muted-ink)]">TON CODE AMI</div>
              <div className="flex items-center gap-2">
                <span className="font-heading text-[28px] font-extrabold tracking-[4px] text-[var(--clay)]">{friendCode}</span>
                <button
                  onClick={copyCode}
                  data-press
                  className="flex h-9 w-9 items-center justify-center rounded-[10px] border-2 border-[var(--line)] text-[var(--muted-ink)] hover:text-[var(--clay)]"
                  title="Copier le code"
                >
                  {copied ? <Check className="h-4 w-4 text-[var(--sage)]" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
              <p className="mt-1 text-[11px] text-[var(--muted-ink)]">Partage ce code pour que tes amis puissent t'ajouter</p>
            </div>
          )}

          {/* Progression niveau */}
          <div className="mb-5 rounded-[18px] border-2 border-[var(--line)] bg-[var(--surface)] p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[13px] font-bold text-[var(--ink)]">{level.icon} Niveau {level.level} — {level.title}</span>
              <span className="text-[12px] font-semibold text-[var(--muted-ink)]">{totalXp} XP</span>
            </div>
            <div className="relative h-3 w-full overflow-hidden rounded-full bg-[var(--surface-2)]">
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${levelPct}%`, background: "var(--clay)" }} />
            </div>
            {nextLvl && (
              <p className="mt-1.5 text-[11px] text-[var(--muted-ink)]">Prochain niveau : {nextLvl.icon} {nextLvl.title} ({nextLvl.minXp - totalXp} XP restants)</p>
            )}
          </div>

          {/* Stats */}
          <div className="mb-5 grid grid-cols-2 gap-3">
            {[
              { label: "Cours", value: courses.length, icon: BookOpen, color: "var(--clay)", bg: "rgba(204,107,67,.12)" },
              { label: "Complétés", value: completed, icon: Trophy, color: "var(--sage)", bg: "rgba(78,139,87,.12)" },
              { label: "XP totales", value: totalXp, icon: Sparkles, color: "var(--gold)", bg: "rgba(229,165,44,.12)" },
              { label: "Jours de suite", value: streak, icon: Flame, color: "var(--petrol)", bg: "rgba(43,108,104,.12)" },
            ].map((s) => (
              <div key={s.label} className="rounded-[16px] border-2 border-[var(--line)] bg-[var(--surface)] p-4">
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-[12px]" style={{ background: s.bg }}>
                  <s.icon className="h-5 w-5" style={{ color: s.color }} strokeWidth={2} />
                </div>
                <div className="font-heading text-[22px] font-extrabold text-[var(--ink)]">{s.value}</div>
                <div className="text-[12px] font-semibold text-[var(--muted-ink)]">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Succès */}
          <div className="mb-5 rounded-[16px] border-2 border-[var(--line)] bg-[var(--surface)] p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">🏆</span>
                <div>
                  <div className="text-[14px] font-bold text-[var(--ink)]">Succès</div>
                  <div className="text-[12px] text-[var(--muted-ink)]">{unlockedCount} / {totalCount} débloqués</div>
                </div>
              </div>
              <Link href="/" className="text-[12px] font-semibold text-[var(--clay)]">Voir →</Link>
            </div>
          </div>

          {/* Actions */}
          <div className="mb-8 flex flex-col gap-2">
            <Link href="/settings" className="flex items-center gap-3 rounded-[16px] border-2 border-[var(--line)] bg-[var(--surface)] px-4 py-3.5 text-[14px] font-semibold text-[var(--ink)] transition-all active:scale-[0.98]">
              <Settings className="h-5 w-5 text-[var(--muted-ink)]" strokeWidth={2} />
              Réglages
            </Link>
            <button
              onClick={async () => {
                const { signOut } = await import("next-auth/react");
                await signOut({ callbackUrl: "/" });
              }}
              className="flex items-center gap-3 rounded-[16px] border-2 border-[var(--crimson)] bg-[var(--surface)] px-4 py-3.5 text-[14px] font-semibold text-[var(--crimson)] transition-all active:scale-[0.98]"
            >
              <LogOut className="h-5 w-5" strokeWidth={2} />
              Se déconnecter
            </button>
          </div>
        </>
      )}

      {/* Onglet Amis */}
      {tab === "amis" && (
        <div className="animate-cb-fade">
          {/* Ajouter un ami */}
          <div className="mb-5 rounded-[18px] border-2 border-[var(--line)] bg-[var(--surface)] p-4">
            <h2 className="mb-3 flex items-center gap-2 text-[15px] font-bold text-[var(--ink)]">
              <UserPlus className="h-5 w-5 text-[var(--clay)]" strokeWidth={2} />
              Ajouter un ami
            </h2>
            <div className="flex gap-2">
              <input
                value={addCode}
                onChange={(e) => setAddCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="Code à 6 chiffres"
                maxLength={6}
                className="flex-1 rounded-[12px] border-2 border-[var(--line)] bg-[var(--surface-2)] px-4 py-3 text-center font-heading text-[20px] font-extrabold tracking-[6px] text-[var(--clay)] outline-none placeholder:text-[var(--muted)] placeholder:tracking-normal placeholder:font-normal"
              />
              <button
                onClick={handleAddFriend}
                disabled={adding || addCode.length < 6}
                data-press
                className="rounded-[12px] bg-[var(--clay)] px-4 py-3 text-[13px] font-bold text-white disabled:opacity-50"
              >
                {adding ? "..." : "Ajouter"}
              </button>
            </div>
          </div>

          {/* Mon code */}
          {friendCode && (
            <div className="mb-5 rounded-[16px] border-2 border-[var(--line)] bg-[var(--surface)] p-4">
              <div className="text-[12px] font-semibold text-[var(--muted-ink)] mb-1">TON CODE AMI</div>
              <div className="flex items-center gap-2">
                <span className="font-heading text-[24px] font-extrabold tracking-[4px] text-[var(--clay)]">{friendCode}</span>
                <button onClick={copyCode} data-press className="flex h-8 w-8 items-center justify-center rounded-[8px] border-2 border-[var(--line)] text-[var(--muted-ink)] hover:text-[var(--clay)]" title="Copier">
                  {copied ? <Check className="h-3.5 w-3.5 text-[var(--sage)]" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
          )}

          {/* Liste d'amis */}
          <div className="rounded-[18px] border-2 border-[var(--line)] bg-[var(--surface)] p-4">
            <h2 className="mb-3 flex items-center gap-2 text-[15px] font-bold text-[var(--ink)]">
              <Users className="h-5 w-5 text-[var(--clay)]" strokeWidth={2} />
              Mes amis ({friends.length})
            </h2>
            {friends.length === 0 ? (
              <div className="py-6 text-center">
                <div className="mb-2 text-3xl">👥</div>
                <p className="text-[13px] text-[var(--muted-ink)]">Aucun ami pour le moment</p>
                <p className="text-[12px] text-[var(--muted-ink)]">Ajoute des amis avec leur code !</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {friends.map((f) => (
                  <div key={f.id} className="flex items-center gap-3 rounded-[12px] border border-[var(--line)] px-3 py-2.5">
                    {f.avatar ? (
                      <img src={f.avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
                    ) : (
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--clay)] text-[14px] font-bold text-white">
                        {f.name ? f.name.charAt(0).toUpperCase() : "?"}
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[14px] font-bold text-[var(--ink)]">{f.name || "Inconnu"}</div>
                      <div className="truncate text-[11px] text-[var(--muted-ink)]">{f.email}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Onglet Premium */}
      {tab === "premium" && (
        <div className="animate-cb-fade">
          <div className="mb-5 overflow-hidden rounded-[22px] border-2 border-[var(--gold)] bg-[var(--surface)] shadow-[4px_4px_0_var(--gold)]">
            <div className="px-5 py-6 text-center" style={{ background: "linear-gradient(135deg, #E5A52C 0%, #F5C542 50%, #E5A52C 100%)" }}>
              <Crown className="mx-auto mb-2 h-10 w-10 text-white" strokeWidth={2} fill="white" />
              <h2 className="font-heading text-[22px] font-extrabold text-white">Cerebra Premium</h2>
              <p className="text-[13px] text-white/80">Débloque toutes les fonctionnalités</p>
            </div>
            <div className="p-5">
              <div className="mb-4 space-y-3">
                {[
                  { icon: "🤖", title: "IA illimitée", desc: "Plus de limite de génération de résumés, flashcards et quiz" },
                  { icon: "📊", title: "Statistiques avancées", desc: "Graphiques détaillés, courbes de progression, analyse de tes points faibles" },
                  { icon: "🎯", title: "Mode examen", desc: "Simulations d'examen chronométrées avec correction IA" },
                  { icon: "📱", title: "Synchronisation cloud", desc: "Tes cours sur tous tes appareils, sauvegarde automatique" },
                  { icon: "🏆", title: "Défis entre amis", desc: "Compare ta progression avec tes amis et défie-les" },
                  { icon: "🎨", title: "Thèmes premium", desc: "Accède à des thèmes exclusifs et personnalise ton app" },
                ].map((f) => (
                  <div key={f.title} className="flex items-start gap-3">
                    <span className="mt-0.5 text-xl">{f.icon}</span>
                    <div>
                      <div className="text-[14px] font-bold text-[var(--ink)]">{f.title}</div>
                      <div className="text-[12px] text-[var(--muted-ink)]">{f.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="rounded-[16px] border-2 border-[var(--gold)] bg-[rgba(229,165,44,.08)] p-4 text-center">
                <div className="font-heading text-[32px] font-extrabold text-[var(--gold)]">9.99 CHF</div>
                <div className="text-[12px] font-semibold text-[var(--muted-ink)]">par mois · résilie quand tu veux</div>
                <button
                  data-press
                  className="mt-4 w-full rounded-[14px] bg-[var(--gold)] px-4 py-3 text-[15px] font-bold text-white shadow-[3px_3px_0_rgba(229,165,44,.4)] transition-all active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
                  onClick={() => toast.info("Paiement pas encore disponible — bientôt !")}
                >
                  Passer à Premium
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
