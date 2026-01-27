import { useState, useEffect, useCallback } from "react";
import { X, Loader2, ArrowLeft, AlertCircle } from "lucide-react";
import { useProjectsByYear, useProjectBlocks } from "@/hooks/use-projects";
import { ProjectCard } from "./ProjectCard";
import type {
  Project,
  ProjectBlock,
  ImageBlockData,
  TextBlockData,
  VideoBlockData,
  GridBlockData,
  DividerBlockData,
  SpacerBlockData,
} from "@/lib/supabase";
import { toEmbedUrl, getAspectRatioClass } from "@/lib/videoEmbed";
import { useEditor, EditorContent } from "@tiptap/react";
import { getSharedExtensions } from "@/lib/tiptapExtensions";

interface YearProjectsPanelProps {
  year: number;
  onClose: () => void;
}

function ImageBlock({ data }: { data: ImageBlockData }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="w-full relative">
      {!loaded && (
        <div className="aspect-video bg-zinc-800 animate-pulse rounded-lg" />
      )}
      <img
        src={data.url}
        alt=""
        loading="lazy"
        onLoad={() => setLoaded(true)}
        className={`w-full h-auto object-cover rounded-lg transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0 absolute inset-0"}`}
      />
    </div>
  );
}

function TextBlock({ data }: { data: TextBlockData }) {
  const editor = useEditor({
    extensions: getSharedExtensions(false),
    content: data.json || {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: data.markdown || "" }],
        },
      ],
    },
    editable: false,
  });

  useEffect(() => {
    if (editor && data.json) {
      editor.commands.setContent(data.json);
    }
  }, [data.json, editor]);

  if (!editor) {
    return (
      <div className="max-w-3xl mx-auto px-4 md:px-0">
        <p className="text-zinc-300 whitespace-pre-wrap leading-relaxed text-base md:text-lg">
          {data.markdown || ""}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-0 prose prose-invert prose-zinc max-w-none tiptap-content">
      <EditorContent editor={editor} />
    </div>
  );
}

