import type { Project } from '@/lib/supabase';

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
}

export function ProjectCard({ project, onClick }: ProjectCardProps) {
  return (
    <button
      onClick={onClick}
      className="group relative w-full overflow-hidden rounded-2xl bg-secondary/30 backdrop-blur-sm border border-white/5 transition-all duration-300 hover:scale-[1.02] hover:border-white/10 hover:shadow-xl hover:shadow-primary/10 text-left"
      data-testid={`card-project-${project.id}`}
    >
      <div className="aspect-video w-full overflow-hidden">
        <img
          src={project.cover_url}
          alt={project.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="p-4">
        <h3 className="font-display text-lg font-semibold text-foreground truncate">
          {project.title}
        </h3>
      </div>
    </button>
  );
}
