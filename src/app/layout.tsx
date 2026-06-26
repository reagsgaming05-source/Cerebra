import type { Metadata } from "next";
import { Bricolage_Grotesque, DM_Mono, Hanken_Grotesk } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { XpPopups } from "@/components/xp-popup";
import { PwaSetup } from "@/components/pwa-setup";
import { AuthProvider } from "@/components/auth-provider";
import { Taskbar } from "@/components/taskbar";
import { PomodoroFloating } from "@/components/pomodoro";

const hanken = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Cerebra — Étudie avec ton cours",
  description:
    "Transforme tes PowerPoint en résumés, flashcards, quiz et parcours d'apprentissage gamifié.",
  manifest: "/manifest.json",
  other: {
    "theme-color": "#2a221b",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${hanken.variable} ${bricolage.variable} ${dmMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background">
        <ThemeProvider>
          <TooltipProvider><AuthProvider>
            <div className="pb-[76px]">{children}</div>
            <Taskbar />
            <PomodoroFloating />
          </AuthProvider></TooltipProvider>
          <Toaster richColors position="top-center" />
          <XpPopups />
          <PwaSetup />
        </ThemeProvider>
      </body>
    </html>
  );
}