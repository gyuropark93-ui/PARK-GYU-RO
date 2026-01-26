import { useState } from 'react';
import type { Project } from '@/lib/supabase';

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
}

export function ProjectCard({ project, onClick }: ProjectCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <button
      onClick={onClick}
      className="group relative w-full overflow-hidden rounded-xl bg-zinc-900/50 backdrop-blur-sm border border-white/5 transition-all duration-300 hover:border-white/20 hover:shadow-2xl hover:shadow-black/50 text-left active:scale-[0.98]"
      data-testid={`card-project-${project.id}`}
    >
      <div className="aspect-[16/9] w-full overflow-hidden relative">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-zinc-800 animate-pulse" />
        )}
        <img
          src={project.cover_url}
          alt={project.title}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="font-display text-lg font-semibold text-white drop-shadow-lg line-clamp-2">
            {project.title}
          </h3>
        </div>
      </div>
    </button>
  );
}
