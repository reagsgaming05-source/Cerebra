"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useTheme } from "@/components/theme-provider";
import { Brain, LogIn, LogOut, Moon, Settings, Sparkles, Sun, User } from "lucide-react";
import { useCourses } from "@/lib/store";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function AppHeader() {
  const { courses, ready } = useCourses();
  const totalXp = courses.reduce((s, c) => s + c.xp, 0);
  const { resolvedTheme, setTheme } = useTheme();
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="group flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm transition-transform group-hover:scale-105">
            <Brain className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <div className="text-lg font-bold tracking-tight">Cerebra</div>
            <div className="text-[11px] text-muted-foreground -mt-0.5">
              Étudie avec ton cours
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          {session?.user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu((v) => !v)}
                className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[var(--clay)] bg-[var(--clay)] text-white text-xs font-bold hover:opacity-90"
                title={session.user.name ?? session.user.email ?? ""}
              >
                {session.user.name ? session.user.name.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
              </button>
              {showUserMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                  <div className="absolute right-0 top-11 z-50 w-52 overflow-hidden rounded-[16px] border-2 border-[var(--line)] bg-[var(--surface)] shadow-[4px_4px_0_var(--ink)]">
                    <div className="border-b border-[var(--line)] px-4 py-3">
                      <div className="text-[14px] font-bold truncate">{session.user.name || "Utilisateur"}</div>
                      <div className="text-[11px] text-[var(--muted-ink)] truncate">{session.user.email}</div>
                    </div>
                    <Link href="/settings" onClick={() => setShowUserMenu(false)} className="flex items-center gap-2.5 border-b border-[var(--line)] px-4 py-3 text-[13px] font-semibold hover:bg-[var(--surface-2)]">
                      <Settings className="h-4 w-4" /> Réglages
                    </Link>
                    <button onClick={async () => { setShowUserMenu(false); const { signOut } = await import("next-auth/react"); await signOut({ callbackUrl: "/" }); }} className="flex w-full items-center gap-2.5 px-4 py-3 text-[13px] font-semibold text-[var(--crimson)] hover:bg-[var(--surface-2)]">
                      <LogOut className="h-4 w-4" /> Se déconnecter
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link href="/login" className="flex h-9 w-9 items-center justify-center rounded-[10px] border-2 border-[var(--line)] bg-[var(--surface)] text-[var(--muted-ink)] hover:border-[var(--clay)]" title="Connexion">
              <LogIn className="h-4 w-4" />
            </Link>
          )}
          {ready && totalXp > 0 && (
            <div className="flex items-center gap-1.5 rounded-full bg-warning/15 px-3 py-1.5 text-sm font-semibold text-warning-foreground">
              <Sparkles className="h-4 w-4 text-gold" />
              {totalXp} XP
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            aria-label="Réglages"
            title="Réglages"
            className="h-9 w-9"
            render={<Link href="/settings" />}
          >
            <Settings className="h-4 w-4" />
          </Button>
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              aria-label="Basculer le thème"
              title="Basculer le thème"
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              className="h-9 w-9"
            >
              {resolvedTheme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}