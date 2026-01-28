import { useState, useRef, useEffect, useCallback } from "react";
import { NavButton } from "@/components/NavButton";
import { YearIndicator } from "@/components/YearIndicator";
import { YearProjectsPanel } from "@/components/YearProjectsPanel";
import { Preloader } from "@/components/Preloader";
import { getTransitionVideoPath } from "@/lib/browserDetect";
import { useLogVisit } from "@/hooks/use-visit";

const MIN_YEAR = 2023;
const MAX_YEAR = 2026;

type TransitionMode = "step" | "jump";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeYear, setActiveYear] = useState(2026);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionType, setTransitionType] = useState<"forward" | "back" | null>(null);
  const [pendingYear, setPendingYear] = useState<number | null>(null);
  const [showProjects, setShowProjects] = useState(false);
  const [videoReady, setVideoReady] = useState(false);

  const forwardVideoRef = useRef<HTMLVideoElement>(null);
  const backVideoRef = useRef<HTMLVideoElement>(null);
  const transitionModeRef = useRef<TransitionMode>("step");
  const logVisit = useLogVisit();

  useEffect(() => {
    logVisit.mutate({
      year: activeYear,
      timestamp: new Date().toISOString(),
    });
  }, []);

  const getActiveVideo = useCallback(() => {
    if (transitionType === "forward") return forwardVideoRef.current;
    if (transitionType === "back") return backVideoRef.current;
    return null;
  }, [transitionType]);

  const startTransition = useCallback((
    from: number,
    to: number,
    mode: TransitionMode
  ) => {
    if (isTransitioning || showProjects) return;
    if (to < MIN_YEAR || to > MAX_YEAR) return;
    if (to === from) return;

    const direction = to > from ? "forward" : "back";
    const video = direction === "forward" ? forwardVideoRef.current : backVideoRef.current;

    if (!video) return;

    transitionModeRef.current = mode;
    setPendingYear(to);
    setTransitionType(direction);
    setIsTransitioning(true);
    setVideoReady(true);

    video.currentTime = 0;
    const playPromise = video.play();

    if (playPromise !== undefined) {
      playPromise.catch(() => {
        setActiveYear(to);
        logVisit.mutate({
          year: to,
          timestamp: new Date().toISOString(),
        });
        setIsTransitioning(false);
        setTransitionType(null);
        setPendingYear(null);
        setVideoReady(false);
      });
    }
  }, [isTransitioning, showProjects, logVisit]);

  const handleTransition = (direction: "forward" | "back") => {
    if (isTransitioning || showProjects) return;
    if (direction === "forward" && activeYear >= MAX_YEAR) return;
    if (direction === "back" && activeYear <= MIN_YEAR) return;

    const targetYear = direction === "forward" ? activeYear + 1 : activeYear - 1;
    startTransition(activeYear, targetYear, "step");
  };

  const handleYearClick = useCallback((clickedYear: number) => {
    if (isTransitioning || showProjects) return;
    if (clickedYear === activeYear) return;

    startTransition(activeYear, clickedYear, "jump");
  }, [isTransitioning, showProjects, activeYear, startTransition]);

  const handleTimeUpdate = useCallback(() => {
    const video = getActiveVideo();
    if (!video || pendingYear === null || !transitionType) return;

    if (transitionModeRef.current === "step") {
      const progress = video.currentTime / video.duration;
      const threshold = transitionType === "forward" ? 0.45 : 0.5;

      if (progress >= threshold && activeYear !== pendingYear) {
        setActiveYear(pendingYear);
        logVisit.mutate({
          year: pendingYear,
          timestamp: new Date().toISOString(),
        });
      }
    }
  }, [getActiveVideo, pendingYear, transitionType, activeYear, logVisit]);

  const handleVideoEnd = useCallback(() => {
    if (pendingYear !== null && activeYear !== pendingYear) {
      setActiveYear(pendingYear);
      logVisit.mutate({
        year: pendingYear,
        timestamp: new Date().toISOString(),
      });
    }

    setIsTransitioning(false);
    setTransitionType(null);
    setPendingYear(null);
    setVideoReady(false);
    transitionModeRef.current = "step";
  }, [pendingYear, activeYear, logVisit]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black select-none">
      <div className="absolute inset-0 z-0">
        <img
          src={`/assets/idle_${activeYear}.png`}
          alt={`Subway platform ${activeYear}`}
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
            visible={activeYear > MIN_YEAR}
            disabled={isTransitioning || showProjects}
            onClick={() => handleTransition("back")}
          />
        </div>

        <div className="pointer-events-auto">
          <NavButton
            direction="right"
            visible={activeYear < MAX_YEAR}
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
          currentYear={activeYear} 
          disabled={isTransitioning || showProjects}
          onYearClick={handleYearClick}
        />
      </div>

      {showProjects && (
        <YearProjectsPanel
          year={activeYear}
          onClose={() => setShowProjects(false)}
        />
      )}

      {isLoading && <Preloader onComplete={() => setIsLoading(false)} />}
    </div>
  );
}
