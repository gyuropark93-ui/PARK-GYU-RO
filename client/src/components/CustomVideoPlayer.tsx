import { useState, useRef, useEffect, useCallback } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize } from "lucide-react";

interface CustomVideoPlayerProps {
  src: string;
  className?: string;
}

export function CustomVideoPlayer({ src, className = "" }: CustomVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);
  
  const hideControlsTimeoutRef = useRef<number | null>(null);

  const clearHideTimeout = useCallback(() => {
    if (hideControlsTimeoutRef.current) {
      window.clearTimeout(hideControlsTimeoutRef.current);
      hideControlsTimeoutRef.current = null;
    }
  }, []);

  const scheduleHideControls = useCallback(() => {
    clearHideTimeout();
    if (isPlaying) {
      hideControlsTimeoutRef.current = window.setTimeout(() => {
        setShowControls(false);
      }, 2500);
    }
  }, [isPlaying, clearHideTimeout]);

  const handlePlayPause = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setIsPlaying(true);
      setHasStarted(true);
      scheduleHideControls();
    } else {
      video.pause();
      setIsPlaying(false);
      setShowControls(true);
      clearHideTimeout();
    }
  }, [scheduleHideControls, clearHideTimeout]);

  const handleMuteToggle = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  }, []);

  const handleFullscreen = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      container.requestFullscreen();
    }
  }, []);

  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const percent = (video.currentTime / video.duration) * 100;
    setProgress(isNaN(percent) ? 0 : percent);
  }, []);

  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    const progressBar = progressRef.current;
    if (!video || !progressBar) return;

    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percent = clickX / rect.width;
    video.currentTime = percent * video.duration;
  }, []);

  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    scheduleHideControls();
  }, [scheduleHideControls]);

  const handleMouseLeave = useCallback(() => {
    if (isPlaying) {
      scheduleHideControls();
    }
  }, [isPlaying, scheduleHideControls]);

  const handleVideoEnd = useCallback(() => {
    setIsPlaying(false);
    setShowControls(true);
    clearHideTimeout();
  }, [clearHideTimeout]);

  useEffect(() => {
    return () => clearHideTimeout();
  }, [clearHideTimeout]);

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden rounded-lg bg-black group ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <video
        ref={videoRef}
        src={src}
        className="w-full h-auto"
        playsInline
        muted={isMuted}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleVideoEnd}
        onClick={handlePlayPause}
      />

      {!hasStarted && (
        <div 
          className="absolute inset-0 flex items-center justify-center cursor-pointer"
          onClick={handlePlayPause}
        >
          <button
            className="
              w-16 h-16 md:w-20 md:h-20
              flex items-center justify-center
              rounded-full
              bg-white/10 backdrop-blur-md
              border border-white/20
              shadow-[0_0_20px_rgba(255,255,255,0.15),inset_0_1px_0_rgba(255,255,255,0.2)]
              hover:bg-white/20 hover:shadow-[0_0_30px_rgba(255,255,255,0.25)]
              transition-all duration-200
            "
            data-testid="button-video-play-overlay"
          >
            <Play className="w-8 h-8 md:w-10 md:h-10 text-white ml-1" />
          </button>
        </div>
      )}

      {hasStarted && (
        <div 
          className={`
            absolute bottom-0 left-0 right-0 p-3
            bg-white/10 backdrop-blur-md
            border-t border-white/20
            transition-opacity duration-300
            ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}
          `}
        >
          <div 
            ref={progressRef}
            className="w-full h-1 bg-white/20 rounded-full cursor-pointer mb-3 group/progress"
            onClick={handleProgressClick}
          >
            <div 
              className="h-full bg-white/80 rounded-full relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity" />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePlayPause}
                className="
                  p-2 rounded-full
                  hover:bg-white/20
                  transition-colors
                "
                data-testid="button-video-play-pause"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 text-white" />
                ) : (
                  <Play className="w-5 h-5 text-white ml-0.5" />
                )}
              </button>

              <button
                onClick={handleMuteToggle}
                className="
                  p-2 rounded-full
                  hover:bg-white/20
                  transition-colors
                "
                data-testid="button-video-mute"
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5 text-white" />
                ) : (
                  <Volume2 className="w-5 h-5 text-white" />
                )}
              </button>
            </div>

            <button
              onClick={handleFullscreen}
              className="
                p-2 rounded-full
                hover:bg-white/20
                transition-colors
              "
              data-testid="button-video-fullscreen"
            >
              <Maximize className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function AutoplayVideo({ src, className = "" }: { src: string; className?: string }) {
  return (
    <video
      src={src}
      className={`w-full h-auto rounded-lg ${className}`}
      autoPlay
      loop
      muted
      playsInline
    />
  );
}
