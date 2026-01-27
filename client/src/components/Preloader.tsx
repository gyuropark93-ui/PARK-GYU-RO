import { useState, useEffect, useCallback } from "react";
import { isSafari, getTransitionVideoPath } from "@/lib/browserDetect";

interface PreloaderProps {
  onComplete: () => void;
}

const MIN_DISPLAY_MS = 400;

const YEARS = [2023, 2024, 2025, 2026];

export function Preloader({ onComplete }: PreloaderProps) {
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  const preloadAssets = useCallback(async () => {
    const startTime = Date.now();
    const safari = isSafari();

    const transitionVideo = getTransitionVideoPath("forward");

    const yearImages = YEARS.map((year) => `/assets/idle_${year}.png`);

    const assets: string[] = [transitionVideo, ...yearImages];
    const total = assets.length;
    let loaded = 0;

    const updateProgress = () => {
      loaded++;
      setProgress(Math.round((loaded / total) * 100));
    };

    const loadImage = (src: string): Promise<void> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          updateProgress();
          resolve();
        };
        img.onerror = () => {
          updateProgress();
          resolve();
        };
        img.src = src;
      });
    };

    const loadVideo = (src: string): Promise<void> => {
      return new Promise((resolve) => {
        const video = document.createElement("video");
        video.preload = "auto";
        video.muted = true;
        video.playsInline = true;

        const handleLoaded = () => {
          updateProgress();
          resolve();
        };

        video.oncanplaythrough = handleLoaded;
        video.onerror = handleLoaded;

        video.src = src;
        video.load();
      });
    };

    const loadPromises = assets.map((asset) => {
      if (asset.endsWith(".webm") || asset.endsWith(".mov")) {
        return loadVideo(asset);
      }
      return loadImage(asset);
    });

    await Promise.all(loadPromises);

    const elapsed = Date.now() - startTime;
    const remaining = MIN_DISPLAY_MS - elapsed;

    if (remaining > 0) {
      await new Promise((r) => setTimeout(r, remaining));
    }

    setFadeOut(true);
    await new Promise((r) => setTimeout(r, 400));
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    preloadAssets();
  }, [preloadAssets]);

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-zinc-950 transition-opacity duration-400 ${fadeOut ? "opacity-0" : "opacity-100"}`}
      data-testid="preloader"
    >
      <div className="w-64 flex flex-col items-center gap-4">
        <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-white transition-all duration-200 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-white/60 text-sm font-mono">{progress}%</span>
      </div>
    </div>
  );
}
