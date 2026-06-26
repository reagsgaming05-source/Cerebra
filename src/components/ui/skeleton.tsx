import { cn } from "@/lib/utils";

/** Bloc de chargement (skeleton). `className` contrôle la taille/forme. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("animate-pulse rounded-md bg-muted/60", className)}
    />
  );
}