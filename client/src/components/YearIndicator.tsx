import { cn } from "@/lib/utils";

interface YearIndicatorProps {
  currentYear: number;
  className?: string;
}

export function YearIndicator({ currentYear, className }: YearIndicatorProps) {
  const years = [2023, 2024, 2025, 2026];

  return (
    <div className={cn("flex items-center gap-6 glass-panel px-8 py-3 rounded-full", className)}>
      {years.map((year) => (
        <div
          key={year}
          className={cn(
            "relative transition-all duration-500 font-display font-bold text-lg",
            year === currentYear 
              ? "text-primary scale-125 text-glow" 
              : "text-muted-foreground/50 scale-100"
          )}
        >
          {year}
          {year === currentYear && (
            <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
          )}
        </div>
      ))}
    </div>
  );
}
