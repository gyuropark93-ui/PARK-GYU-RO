import { X } from 'lucide-react';
import type { Project } from '@/lib/supabase';

interface ProjectModalProps {
  project: Project;
  onClose: () => void;
}

export function ProjectModal({ project, onClose }: ProjectModalProps) {
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      
      <div 
        className="relative z-10 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl glass-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
          data-testid="button-close-modal"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        {project.video_url ? (
          <div className="aspect-video w-full bg-black rounded-t-2xl overflow-hidden">
            <iframe
              src={project.video_url}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="aspect-video w-full overflow-hidden rounded-t-2xl">
            <img
              src={project.thumbnail_url}
              alt={project.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-6">
          <h2 className="font-display text-3xl font-bold text-foreground mb-4">
            {project.title}
          </h2>
          <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
            {project.description}
          </p>
        </div>
      </div>
    </div>
  );
}
