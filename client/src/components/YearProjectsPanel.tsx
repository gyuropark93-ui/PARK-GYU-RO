import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useProjectsByYear } from '@/hooks/use-projects';
import { ProjectCard } from './ProjectCard';
import { ProjectModal } from './ProjectModal';
import type { Project } from '@/lib/supabase';

interface YearProjectsPanelProps {
  year: number;
  onClose: () => void;
}

export function YearProjectsPanel({ year, onClose }: YearProjectsPanelProps) {
  const { data: projects, isLoading, error } = useProjectsByYear(year);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 md:p-8">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative z-10 w-full max-w-6xl max-h-[85vh] overflow-hidden rounded-2xl glass-panel animate-fade-in">
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-white/10 bg-background/80 backdrop-blur-md">
          <div>
            <h2 className="font-display text-3xl font-bold text-foreground">
              {year} Projects
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Browse projects from this year
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
            data-testid="button-close-panel"
          >
            <X className="w-6 h-6 text-muted-foreground" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(85vh-100px)]">
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}

          {error && (
            <div className="text-center py-20">
              <p className="text-destructive">Failed to load projects</p>
            </div>
          )}

          {!isLoading && !error && projects?.length === 0 && (
            <div className="text-center py-20">
              <p className="text-muted-foreground">No projects for {year} yet</p>
            </div>
          )}

          {projects && projects.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onClick={() => setSelectedProject(project)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </div>
  );
}
