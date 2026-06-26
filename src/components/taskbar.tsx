"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import {
  BookOpen,
  Home,
  LogIn,
  Settings,
  User,
} from "lucide-react";

const TABS = [
  { id: "home", label: "Accueil", href: "/", icon: Home },
  { id: "courses", label: "Cours", href: "/", icon: BookOpen },
  { id: "settings", label: "Réglages", href: "/settings", icon: Settings },
] as const;

export function Taskbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  useEffect(() => { setMenuOpen(false); }, [pathname]);

  if (pathname === "/login" || pathname === "/landing" || pathname === "/profile") return null;

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const isLoggedIn = status === "authenticated";
  const isLoading = status === "loading";
  const user = session?.user;

  return (
    <>
      {/* Menu non-connecté (au-dessus de la barre) */}
      {menuOpen && !isLoggedIn && (
        <div
          ref={menuRef}
          className="fixed bottom-24 left-1/2 z-[100] w-72 -translate-x-1/2 overflow-hidden rounded-[18px] border-2 border-[var(--line)] bg-[var(--surface)] shadow-[6px_6px_0_var(--ink)] animate-cb-fade"
        >
          <div className="px-5 py-5 text-center">
            <div className="mb-1.5 text-[16px] font-bold text-[var(--ink)]">
              Connecte-toi
            </div>
            <div className="mb-4 text-[13px] leading-relaxed text-[var(--muted-ink)]">
              Sauvegarde ta progression et accède à tes cours sur tous tes appareils.
            </div>
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-[14px] bg-[var(--clay)] px-4 py-3 text-[14px] font-bold text-white transition-all active:scale-[0.97]"
            >
              <LogIn className="h-[18px] w-[18px]" />
              Se connecter
            </Link>
          </div>
          <div className="border-t border-[var(--line)] bg-[var(--surface-2)] px-4 py-2.5 text-center">
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="text-[13px] font-semibold text-[var(--clay-deep)]"
            >
              Créer un compte →
            </Link>
          </div>
        </div>
      )}

      {/* Barre flottante */}
      <nav
        aria-label="Navigation principale"
        className="fixed inset-x-0 bottom-0 z-50 flex justify-center"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="mb-2 flex items-center gap-1 rounded-[24px] border-2 border-[var(--line)] bg-[var(--surface)] px-3 py-2 shadow-[0_4px_20px_rgba(34,28,23,.13)] sm:mb-3 sm:px-4 sm:py-2.5">
          {TABS.map((tab) => {
            const active = isActive(tab.href);
            const Icon = tab.icon;
            return (
              <Link
                key={tab.id}
                href={tab.href}
                data-press
                className="flex flex-col items-center gap-0.5 rounded-[14px] px-4 py-1.5 transition-all active:scale-90 sm:px-5"
                style={{ color: active ? "var(--clay)" : "var(--muted-ink)" }}
              >
                <Icon
                  className="h-[22px] w-[22px] sm:h-[24px] sm:w-[24px]"
                  strokeWidth={active ? 2.6 : 1.9}
                />
                <span className="text-[10.5px] font-bold leading-tight sm:text-[11px]">
                  {tab.label}
                </span>
              </Link>
            );
          })}

          <div className="mx-1 h-8 w-[2px] rounded-full bg-[var(--line)] sm:mx-2" />

          {/* Profil */}
          <div ref={menuRef}>
            {isLoggedIn ? (
              <Link
                href="/profile"
                data-press
                className="flex flex-col items-center gap-0.5 rounded-[14px] px-4 py-1.5 transition-all active:scale-90 sm:px-5"
                style={{ color: pathname === "/profile" ? "var(--clay)" : "var(--muted-ink)" }}
              >
                {isLoading ? (
                  <span className="h-[22px] w-[22px] animate-spin rounded-full border-2 border-[var(--line)] border-t-[var(--clay)] sm:h-[24px] sm:w-[24px]" />
                ) : user?.name ? (
                  <span className="flex h-[24px] w-[24px] items-center justify-center rounded-full bg-[var(--clay)] text-[11px] font-bold text-white sm:h-[26px] sm:w-[26px] sm:text-[12px]">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                ) : (
                  <User className="h-[22px] w-[22px] sm:h-[24px] sm:w-[24px]" strokeWidth={1.9} />
                )}
                <span className="text-[10.5px] font-bold leading-tight sm:text-[11px]">
                  Profil
                </span>
              </Link>
            ) : (
              <button
                onClick={() => setMenuOpen((v) => !v)}
                data-press
                disabled={isLoading}
                className="flex flex-col items-center gap-0.5 rounded-[14px] px-4 py-1.5 transition-all active:scale-90 sm:px-5"
                style={{ color: menuOpen ? "var(--clay)" : "var(--muted-ink)" }}
                aria-label="Connexion"
                aria-haspopup="true"
                aria-expanded={menuOpen}
              >
                {isLoading ? (
                  <span className="h-[22px] w-[22px] animate-spin rounded-full border-2 border-[var(--line)] border-t-[var(--clay)] sm:h-[24px] sm:w-[24px]" />
                ) : (
                  <User className="h-[22px] w-[22px] sm:h-[24px] sm:w-[24px]" strokeWidth={1.9} />
                )}
                <span className="text-[10.5px] font-bold leading-tight sm:text-[11px]">
                  Connexion
                </span>
              </button>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}
