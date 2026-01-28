import { cn } from "@/lib/utils";

interface YearIndicatorProps {
  currentYear: number;
  disabled?: boolean;
  onYearClick?: (year: number) => void;
  className?: string;
}

export function YearIndicator({ 
  currentYear, 
  disabled = false,
  onYearClick, 
  className 
}: YearIndicatorProps) {
  const years = [2023, 2024, 2025, 2026];

  const handleClick = (year: number) => {
    if (disabled || year === currentYear || !onYearClick) return;
    onYearClick(year);
  };

  return (
    <div className={cn("flex items-center gap-6 glass-panel px-8 py-3 rounded-full", className)}>
      {years.map((year) => {
        const isActive = year === currentYear;
        const isClickable = !disabled && !isActive && !!onYearClick;
        
        return (
          <button
            key={year}
            onClick={() => handleClick(year)}
            disabled={disabled || isActive}
            className={cn(
              "relative transition-all duration-500 font-display font-bold text-lg",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded",
              isActive 
                ? "text-primary scale-125 text-glow cursor-default" 
                : "text-muted-foreground/50 scale-100",
              isClickable && "hover:text-primary/80 hover:scale-110 cursor-pointer",
              disabled && !isActive && "opacity-50 cursor-not-allowed"
            )}
            data-testid={`button-year-${year}`}
          >
            {year}
            {isActive && (
              <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
            )}
          </button>
        );
      })}
    </div>
  );
}
