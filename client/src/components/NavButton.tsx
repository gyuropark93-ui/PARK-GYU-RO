import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  direction: "left" | "right";
  visible: boolean;
}

export function NavButton({ direction, visible, className, ...props }: NavButtonProps) {
  if (!visible) return null;

  return (
    <button
      className={cn(
        "group relative p-4 rounded-full glass-panel transition-all duration-300",
        "hover:bg-primary/10 hover:border-primary/50 hover:scale-110 active:scale-95",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none",
        className
      )}
      {...props}
    >
      <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      {direction === "left" ? (
        <ArrowLeft className="w-8 h-8 text-foreground group-hover:text-primary transition-colors" />
      ) : (
        <ArrowRight className="w-8 h-8 text-foreground group-hover:text-primary transition-colors" />
      )}
    </button>
  );
}
