import { X, Loader2, AlertCircle } from "lucide-react";
import { useProjectBlocks } from "@/hooks/use-projects";
import type {
  Project,
  ProjectBlock,
  ImageBlockData,
  TextBlockData,
  VideoBlockData,
  GridBlockData,
} from "@/lib/supabase";
import { toEmbedUrl, getAspectRatioClass } from "@/lib/videoEmbed";
import { TipTapRenderer } from "@/components/TipTapEditor";

interface ProjectModalProps {
  project: Project;
  onClose: () => void;
}

function ImageBlock({ data }: { data: ImageBlockData }) {
  return (
    <div className="w-full">
      <img src={data.url} alt="" className="w-full h-auto object-cover" />
    </div>
  );
}

function TextBlock({ data }: { data: TextBlockData }) {
  if (data.json && typeof data.json === "object") {
    return (
      <div className="px-6 py-4 max-w-3xl mx-auto">
        <TipTapRenderer content={data.json} />
      </div>
    );
  }
  return (
    <div className="px-6 py-4 max-w-3xl mx-auto">
      <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
        {data.markdown}
      </p>
    </div>
  );
}

function VideoBlock({ data }: { data: VideoBlockData }) {
  const rawUrl = data.originalUrl || data.embedUrl || "";
  const result = toEmbedUrl(rawUrl);
  const safeEmbedUrl = result.embedUrl || data.embedUrl;
  const aspectClass = getAspectRatioClass(data.aspect);

  if (!safeEmbedUrl) {
    return (
      <div className="aspect-video w-full bg-zinc-800 flex items-center justify-center gap-2 text-zinc-400">
        <AlertCircle className="w-5 h-5" />
        <span>Video link invalid. Please update in admin.</span>
      </div>
    );
  }

  return (
    <div className={`${aspectClass} w-full bg-black`}>
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
  );
}

function GridBlock({ data }: { data: GridBlockData }) {
  const cols =
    data.urls.length <= 2 ? data.urls.length : data.urls.length <= 4 ? 2 : 3;
  return (
    <div
      className={`grid gap-2 grid-cols-${cols}`}
      style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
    >
      {data.urls.map((url, idx) => (
        <img
          key={idx}
          src={url}
          alt=""
          className="w-full h-auto object-cover"
        />
      ))}
    </div>
  );
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
    default:
      return null;
  }
}

export function ProjectModal({ project, onClose }: ProjectModalProps) {
  const { data: blocks, isLoading } = useProjectBlocks(project.id);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      <div
        className="relative z-10 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl glass-panel custom-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
          data-testid="button-close-modal"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        <div className="aspect-video w-full overflow-hidden rounded-t-2xl">
          <img
            src={project.cover_url || ""}
            alt={project.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="p-6">
          <h2 className="font-display text-3xl font-bold text-foreground mb-6">
            {project.title}
          </h2>

          {isLoading && (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          )}

          {blocks && blocks.length > 0 && (
            <div className="space-y-6">
              {blocks.map((block) => (
                <BlockRenderer key={block.id} block={block} />
              ))}
            </div>
          )}

          {blocks && blocks.length === 0 && !isLoading && (
            <p className="text-muted-foreground text-center py-4">
              No content blocks yet
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