function VideoBlock({
  data,
  isHero = false,
}: {
  data: VideoBlockData;
  isHero?: boolean;
}) {
  const rawUrl = data.originalUrl || data.embedUrl || "";
  const result = toEmbedUrl(rawUrl);
  const safeEmbedUrl = result.embedUrl || data.embedUrl;
  const aspectClass = getAspectRatioClass(data.aspect);

  if (!safeEmbedUrl) {
    return (
      <div
        className={`w-full ${isHero ? "" : "max-w-4xl mx-auto px-4 md:px-0"}`}
      >
        <div className="aspect-video w-full bg-zinc-800 rounded-lg flex items-center justify-center gap-2 text-zinc-400">
          <AlertCircle className="w-5 h-5" />
          <span>Video link invalid. Please update in admin.</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full ${isHero ? "" : "max-w-4xl mx-auto px-4 md:px-0"}`}>
      <div
        className={`${aspectClass} w-full bg-black rounded-lg overflow-hidden`}
      >
        <iframe
          src={safeEmbedUrl}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
          title="Embedded video"
        />
      </div>
    </div>
  );
}

function GridBlock({ data }: { data: GridBlockData }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 px-4 md:px-0">
      {data.urls.map((url, idx) => (
        <div
          key={idx}
          className="relative aspect-square overflow-hidden rounded-lg"
        >
          <img
            src={url}
            alt=""
            loading="lazy"
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      ))}
    </div>
  );
}

function DividerBlock({ data }: { data: DividerBlockData }) {
  return (
    <div className="max-w-3xl mx-auto px-4 md:px-0 py-4">
      <hr
        className="border-zinc-700"
        style={{
          borderStyle: data.style || "solid",
          borderWidth: `${data.thickness || 1}px 0 0 0`,
          opacity: data.opacity ?? 0.5,
        }}
      />
    </div>
  );
}

function SpacerBlock({ data }: { data: SpacerBlockData }) {
  return <div style={{ height: `${data.height || 48}px` }} />;
}

function BlockRenderer({ block }: { block: ProjectBlock }) {
  switch (block.type) {
    case "image":
      return <ImageBlock data={block.data as ImageBlockData} />;
    case "text":
      return <TextBlock data={block.data as TextBlockData} />;
    case "video":
      return <VideoBlock data={block.data as VideoBlockData} />;
    case "grid":
      return <GridBlock data={block.data as GridBlockData} />;
    case "divider":
      return <DividerBlock data={block.data as DividerBlockData} />;
    case "spacer":
      return <SpacerBlock data={block.data as SpacerBlockData} />;
    default:
      return null;
  }
}

function ProjectDetailView({
  project,
  onBack,
}: {
  project: Project;
  onBack: () => void;
}) {
  const { data: blocks, isLoading } = useProjectBlocks(project.id);

  const sortedBlocks = blocks
    ? [...blocks].sort((a, b) => a.sort_order - b.sort_order)
    : [];
  const firstVideoBlock = sortedBlocks.find((b) => b.type === "video");
  const hasHeroVideo = !!firstVideoBlock;

  return (
    <div className="flex flex-col h-full animate-slide-in-right">
      <div className="sticky top-0 z-20 flex items-center justify-between px-4 md:px-6 py-4 bg-zinc-900/95 backdrop-blur-md border-b border-white/10 pt-[8px] pb-[8px]">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors group"
          data-testid="button-back-to-projects"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium uppercase tracking-wide">
            Back to Projects
          </span>
        </button>
        <h2 className="hidden md:block font-display font-semibold text-white truncate max-w-md mt-[10px] mb-[10px] text-[40px] pt-[10px] pb-[10px]">
          {project.title}
        </h2>
        <div className="w-20" />
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {hasHeroVideo ? (
          <div className="w-full">
            <VideoBlock data={firstVideoBlock!.data as VideoBlockData} isHero />
          </div>
        ) : (
          <div className="w-full aspect-[21/9] relative overflow-hidden">
            <img
              src={project.cover_url || ""}
              alt={project.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent" />
          </div>
        )}

        <div className="px-4 md:px-8 py-8 max-w-5xl mx-auto">
          {isLoading && (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
            </div>
          )}

          {sortedBlocks.length > 0 && (
            <div className="space-y-8">
              {sortedBlocks
                .filter(
                  (block) =>
                    !(hasHeroVideo && block.id === firstVideoBlock?.id),
                )
                .map((block) => (
                  <BlockRenderer key={block.id} block={block} />
                ))}
            </div>
          )}

          {!isLoading && sortedBlocks.length === 0 && (
            <p className="text-zinc-500 text-center py-8">
              No content available for this project yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export function YearProjectsPanel({ year, onClose }: YearProjectsPanelProps) {
  const { data: projects, isLoading, error } = useProjectsByYear(year);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 200);
  }, [onClose]);

  const handleBack = useCallback(() => {
    setIsTransitioning(true);
    setTimeout(() => {
      setSelectedProject(null);
      setIsTransitioning(false);
    }, 150);
  }, []);

  const handleSelectProject = useCallback((project: Project) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setSelectedProject(project);
      setIsTransitioning(false);
    }, 150);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (selectedProject) {
          handleBack();
        } else {
          handleClose();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedProject, handleBack, handleClose]);

  return (
    <div
      className={`fixed inset-0 z-40 flex items-center justify-center transition-opacity duration-200 ${
        isClosing ? "opacity-0" : "opacity-100"
      }`}
    >
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={handleClose}
        data-testid="overlay-backdrop"
      />

      <div
        className={`relative z-10 w-full h-full md:w-[95vw] md:h-[90vh] md:max-w-7xl overflow-hidden md:rounded-2xl bg-zinc-900/95 border border-white/10 shadow-2xl transition-all duration-200 ${
          isClosing ? "scale-95 opacity-0" : "scale-100 opacity-100"
        } ${isTransitioning ? "opacity-50" : "opacity-100"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-30 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
          data-testid="button-close-panel"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        {selectedProject ? (
          <ProjectDetailView project={selectedProject} onBack={handleBack} />
        ) : (
          <div className="flex flex-col h-full animate-fade-in">
            <div className="sticky top-0 z-10 px-4 md:px-6 py-6 border-b border-white/10 bg-zinc-900/95 backdrop-blur-md">
              <h2 className="font-display text-2xl md:text-3xl font-bold text-white">
                {year} Projects
              </h2>
              <p className="text-sm text-zinc-400 mt-1">
                {projects?.length || 0} projects
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
              {isLoading && (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
                </div>
              )}

              {error && (
                <div className="text-center py-20">
                  <p className="text-red-400">Failed to load projects</p>
                </div>
              )}

              {!isLoading && !error && projects?.length === 0 && (
                <div className="text-center py-20">
                  <p className="text-zinc-500">No projects for {year} yet</p>
                </div>
              )}

              {projects && projects.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  {projects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      onClick={() => handleSelectProject(project)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
