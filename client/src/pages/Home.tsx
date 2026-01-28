import { useState, useRef, useEffect, useCallback } from "react";
import { NavButton } from "@/components/NavButton";
import { YearIndicator } from "@/components/YearIndicator";
import { YearProjectsPanel } from "@/components/YearProjectsPanel";
import { Preloader } from "@/components/Preloader";
import { getTransitionVideoPath } from "@/lib/browserDetect";
import { useLogVisit } from "@/hooks/use-visit";

const MIN_YEAR = 2023;
const MAX_YEAR = 2026;

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentYear, setCurrentYear] = useState(2026);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionType, setTransitionType] = useState<"forward" | "back" | null>(null);
  const [targetYear, setTargetYear] = useState<number | null>(null);
  const [showProjects, setShowProjects] = useState(false);
  const [videoReady, setVideoReady] = useState(false);

  const forwardVideoRef = useRef<HTMLVideoElement>(null);
  const backVideoRef = useRef<HTMLVideoElement>(null);
  const hasSwappedRef = useRef(false);
  const finalDestinationRef = useRef<number | null>(null);
  const logVisit = useLogVisit();

  useEffect(() => {
    logVisit.mutate({
      year: currentYear,
      timestamp: new Date().toISOString(),
    });
  }, []);

  const getActiveVideo = useCallback(() => {
    if (transitionType === "forward") return forwardVideoRef.current;
    if (transitionType === "back") return backVideoRef.current;
    return null;
  }, [transitionType]);

  const startSingleTransition = useCallback((fromYear: number, direction: "forward" | "back") => {
    const newTargetYear = direction === "forward" ? fromYear + 1 : fromYear - 1;
    const video = direction === "forward" ? forwardVideoRef.current : backVideoRef.current;

    if (!video) return false;

    hasSwappedRef.current = false;
    setTargetYear(newTargetYear);
    setTransitionType(direction);
    setIsTransitioning(true);
    setVideoReady(true);

    video.currentTime = 0;
    const playPromise = video.play();

    if (playPromise !== undefined) {
      playPromise.catch(() => {
        setCurrentYear(newTargetYear);
        logVisit.mutate({
          year: newTargetYear,
          timestamp: new Date().toISOString(),
        });
        setIsTransitioning(false);
        setTransitionType(null);
        setTargetYear(null);
        setVideoReady(false);
      });
    }

    return true;
  }, [logVisit]);

  const handleTransition = (direction: "forward" | "back") => {
    if (isTransitioning || showProjects) return;
    if (direction === "forward" && currentYear >= MAX_YEAR) return;
    if (direction === "back" && currentYear <= MIN_YEAR) return;

    const newTargetYear = direction === "forward" ? currentYear + 1 : currentYear - 1;
    finalDestinationRef.current = newTargetYear;
    startSingleTransition(currentYear, direction);
  };

  const handleYearClick = useCallback((clickedYear: number) => {
    if (isTransitioning || showProjects) return;
    if (clickedYear === currentYear) return;
    if (clickedYear < MIN_YEAR || clickedYear > MAX_YEAR) return;

    finalDestinationRef.current = clickedYear;
    const direction = clickedYear > currentYear ? "forward" : "back";
    startSingleTransition(currentYear, direction);
  }, [isTransitioning, showProjects, currentYear, startSingleTransition]);

  const handleTimeUpdate = useCallback(() => {
    const video = getActiveVideo();
    if (!video || hasSwappedRef.current || targetYear === null || !transitionType) return;

    const progress = video.currentTime / video.duration;
    const threshold = transitionType === "forward" ? 0.45 : 0.5;

    if (progress >= threshold) {
      hasSwappedRef.current = true;
      setCurrentYear(targetYear);
      logVisit.mutate({
        year: targetYear,
        timestamp: new Date().toISOString(),
      });
    }
  }, [getActiveVideo, targetYear, transitionType, logVisit]);

  const handleVideoEnd = useCallback(() => {
    const nextYear = targetYear ?? currentYear;
    
    if (!hasSwappedRef.current && targetYear !== null) {
      setCurrentYear(targetYear);
      logVisit.mutate({
        year: targetYear,
        timestamp: new Date().toISOString(),
      });
    }

    setIsTransitioning(false);
    setTransitionType(null);
    setTargetYear(null);
    setVideoReady(false);
    hasSwappedRef.current = false;

    const finalDest = finalDestinationRef.current;
    if (finalDest !== null && finalDest !== nextYear) {
      const direction = finalDest > nextYear ? "forward" : "back";
      setTimeout(() => {
        startSingleTransition(nextYear, direction);
      }, 50);
    } else {
      finalDestinationRef.current = null;
    }
  }, [targetYear, currentYear, logVisit, startSingleTransition]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black select-none">
      <div className="absolute inset-0 z-0">
        <img
          src={`/assets/idle_${currentYear}.png`}
          alt={`Subway platform ${currentYear}`}
          className="w-full h-full object-cover"
        />
      </div>

      <div
        className={`absolute inset-0 z-10 transition-opacity duration-100 ${
          isTransitioning && videoReady ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <video
          ref={forwardVideoRef}
          className={`absolute inset-0 w-full h-full object-cover ${
            transitionType === "forward" ? "block" : "hidden"
          }`}
          src={getTransitionVideoPath("forward")}
          onTimeUpdate={transitionType === "forward" ? handleTimeUpdate : undefined}
          onEnded={transitionType === "forward" ? handleVideoEnd : undefined}
          playsInline
          muted
          preload="auto"
        />
        <video
          ref={backVideoRef}
          className={`absolute inset-0 w-full h-full object-cover ${
            transitionType === "back" ? "block" : "hidden"
          }`}
          src={getTransitionVideoPath("back")}
          onTimeUpdate={transitionType === "back" ? handleTimeUpdate : undefined}
          onEnded={transitionType === "back" ? handleVideoEnd : undefined}
          playsInline
          muted
          preload="auto"
        />
      </div>

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

      <div className="absolute left-1/2 -translate-x-1/2 z-[25] bottom-32 md:bottom-36">
        <button
          onClick={() => !isTransitioning && setShowProjects(true)}
          disabled={isTransitioning}
          className="
            px-8 py-3 md:px-10 md:py-4
            bg-white/10 backdrop-blur-md
            border border-white/20
            rounded-full
            text-white font-semibold tracking-wider text-sm md:text-base
            shadow-[0_0_20px_rgba(255,255,255,0.15),inset_0_1px_0_rgba(255,255,255,0.2)]
            hover:bg-white/20 hover:shadow-[0_0_30px_rgba(255,255,255,0.25),inset_0_1px_0_rgba(255,255,255,0.3)]
            active:scale-95
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-white/40
            disabled:opacity-50 disabled:cursor-not-allowed
          "
          data-testid="button-view-projects"
        >
          VIEW PROJECTS
        </button>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
        <YearIndicator 
          currentYear={currentYear} 
          disabled={isTransitioning || showProjects}
          onYearClick={handleYearClick}
        />
      </div>

      {showProjects && (
        <YearProjectsPanel
          year={currentYear}
          onClose={() => setShowProjects(false)}
        />
      )}

      {isLoading && <Preloader onComplete={() => setIsLoading(false)} />}
    </div>
  );
}
