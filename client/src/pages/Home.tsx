import { useState, useRef, useEffect } from "react";
import { NavButton } from "@/components/NavButton";
import { YearIndicator } from "@/components/YearIndicator";
import { YearProjectsPanel } from "@/components/YearProjectsPanel";
import { useLogVisit } from "@/hooks/use-visit";

const MIN_YEAR = 2023;
const MAX_YEAR = 2026;

export default function Home() {
  const [currentYear, setCurrentYear] = useState(2026);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionType, setTransitionType] = useState<"forward" | "back" | null>(null);
  const [targetYear, setTargetYear] = useState<number | null>(null);
  const [showProjects, setShowProjects] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const hasSwappedRef = useRef(false);
  const logVisit = useLogVisit();

  useEffect(() => {
    logVisit.mutate({
      year: currentYear,
      timestamp: new Date().toISOString()
    });
  }, []);

  const handleTransition = (direction: "forward" | "back") => {
    if (isTransitioning || showProjects) return;

    if (direction === "forward" && currentYear >= MAX_YEAR) return;
    if (direction === "back" && currentYear <= MIN_YEAR) return;

    const newTargetYear = direction === "forward" ? currentYear + 1 : currentYear - 1;
    
    hasSwappedRef.current = false;
    setTargetYear(newTargetYear);
    setIsTransitioning(true);
    setTransitionType(direction);
  };

  useEffect(() => {
    if (isTransitioning && videoRef.current && transitionType) {
      videoRef.current.currentTime = 0;
      const playPromise = videoRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.error("Video play failed:", error);
          if (targetYear !== null) {
            setCurrentYear(targetYear);
            logVisit.mutate({
              year: targetYear,
              timestamp: new Date().toISOString()
            });
          }
          setIsTransitioning(false);
          setTransitionType(null);
          setTargetYear(null);
        });
      }
    }
  }, [isTransitioning, transitionType]);

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || hasSwappedRef.current || targetYear === null || !transitionType) return;

    const progress = video.currentTime / video.duration;
    const threshold = transitionType === "forward" ? 0.45 : 0.5;
    
    if (progress >= threshold) {
      hasSwappedRef.current = true;
      setCurrentYear(targetYear);
      logVisit.mutate({
        year: targetYear,
        timestamp: new Date().toISOString()
      });
    }
  };

  const handleVideoEnd = () => {
    if (!hasSwappedRef.current && targetYear !== null) {
      setCurrentYear(targetYear);
      logVisit.mutate({
        year: targetYear,
        timestamp: new Date().toISOString()
      });
    }

    setIsTransitioning(false);
    setTransitionType(null);
    setTargetYear(null);
    hasSwappedRef.current = false;
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black select-none">
      
      {/* Background Layer (z-0) - Always visible */}
      <div className="absolute inset-0 z-0">
        <img
          src={`/assets/idle_${currentYear}.png`}
          alt={`Subway platform ${currentYear}`}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Video Overlay Layer (z-10) - Alpha transparent overlay */}
      {isTransitioning && transitionType && (
        <div className="absolute inset-0 z-10">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            src={`/assets/transition_${transitionType}.webm`}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleVideoEnd}
            playsInline
            muted
          />
        </div>
      )}

      {/* Navigation Layer (z-20) - Always on top */}
      <div className="absolute inset-0 z-20 flex items-center justify-between px-4 md:px-12 pointer-events-none">
        <div className="pointer-events-auto">
          <NavButton
            direction="left"
            visible={currentYear > MIN_YEAR}
            disabled={isTransitioning || showProjects}
            onClick={() => handleTransition("back")}
          />
        </div>
        
        <div className="pointer-events-auto">
          <NavButton
            direction="right"
            visible={currentYear < MAX_YEAR}
            disabled={isTransitioning || showProjects}
            onClick={() => handleTransition("forward")}
          />
        </div>
      </div>

      {/* Year Indicator (z-30) - Clickable to open projects */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30">
        <button
          onClick={() => !isTransitioning && setShowProjects(true)}
          disabled={isTransitioning}
          className="focus:outline-none focus:ring-2 focus:ring-primary/50 rounded-full transition-transform hover:scale-105 active:scale-95"
          data-testid="button-view-projects"
        >
          <YearIndicator currentYear={currentYear} />
        </button>
        <p className="text-center text-xs text-muted-foreground mt-2 opacity-70">
          Click to view projects
        </p>
      </div>

      {/* Year Projects Panel */}
      {showProjects && (
        <YearProjectsPanel
          year={currentYear}
          onClose={() => setShowProjects(false)}
        />
      )}
    </div>
  );
}
