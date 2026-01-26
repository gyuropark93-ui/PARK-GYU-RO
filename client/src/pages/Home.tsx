import { useState, useRef, useEffect } from "react";
import { NavButton } from "@/components/NavButton";
import { YearIndicator } from "@/components/YearIndicator";
import { useLogVisit } from "@/hooks/use-visit";
import { useToast } from "@/hooks/use-toast";

const MIN_YEAR = 2023;
const MAX_YEAR = 2026;

export default function Home() {
  const [currentYear, setCurrentYear] = useState(2026);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionType, setTransitionType] = useState<"forward" | "back" | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();
  const logVisit = useLogVisit();

  // Log visit on mount
  useEffect(() => {
    logVisit.mutate({
      year: currentYear,
      timestamp: new Date().toISOString()
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTransition = (direction: "forward" | "back") => {
    if (isTransitioning) return;

    // Validate bounds logic again just in case
    if (direction === "forward" && currentYear >= MAX_YEAR) return;
    if (direction === "back" && currentYear <= MIN_YEAR) return;

    setIsTransitioning(true);
    setTransitionType(direction);
  };

  // Handle video playback when transition starts
  useEffect(() => {
    if (isTransitioning && videoRef.current) {
      videoRef.current.currentTime = 0;
      const playPromise = videoRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.error("Video play failed:", error);
          // Fallback if video fails
          handleVideoEnd();
        });
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTransitioning, transitionType]);

  const handleVideoEnd = () => {
    // 1. Update year
    setCurrentYear((prev) => {
      const next = transitionType === "forward" ? prev + 1 : prev - 1;
      // Log the new year visit
      logVisit.mutate({
        year: next,
        timestamp: new Date().toISOString()
      });
      return next;
    });

    // 2. Reset transition state
    setIsTransitioning(false);
    setTransitionType(null);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black select-none">
      
      {/* 1. Background Layer (Z-0) - Always visible, never unmounted */}
      <div className="absolute inset-0 z-0">
        <img
          src={`/assets/idle_${currentYear}.png`}
          alt={`Subway platform ${currentYear}`}
          className="w-full h-full object-cover transition-opacity duration-300"
        />
      </div>

      {/* 2. UI Layer (Z-10) */}
      <div className="absolute inset-0 z-10 flex flex-col justify-between p-8 md:p-12 pointer-events-none">
        
        {/* Top Header */}
        <div className="w-full flex justify-between items-start">
          <div className="glass-panel px-6 py-2 rounded-lg pointer-events-auto">
            <h1 className="font-display text-2xl font-bold tracking-wider text-primary text-glow">
              METRO CHRONOS
            </h1>
            <p className="text-xs text-muted-foreground uppercase tracking-[0.2em]">Temporal Transit System</p>
          </div>
          
          <YearIndicator 
            currentYear={currentYear} 
            className="pointer-events-auto hidden md:flex" 
          />
        </div>

        {/* Navigation Buttons (Centered Vertically) */}
        <div className="absolute inset-0 flex items-center justify-between px-4 md:px-12 pointer-events-none">
          <div className="pointer-events-auto">
            <NavButton
              direction="left"
              visible={currentYear > MIN_YEAR}
              disabled={isTransitioning}
              onClick={() => handleTransition("back")}
            />
          </div>
          
          <div className="pointer-events-auto">
            <NavButton
              direction="right"
              visible={currentYear < MAX_YEAR}
              disabled={isTransitioning}
              onClick={() => handleTransition("forward")}
            />
          </div>
        </div>

        {/* Bottom Status / Mobile Indicator */}
        <div className="w-full flex justify-center pb-8 md:hidden pointer-events-auto">
          <YearIndicator currentYear={currentYear} />
        </div>
      </div>

      {/* 3. Video Overlay Layer (Z-20) - Transparent overlay on top of idle background */}
      {isTransitioning && transitionType && (
        <div className="fixed inset-0 z-20 pointer-events-none">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            src={`/assets/transition_${transitionType}.webm`}
            onEnded={handleVideoEnd}
            playsInline
            muted
          />
        </div>
      )}
    </div>
  );
}
