import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useRoute } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import {
  useProjects,
  useProject,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
  useReorderProjects,
  useProjectBlocks,
  useCreateBlock,
  useUpdateBlock,
  useDeleteBlock,
  useReorderBlocks,
  uploadImage,
} from "@/hooks/use-projects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  Pencil,
  Trash2,
  LogOut,
  Plus,
  ArrowLeft,
  Image,
  Type,
  Video,
  Grid3X3,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Save,
  X,
  Minus,
  Square,
  Copy,
  Play,
  AlertCircle,
} from "lucide-react";
import type {
  Project,
  ProjectBlock,
  BlockType,
  ImageBlockData,
  TextBlockData,
  VideoBlockData,
  GridBlockData,
  DividerBlockData,
  SpacerBlockData,
} from "@/lib/supabase";
import { toEmbedUrl, getAspectRatioClass } from "@/lib/videoEmbed";
import { TipTapEditor } from "@/components/TipTapEditor";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  useDroppable,
  DragOverlay,
  rectIntersection,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function LoginForm({
  onLogin,
}: {
  onLogin: (email: string, password: string) => Promise<void>;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await onLogin(email, password);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
      <div className="w-full max-w-md bg-zinc-900 rounded-2xl border border-zinc-800 p-8">
        <h1 className="font-display text-2xl text-center text-white mb-6">
          Admin Login
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-zinc-800 border-zinc-700 text-white"
            data-testid="input-email"
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="bg-zinc-800 border-zinc-700 text-white"
            data-testid="input-password"
          />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <Button
            type="submit"
            className="w-full"
            disabled={loading}
            data-testid="button-login"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign In"}
          </Button>
        </form>
      </div>
    </div>
  );
}

function SortableProjectCard({
  project,
  onEdit,
  onDelete,
  isDeleting,
}: {
  project: Project;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: project.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden hover:border-zinc-700 transition-colors"
    >
      <div className="aspect-video relative overflow-hidden bg-zinc-800">
        {project.cover_url ? (
          <img
            src={project.cover_url}
            alt={project.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-600">
            <Image className="w-8 h-8" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <div
            {...attributes}
            {...listeners}
            className="absolute top-2 left-2 cursor-grab active:cursor-grabbing p-2 rounded bg-zinc-800/80 hover:bg-zinc-700 transition-colors"
            data-testid={`drag-handle-project-${project.id}`}
          >
            <GripVertical className="w-4 h-4 text-zinc-300" />
          </div>
          <Button
            size="sm"
            variant="secondary"
            onClick={onEdit}
            data-testid={`button-edit-${project.id}`}
          >
            <Pencil className="w-4 h-4 mr-1" />
            Edit
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={onDelete}
            disabled={isDeleting}
            data-testid={`button-delete-${project.id}`}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-medium text-white truncate">{project.title}</h3>
        <p className="text-sm text-zinc-500">{project.year}</p>
      </div>
    </div>
  );
}

function DroppableYearGroup({
  year,
  children,
  isOver,
}: {
  year: number;
  children: React.ReactNode;
  isOver: boolean;
}) {
  const { setNodeRef } = useDroppable({ id: `year-${year}` });

  return (
    <div
      ref={setNodeRef}
      className={`mb-10 p-4 -mx-4 rounded-xl transition-colors ${isOver ? "bg-blue-500/10 ring-2 ring-blue-500/50" : ""}`}
    >
      <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <span className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-sm">
          {year}
        </span>
        {year}
      </h2>
      {children}
    </div>
  );
}

function ProjectList() {
  const [, navigate] = useLocation();
  const { data: projects, isLoading } = useProjects();
  const deleteProject = useDeleteProject();
  const createProject = useCreateProject();
  const reorderProjects = useReorderProjects();
  const { signOut, user } = useAuth();
  const { toast } = useToast();
  
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overYearId, setOverYearId] = useState<string | null>(null);
  const [localProjects, setLocalProjects] = useState<Project[]>([]);
  
  useEffect(() => {
    if (projects) {
      setLocalProjects(projects);
    }
  }, [projects]);
  
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const allYears = [2026, 2025, 2024, 2023];
  
  const sortProjects = (projects: Project[]) => {
    return [...projects].sort((a, b) => {
      const orderA = a.sort_order ?? Infinity;
      const orderB = b.sort_order ?? Infinity;
      if (orderA !== orderB) return orderA - orderB;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  };
  
  const projectsByYear = localProjects.reduce(
    (acc, project) => {
      const year = project.year;
      if (!acc[year]) acc[year] = [];
      acc[year].push(project);
      return acc;
    },
    {} as Record<number, Project[]>
  );
  
  Object.keys(projectsByYear).forEach((year) => {
    projectsByYear[Number(year)] = sortProjects(projectsByYear[Number(year)]);
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this project and all its content?")) return;
    await deleteProject.mutateAsync(id);
  };

  const handleNewProject = async () => {
    try {
      const currentYear = new Date().getFullYear();
      const newProject = await createProject.mutateAsync({
        title: "Untitled",
        year: currentYear,
        cover_url: null,
      });
      navigate(`/admin/projects/${newProject.id}`);
    } catch (err: unknown) {
      console.error("Failed to create project:", err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      toast({
        title: "Failed to create project",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    if (!over) {
      setOverYearId(null);
      return;
    }
    
    const overId = over.id as string;
    if (overId.startsWith("year-")) {
      setOverYearId(overId);
    } else {
      const overProject = localProjects.find((p) => p.id === overId);
      if (overProject) {
        setOverYearId(`year-${overProject.year}`);
      }
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setOverYearId(null);

    if (!over) return;

    const activeProject = localProjects.find((p) => p.id === active.id);
    if (!activeProject) return;

    let targetYear: number;
    let targetIndex: number;
    
    const overId = over.id as string;
    
    if (overId.startsWith("year-")) {
      targetYear = parseInt(overId.replace("year-", ""));
      const yearProjects = projectsByYear[targetYear] || [];
      targetIndex = yearProjects.length;
    } else {
      const overProject = localProjects.find((p) => p.id === overId);
      if (!overProject) return;
      
      targetYear = overProject.year;
      const yearProjects = projectsByYear[targetYear] || [];
      targetIndex = yearProjects.findIndex((p) => p.id === overId);
    }

    const previousProjects = [...localProjects];
    
    try {
      if (activeProject.year === targetYear) {
        const yearProjects = [...(projectsByYear[targetYear] || [])];
        const oldIndex = yearProjects.findIndex((p) => p.id === active.id);
        
        if (oldIndex === targetIndex) return;
        
        const reordered = arrayMove(yearProjects, oldIndex, targetIndex);
        
        const updatedProjects = localProjects.map((p) => {
          if (p.year !== targetYear) return p;
          const newIndex = reordered.findIndex((rp) => rp.id === p.id);
          return { ...p, sort_order: newIndex };
        });
        
        setLocalProjects(updatedProjects);
        
        const updates = reordered.map((p, i) => ({
          id: p.id,
          year: targetYear,
          sort_order: i,
        }));
        
        await reorderProjects.mutateAsync(updates);
      } else {
        const sourceYearProjects = (projectsByYear[activeProject.year] || []).filter(
          (p) => p.id !== active.id
        );
        const targetYearProjects = [...(projectsByYear[targetYear] || [])];
        
        targetYearProjects.splice(targetIndex, 0, {
          ...activeProject,
          year: targetYear,
        });
        
        const updatedProjects = localProjects.map((p) => {
          if (p.id === active.id) {
            const idx = targetYearProjects.findIndex((tp) => tp.id === p.id);
            return { ...p, year: targetYear, sort_order: idx };
          }
          if (p.year === activeProject.year && p.id !== active.id) {
            const idx = sourceYearProjects.findIndex((sp) => sp.id === p.id);
            return { ...p, sort_order: idx };
          }
          if (p.year === targetYear && p.id !== active.id) {
            const idx = targetYearProjects.findIndex((tp) => tp.id === p.id);
            return { ...p, sort_order: idx };
          }
          return p;
        });
        
        setLocalProjects(updatedProjects);
        
        const updates = [
          ...sourceYearProjects.map((p, i) => ({
            id: p.id,
            year: activeProject.year,
            sort_order: i,
          })),
          ...targetYearProjects.map((p, i) => ({
            id: p.id,
            year: targetYear,
            sort_order: i,
          })),
        ];
        
        await reorderProjects.mutateAsync(updates);
      }
    } catch (err: unknown) {
      console.error("Failed to reorder projects:", err);
      setLocalProjects(previousProjects);
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      toast({
        title: "Failed to reorder projects",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const activeProject = activeId
    ? localProjects.find((p) => p.id === activeId)
    : null;

  return (
    <div className="h-[100dvh] flex flex-col bg-zinc-950">
      <header className="flex-shrink-0 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <a
              href="/"
              className="text-zinc-400 transition-colors hover-elevate p-1 rounded"
              data-testid="link-back-to-home"
            >
              <ArrowLeft className="w-5 h-5" />
            </a>
            <h1 className="font-display text-xl text-white">Projects</h1>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <span className="text-sm text-zinc-500 hidden sm:block">
              {user?.email}
            </span>
            <Button
              onClick={handleNewProject}
              className="bg-blue-600"
              disabled={createProject.isPending}
              data-testid="button-new-project"
            >
              {createProject.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              New Project
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={signOut}
              data-testid="button-logout"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main
        className="flex-1 overflow-y-auto overscroll-contain custom-scrollbar"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
          {isLoading && (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          )}

          {!isLoading && localProjects.length === 0 && (
            <div className="text-center py-20">
              <p className="text-zinc-500 mb-4">No projects yet</p>
              <Button
                onClick={handleNewProject}
                data-testid="button-create-first"
              >
                Create your first project
              </Button>
            </div>
          )}

          {!isLoading && localProjects.length > 0 && (
            <DndContext
              sensors={sensors}
              collisionDetection={rectIntersection}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
            >
              {allYears.map((year) => {
                const yearProjects = projectsByYear[year] || [];
                const isOverThisYear = overYearId === `year-${year}`;
                
                return (
                  <DroppableYearGroup
                    key={year}
                    year={year}
                    isOver={isOverThisYear && activeId !== null}
                  >
                    <SortableContext
                      items={yearProjects.map((p) => p.id)}
                      strategy={rectSortingStrategy}
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 min-h-[100px]">
                        {yearProjects.length === 0 && (
                          <div className="col-span-full flex items-center justify-center h-24 border-2 border-dashed border-zinc-700 rounded-lg text-zinc-500 text-sm">
                            Drop projects here
                          </div>
                        )}
                        {yearProjects.map((project) => (
                          <SortableProjectCard
                            key={project.id}
                            project={project}
                            onEdit={() => navigate(`/admin/projects/${project.id}`)}
                            onDelete={() => handleDelete(project.id)}
                            isDeleting={deleteProject.isPending}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DroppableYearGroup>
                );
              })}
              
              <DragOverlay>
                {activeProject && (
                  <div className="bg-zinc-900 rounded-xl border-2 border-blue-500 overflow-hidden shadow-2xl opacity-90 w-64">
                    <div className="aspect-video relative overflow-hidden bg-zinc-800">
                      {activeProject.cover_url ? (
                        <img
                          src={activeProject.cover_url}
                          alt={activeProject.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-600">
                          <Image className="w-8 h-8" />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-white truncate">
                        {activeProject.title}
                      </h3>
                      <p className="text-sm text-zinc-500">{activeProject.year}</p>
                    </div>
                  </div>
                )}
              </DragOverlay>
            </DndContext>
          )}
        </div>
      </main>
    </div>
  );
}

interface BlockEditorProps {
  block: ProjectBlock;
  onUpdate: (data: ProjectBlock["data"]) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
  isMobile: boolean;
  isSelected: boolean;
  isHovered: boolean;
  onSelect: () => void;
  onHover: (hovered: boolean) => void;
  dragHandleProps?: {
    attributes: ReturnType<typeof useSortable>["attributes"];
    listeners: ReturnType<typeof useSortable>["listeners"];
  };
}

function VideoBlockEditor({
  data,
  onUpdate,
}: {
  data: VideoBlockData;
  onUpdate: (data: VideoBlockData) => void;
}) {
  const [showPreview, setShowPreview] = useState(false);
  const inputUrl = data.originalUrl || data.embedUrl || "";
  const embedResult = inputUrl ? toEmbedUrl(inputUrl) : null;
  const validEmbedUrl = embedResult?.embedUrl || null;
  const error = embedResult?.error || null;
  const lazyPreview = data.lazyPreview !== false;
  const aspect = data.aspect || "16:9";
  const aspectClass = getAspectRatioClass(aspect);

  const handleUrlChange = (rawUrl: string) => {
    const result = toEmbedUrl(rawUrl);
    onUpdate({
      ...data,
      originalUrl: rawUrl,
      embedUrl: result.embedUrl || "",
      lazyPreview: data.lazyPreview,
      aspect: data.aspect,
    });
    setShowPreview(false);
  };

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <label className="block text-sm text-zinc-400 mb-1">
        YouTube / Vimeo URL
      </label>
      <Input
        value={inputUrl}
        onChange={(e) => handleUrlChange(e.target.value)}
        placeholder="https://www.youtube.com/watch?v=..."
        className="bg-zinc-800 border-zinc-700 text-white"
        data-testid="input-video-url"
      />
      <p className="text-xs text-zinc-500 mt-1">
        Paste a normal YouTube/Vimeo link. We'll convert it to an embed
        automatically.
      </p>

      {error && inputUrl && (
        <div className="flex items-center gap-2 mt-2 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {validEmbedUrl && !error && (
        <div className="text-sm text-green-400 mt-2">Embed preview ready</div>
      )}

      {validEmbedUrl && (
        <div
          className={`mt-4 ${aspectClass} bg-black rounded-lg overflow-hidden relative`}
        >
          {lazyPreview && !showPreview ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 text-white">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(true)}
                className="gap-2"
                data-testid="button-load-preview"
              >
                <Play className="w-4 h-4" />
                Load Preview
              </Button>
            </div>
          ) : (
            <iframe
              src={validEmbedUrl}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
              sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
              title="Video preview"
            />
          )}
        </div>
      )}

      {validEmbedUrl && (
        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center gap-2">
            <label className="text-xs text-zinc-400">Aspect:</label>
            <Select
              value={aspect}
              onValueChange={(v) =>
                onUpdate({ ...data, aspect: v as "16:9" | "4:3" | "1:1" })
              }
            >
              <SelectTrigger className="w-20 h-7 bg-zinc-800 border-zinc-700 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="16:9">16:9</SelectItem>
                <SelectItem value="4:3">4:3</SelectItem>
                <SelectItem value="1:1">1:1</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer">
            <input
              type="checkbox"
              checked={lazyPreview}
              onChange={(e) =>
                onUpdate({ ...data, lazyPreview: e.target.checked })
              }
              className="rounded border-zinc-600"
            />
            Lazy preview
          </label>
        </div>
      )}
    </div>
  );
}

function BlockEditor({
  block,
  onUpdate,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
  isMobile,
  isSelected,
  isHovered,
  onSelect,
  onHover,
  dragHandleProps,
}: BlockEditorProps) {
  const [uploading, setUploading] = useState(false);

  const showActions = isMobile ? isSelected : isSelected || isHovered;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file);
      const fileType = file.type;
      const fileName = file.name.toLowerCase();
      
      let mediaType: 'image' | 'gif' | 'video' = 'image';
      let videoOptions: ImageBlockData['videoOptions'] = undefined;
      
      if (fileType === 'video/mp4' || fileType === 'video/webm' || fileName.endsWith('.mp4') || fileName.endsWith('.webm')) {
        mediaType = 'video';
        videoOptions = { mode: 'autoplay', loop: true };
      } else if (fileType === 'image/gif' || fileName.endsWith('.gif')) {
        mediaType = 'gif';
      }
      
      onUpdate({ 
        ...block.data, 
        url,
        mediaType,
        videoOptions,
      } as ImageBlockData);
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleGridImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploading(true);
    try {
      const urls = await Promise.all(files.map((f) => uploadImage(f)));
      const currentUrls = (block.data as GridBlockData).urls || [];
      onUpdate({
        ...block.data,
        urls: [...currentUrls, ...urls],
      } as GridBlockData);
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
    }
  };

  const removeGridImage = (index: number) => {
    const urls = [...(block.data as GridBlockData).urls];
    urls.splice(index, 1);
    onUpdate({ ...block.data, urls } as GridBlockData);
  };

  const textData = block.data as TextBlockData;
  const [editorMenuOpen, setEditorMenuOpen] = useState(false);

  const handlePointerDown = (e: React.PointerEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.closest(
        "button, input, textarea, [contenteditable], .tiptap-editor, [data-drag-handle]",
      )
    )
      return;
    onSelect();
  };

  return (
    <div
      data-block-id={block.id}
      className={`bg-zinc-900/50 rounded-xl transition-all cursor-pointer ${isSelected ? "ring-2 ring-blue-500" : isHovered ? "ring-1 ring-zinc-600" : ""}`}
      onPointerDown={handlePointerDown}
      onMouseEnter={() => !isMobile && onHover(true)}
      onMouseLeave={() => !isMobile && !editorMenuOpen && onHover(false)}
    >
      {showActions && (
        <div className="flex items-center gap-1 px-3 py-2 bg-zinc-800/80 border-b border-zinc-700 rounded-t-xl">
          {!isMobile && dragHandleProps && (
            <div
              {...dragHandleProps.attributes}
              {...dragHandleProps.listeners}
              className="cursor-grab active:cursor-grabbing p-1.5 rounded hover:bg-zinc-700 transition-colors touch-none"
              data-testid={`drag-handle-${block.id}`}
            >
              <GripVertical className="w-4 h-4 text-zinc-400" />
            </div>
          )}
          <span className="text-xs text-zinc-400 uppercase tracking-wide flex-1 ml-1">
            {block.type}
          </span>
          {isMobile && (
            <div className="flex gap-1">
              <Button
                size="icon"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveUp();
                }}
                disabled={isFirst}
                data-testid={`button-move-up-${block.id}`}
              >
                <ChevronUp className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveDown();
                }}
                disabled={isLast}
                data-testid={`button-move-down-${block.id}`}
              >
                <ChevronDown className="w-4 h-4" />
              </Button>
            </div>
          )}
          <Button
            size="icon"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate();
            }}
            data-testid={`button-duplicate-${block.id}`}
          >
            <Copy className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="text-red-400"
            data-testid={`button-delete-${block.id}`}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )}

      <div className="p-4">
        {block.type === "image" && (
          <div>
            {(() => {
              const imgData = block.data as ImageBlockData;
              const isVideo = imgData.mediaType === 'video' || imgData.url?.toLowerCase().endsWith('.mp4');
              const currentMode = imgData.videoOptions?.mode || 'autoplay';
              
              if (!imgData.url) {
                return (
                  <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-zinc-700 rounded-lg cursor-pointer hover:border-zinc-600 transition-colors">
                    {uploading ? (
                      <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
                    ) : (
                      <>
                        <Image className="w-8 h-8 text-zinc-600 mb-2" />
                        <span className="text-sm text-zinc-500">
                          Image, GIF, MP4 or WebM
                        </span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*,image/gif,video/mp4,video/webm"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </label>
                );
              }
              
              return (
                <div className="relative">
                  {isVideo ? (
                    <video
                      src={imgData.url}
                      className="w-full h-auto rounded-lg"
                      autoPlay
                      loop
                      muted
                      playsInline
                    />
                  ) : (
                    <img
                      src={imgData.url}
                      alt=""
                      className="w-full h-auto rounded-lg"
                    />
                  )}
                  {isSelected && (
                    <>
                      <label className="absolute top-2 right-2 cursor-pointer">
                        <span className="inline-flex items-center justify-center rounded-md text-sm font-medium h-8 px-3 bg-zinc-800 text-zinc-100 hover:bg-zinc-700 transition-colors">
                          {uploading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            "Replace"
                          )}
                        </span>
                        <input
                          type="file"
                          accept="image/*,image/gif,video/mp4,video/webm"
                          className="hidden"
                          onChange={handleImageUpload}
                          disabled={uploading}
                        />
                      </label>
                      {isVideo && (
                        <div className="absolute bottom-2 left-2 flex items-center gap-2 bg-black/70 backdrop-blur-sm rounded-lg px-3 py-2">
                          <span className="text-xs text-zinc-400">Mode:</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onUpdate({
                                ...block.data,
                                mediaType: 'video',
                                videoOptions: { mode: 'autoplay', loop: true },
                              } as ImageBlockData);
                            }}
                            disabled={uploading}
                            className={`px-2 py-1 text-xs rounded transition-colors ${
                              currentMode === 'autoplay'
                                ? 'bg-white/20 text-white'
                                : 'text-zinc-400 hover:text-white'
                            }`}
                            data-testid="button-video-mode-autoplay"
                          >
                            Autoplay
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onUpdate({
                                ...block.data,
                                mediaType: 'video',
                                videoOptions: { mode: 'click', loop: false },
                              } as ImageBlockData);
                            }}
                            disabled={uploading}
                            className={`px-2 py-1 text-xs rounded transition-colors ${
                              currentMode === 'click'
                                ? 'bg-white/20 text-white'
                                : 'text-zinc-400 hover:text-white'
                            }`}
                            data-testid="button-video-mode-click"
                          >
                            Click to Play
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        {block.type === "text" && (
          <div className="tiptap-editor" onClick={(e) => e.stopPropagation()}>
            <TipTapEditor
              content={textData.json || null}
              onChange={(json) =>
                onUpdate({ ...block.data, json } as TextBlockData)
              }
              onMenuOpenChange={setEditorMenuOpen}
            />
          </div>
        )}

        {block.type === "video" && (
          <VideoBlockEditor
            data={block.data as VideoBlockData}
            onUpdate={(data) => onUpdate(data)}
          />
        )}

        {block.type === "grid" && (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
              {((block.data as GridBlockData).urls || []).map((url, idx) => (
                <div
                  key={idx}
                  className="relative aspect-square rounded-lg overflow-hidden group/img"
                >
                  <img
                    src={url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  {isSelected && (
                    <Button
                      size="icon"
                      variant="destructive"
                      className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover/img:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeGridImage(idx);
                      }}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              ))}
              {isSelected && (
                <label className="aspect-square flex items-center justify-center border-2 border-dashed border-zinc-700 rounded-lg cursor-pointer hover:border-zinc-600 transition-colors">
                  {uploading ? (
                    <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
                  ) : (
                    <Plus className="w-6 h-6 text-zinc-600" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleGridImageUpload}
                  />
                </label>
              )}
            </div>
          </div>
        )}

        {block.type === "divider" && (
          <div className="py-4">
            <hr
              className="border-zinc-700"
              style={{
                borderStyle: (block.data as DividerBlockData).style || "solid",
                borderWidth: `${(block.data as DividerBlockData).thickness || 1}px 0 0 0`,
                opacity: (block.data as DividerBlockData).opacity ?? 0.5,
              }}
            />
          </div>
        )}

        {block.type === "spacer" && (
          <div
            className="bg-zinc-800/30 rounded flex items-center justify-center text-zinc-600 text-xs"
            style={{
              height: `${(block.data as SpacerBlockData).height || 48}px`,
            }}
          >
            {isSelected &&
              `${(block.data as SpacerBlockData).height || 48}px spacer`}
          </div>
        )}
      </div>
    </div>
  );
}

type SortableBlockEditorProps = Omit<BlockEditorProps, "dragHandleProps"> & {
  id: string;
};

function SortableBlockEditor(props: SortableBlockEditorProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : "auto",
  };

  return (
    <div ref={setNodeRef} style={style}>
      <BlockEditor {...props} dragHandleProps={{ attributes, listeners }} />
    </div>
  );
}

interface AddBlockButtonProps {
  onAdd: (type: BlockType) => void;
  position: number;
}

function AddBlockButton({ onAdd, position }: AddBlockButtonProps) {
  const [showMenu, setShowMenu] = useState(false);

  const blockTypes: { type: BlockType; icon: typeof Image; label: string }[] = [
    { type: "image", icon: Image, label: "Image" },
    { type: "text", icon: Type, label: "Text" },
    { type: "video", icon: Video, label: "Video" },
    { type: "grid", icon: Grid3X3, label: "Grid" },
    { type: "divider", icon: Minus, label: "Divider" },
    { type: "spacer", icon: Square, label: "Spacer" },
  ];

  return (
    <div className="relative flex items-center justify-center py-2 group/add">
      <div className="absolute inset-x-0 top-1/2 h-px bg-zinc-800 opacity-0 group-hover/add:opacity-100 transition-opacity" />
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="relative z-10 flex items-center gap-1 px-3 py-1.5 text-xs text-zinc-500 bg-zinc-900 border border-zinc-800 rounded-full opacity-0 group-hover/add:opacity-100 hover-elevate transition-all"
        data-testid={`button-add-at-${position}`}
      >
        <Plus className="w-3 h-3" />
        Add here
      </button>
      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute top-full mt-2 z-50 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl p-2 min-w-[160px]">
            {blockTypes.map(({ type, icon: Icon, label }) => (
              <button
                key={type}
                onClick={() => {
                  onAdd(type);
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 rounded-md transition-colors"
                data-testid={`menu-add-${type}`}
              >
                <Icon className="w-4 h-4 text-zinc-500" />
                {label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function ProjectBuilder({ projectId }: { projectId: string }) {
  const [, navigate] = useLocation();
  const { data: existingProject, isLoading: loadingProject } =
    useProject(projectId);
  const { data: blocks = [], isLoading: loadingBlocks } =
    useProjectBlocks(projectId);

  const updateProject = useUpdateProject();
  const createBlock = useCreateBlock();
  const updateBlock = useUpdateBlock();
  const deleteBlock = useDeleteBlock();
  const reorderBlocks = useReorderBlocks();

  const [title, setTitle] = useState("Untitled");
  const [year, setYear] = useState("2026");
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [localBlocks, setLocalBlocks] = useState<ProjectBlock[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [hasBlockChanges, setHasBlockChanges] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [hoveredBlockId, setHoveredBlockId] = useState<string | null>(null);
  const [showMobileAddMenu, setShowMobileAddMenu] = useState(false);
  const [deletedBlockIds, setDeletedBlockIds] = useState<string[]>([]);

  const initialDataRef = useRef<{
    title: string;
    year: string;
    coverUrl: string | null;
  } | null>(null);
  const initialBlocksRef = useRef<ProjectBlock[] | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (existingProject) {
      setTitle(existingProject.title);
      setYear(existingProject.year.toString());
      setCoverUrl(existingProject.cover_url);
      initialDataRef.current = {
        title: existingProject.title,
        year: existingProject.year.toString(),
        coverUrl: existingProject.cover_url,
      };
    }
  }, [existingProject]);

  useEffect(() => {
    if (initialBlocksRef.current === null && !loadingBlocks) {
      setLocalBlocks(blocks);
      initialBlocksRef.current = blocks;
    }
  }, [blocks, loadingBlocks]);

  useEffect(() => {
    if (!initialDataRef.current) return;
    const changed =
      title !== initialDataRef.current.title ||
      year !== initialDataRef.current.year ||
      coverUrl !== initialDataRef.current.coverUrl;
    setHasUnsavedChanges(changed);
  }, [title, year, coverUrl]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges || hasBlockChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges, hasBlockChanges]);

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    console.log("cover file selected", file?.name);
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file, "covers");
      setCoverUrl(url);
    } catch (err) {
      console.error("Cover upload failed:", err);
    } finally {
      setUploading(false);
    }
  };

  const addBlock = async (type: BlockType, atPosition?: number) => {
    let data: ProjectBlock["data"];
    switch (type) {
      case "image":
        data = { url: "" };
        break;
      case "text":
        data = { json: { type: "doc", content: [] } };
        break;
      case "video":
        data = { originalUrl: "", embedUrl: "" };
        break;
      case "grid":
        data = { urls: [], columnsDesktop: 3, columnsMobile: 2, gap: 8 };
        break;
      case "divider":
        data = { style: "solid", thickness: 1, opacity: 0.5, width: "normal" };
        break;
      case "spacer":
        data = { height: 48 };
        break;
    }

    const insertAt = atPosition ?? localBlocks.length;

    const newBlock = await createBlock.mutateAsync({
      project_id: projectId,
      type,
      data,
      sort_order: insertAt,
    });

    setLocalBlocks((prev) => {
      const updated = prev.map((b, i) =>
        i >= insertAt ? { ...b, sort_order: b.sort_order + 1 } : b,
      );
      const inserted = [...updated];
      inserted.splice(insertAt, 0, newBlock);
      return inserted.map((b, i) => ({ ...b, sort_order: i }));
    });

    if (initialBlocksRef.current === null) {
      initialBlocksRef.current = [];
    }
    initialBlocksRef.current = [...(initialBlocksRef.current || []), newBlock];

    setSelectedBlockId(newBlock.id);
    setShowMobileAddMenu(false);
  };

  const handleBlockUpdate = (blockId: string, data: ProjectBlock["data"]) => {
    setLocalBlocks((prev) =>
      prev.map((b) => (b.id === blockId ? { ...b, data } : b)),
    );
    setHasBlockChanges(true);
  };

  const handleBlockDelete = (blockId: string) => {
    setLocalBlocks((prev) => prev.filter((b) => b.id !== blockId));
    setDeletedBlockIds((prev) => [...prev, blockId]);
    setHasBlockChanges(true);
    if (selectedBlockId === blockId) setSelectedBlockId(null);
  };

  const handleBlockDuplicate = async (block: ProjectBlock) => {
    const currentIndex = localBlocks.findIndex((b) => b.id === block.id);
    const insertAt = currentIndex + 1;

    const newBlock = await createBlock.mutateAsync({
      project_id: projectId,
      type: block.type,
      data: { ...block.data },
      sort_order: insertAt,
    });

    setLocalBlocks((prev) => {
      const updated = prev.map((b, i) =>
        i >= insertAt ? { ...b, sort_order: b.sort_order + 1 } : b,
      );
      const inserted = [...updated];
      inserted.splice(insertAt, 0, newBlock);
      return inserted.map((b, i) => ({ ...b, sort_order: i }));
    });

    if (initialBlocksRef.current === null) {
      initialBlocksRef.current = [];
    }
    initialBlocksRef.current = [...(initialBlocksRef.current || []), newBlock];

    setSelectedBlockId(newBlock.id);
  };

  const moveBlock = (index: number, direction: "up" | "down") => {
    const newBlocks = [...localBlocks];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newBlocks.length) return;

    [newBlocks[index], newBlocks[targetIndex]] = [
      newBlocks[targetIndex],
      newBlocks[index],
    ];
    const reordered = newBlocks.map((b, i) => ({ ...b, sort_order: i }));
    setLocalBlocks(reordered);
    setHasBlockChanges(true);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (!over || active.id === over.id) return;

      const oldIndex = localBlocks.findIndex((b) => b.id === active.id);
      const newIndex = localBlocks.findIndex((b) => b.id === over.id);

      if (oldIndex === -1 || newIndex === -1) return;

      const newBlocks = arrayMove(localBlocks, oldIndex, newIndex);
      const reordered = newBlocks.map((b, i) => ({ ...b, sort_order: i }));
      setLocalBlocks(reordered);
      setHasBlockChanges(true);
    },
    [localBlocks],
  );

  const handleSave = async () => {
    if (!title.trim()) {
      alert("Please enter a project title");
      return;
    }

    setSaving(true);
    try {
      await updateProject.mutateAsync({
        id: projectId,
        updates: { title, year: parseInt(year), cover_url: coverUrl },
      });

      for (const deletedId of deletedBlockIds) {
        try {
          await deleteBlock.mutateAsync({ id: deletedId, projectId });
        } catch (err) {
          console.warn("Block already deleted:", deletedId);
        }
      }

      for (const block of localBlocks) {
        const original = initialBlocksRef.current?.find(
          (b) => b.id === block.id,
        );
        if (original) {
          if (
            JSON.stringify(original.data) !== JSON.stringify(block.data) ||
            original.sort_order !== block.sort_order
          ) {
            await updateBlock.mutateAsync({
              id: block.id,
              projectId,
              updates: { data: block.data, sort_order: block.sort_order },
            });
          }
        }
      }

      initialDataRef.current = { title, year, coverUrl };
      initialBlocksRef.current = [...localBlocks];
      setDeletedBlockIds([]);
      setHasUnsavedChanges(false);
      setHasBlockChanges(false);
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (hasUnsavedChanges || hasBlockChanges) {
      if (!confirm("You have unsaved changes. Leave anyway?")) return;
    }
    navigate("/admin");
  };

  useEffect(() => {
    const handleClickOutside = (e: PointerEvent) => {
      if (!(e.target instanceof Element)) return;
      if (
        e.target.closest(
          "[data-block-id], [data-inspector-panel], [data-bottom-sheet]",
        )
      )
        return;
      setSelectedBlockId(null);
    };
    document.addEventListener("pointerdown", handleClickOutside);
    return () =>
      document.removeEventListener("pointerdown", handleClickOutside);
  }, []);

  if (loadingProject || loadingBlocks) {
    return (
      <div className="h-[100dvh] bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const blockTypes: { type: BlockType; icon: typeof Image; label: string }[] = [
    { type: "image", icon: Image, label: "Image" },
    { type: "text", icon: Type, label: "Text" },
    { type: "video", icon: Video, label: "Video" },
    { type: "grid", icon: Grid3X3, label: "Grid" },
    { type: "divider", icon: Minus, label: "Divider" },
    { type: "spacer", icon: Square, label: "Spacer" },
  ];

  return (
    <div className="h-[100dvh] flex flex-col bg-zinc-950">
      <header className="flex-shrink-0 bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800 z-20">
        <div className="px-3 md:px-6 py-3 flex items-center gap-2 md:gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="flex-shrink-0"
            data-testid="button-back-to-list"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>

          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Project title"
            className="flex-1 min-w-0 max-w-md bg-transparent border-none text-lg md:text-xl text-white placeholder:text-zinc-600 focus-visible:ring-0 px-0"
            data-testid="input-project-title"
          />

          <Select value={year} onValueChange={setYear}>
            <SelectTrigger
              className="w-20 md:w-24 bg-zinc-800 border-zinc-700 flex-shrink-0"
              data-testid="select-year"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2023">2023</SelectItem>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2026">2026</SelectItem>
            </SelectContent>
          </Select>

          {(hasUnsavedChanges || hasBlockChanges) && (
            <span className="text-xs text-amber-500 hidden md:block flex-shrink-0">
              Unsaved
            </span>
          )}

          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 flex-shrink-0"
            data-testid="button-save-project"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4 md:mr-2" />
            )}
            <span className="hidden md:inline">Save</span>
          </Button>
        </div>
      </header>

      <div className="flex-1 flex min-h-0">
        <main
          ref={canvasRef}
          className="flex-1 overflow-y-auto overscroll-contain pb-24 md:pb-8 custom-scrollbar"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          <div className="max-w-3xl mx-auto p-4 md:p-8 space-y-2">
            <div
              className={`bg-zinc-900/50 rounded-xl transition-all ${selectedBlockId === "cover" ? "ring-2 ring-blue-500" : "hover:ring-1 hover:ring-zinc-700"}`}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedBlockId("cover");
              }}
            >
              <div className="p-4">
                {coverUrl ? (
                  <div className="relative">
                    <img
                      src={coverUrl}
                      alt="Cover"
                      className="w-full aspect-video object-cover rounded-lg"
                    />
                    {selectedBlockId === "cover" && (
                      <label 
                        className="absolute top-2 right-2 z-50 cursor-pointer"
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span className="inline-flex items-center justify-center rounded-md text-sm font-medium h-8 px-3 bg-zinc-800 text-zinc-100 hover:bg-zinc-700 transition-colors">
                          {uploading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            "Replace"
                          )}
                        </span>
                        <input
                          type="file"
                          accept="image/*,image/gif,video/mp4,video/webm"
                          style={{ position: 'absolute', width: 1, height: 1, opacity: 0, overflow: 'hidden' }}
                          onChange={handleCoverUpload}
                          disabled={uploading}
                        />
                      </label>
                    )}
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-zinc-700 rounded-lg cursor-pointer hover:border-zinc-600 transition-colors">
                    {uploading ? (
                      <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
                    ) : (
                      <>
                        <Image className="w-10 h-10 text-zinc-600 mb-2" />
                        <span className="text-sm text-zinc-500">
                          Upload cover image
                        </span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleCoverUpload}
                    />
                  </label>
                )}
              </div>
            </div>

            <AddBlockButton onAdd={(type) => addBlock(type, 0)} position={0} />

            {!isMobile ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={localBlocks.map((b) => b.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {localBlocks.map((block, index) => (
                    <div key={block.id}>
                      <SortableBlockEditor
                        id={block.id}
                        block={block}
                        onUpdate={(data) => handleBlockUpdate(block.id, data)}
                        onDelete={() => handleBlockDelete(block.id)}
                        onDuplicate={() => handleBlockDuplicate(block)}
                        onMoveUp={() => moveBlock(index, "up")}
                        onMoveDown={() => moveBlock(index, "down")}
                        isFirst={index === 0}
                        isLast={index === localBlocks.length - 1}
                        isMobile={isMobile}
                        isSelected={selectedBlockId === block.id}
                        isHovered={hoveredBlockId === block.id}
                        onSelect={() => setSelectedBlockId(block.id)}
                        onHover={(hovered) =>
                          setHoveredBlockId(hovered ? block.id : null)
                        }
                      />
                      <AddBlockButton
                        onAdd={(type) => addBlock(type, index + 1)}
                        position={index + 1}
                      />
                    </div>
                  ))}
                </SortableContext>
              </DndContext>
            ) : (
              localBlocks.map((block, index) => (
                <div key={block.id}>
                  <BlockEditor
                    block={block}
                    onUpdate={(data) => handleBlockUpdate(block.id, data)}
                    onDelete={() => handleBlockDelete(block.id)}
                    onDuplicate={() => handleBlockDuplicate(block)}
                    onMoveUp={() => moveBlock(index, "up")}
                    onMoveDown={() => moveBlock(index, "down")}
                    isFirst={index === 0}
                    isLast={index === localBlocks.length - 1}
                    isMobile={isMobile}
                    isSelected={selectedBlockId === block.id}
                    isHovered={hoveredBlockId === block.id}
                    onSelect={() => setSelectedBlockId(block.id)}
                    onHover={(hovered) =>
                      setHoveredBlockId(hovered ? block.id : null)
                    }
                  />
                  <AddBlockButton
                    onAdd={(type) => addBlock(type, index + 1)}
                    position={index + 1}
                  />
                </div>
              ))
            )}

            {localBlocks.length === 0 && (
              <div className="text-center py-12 text-zinc-600">
                <p className="mb-2">No content blocks yet</p>
                <p className="text-sm">Hover between sections to add content</p>
              </div>
            )}
          </div>
        </main>

        <aside
          className="hidden md:flex flex-col w-64 border-l border-zinc-800 bg-zinc-900/50 flex-shrink-0"
          data-inspector-panel
        >
          <div className="p-4 border-b border-zinc-800">
            <p className="text-xs text-zinc-500 uppercase tracking-wide">
              Add Content
            </p>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
            {blockTypes.map(({ type, icon: Icon, label }) => (
              <button
                key={type}
                onClick={() => addBlock(type)}
                className="w-full flex items-center gap-3 p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors text-left"
                data-testid={`button-add-${type}`}
              >
                <div className="w-10 h-10 rounded-lg bg-zinc-700 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-zinc-400" />
                </div>
                <span className="text-sm text-zinc-300">{label}</span>
              </button>
            ))}
          </div>
        </aside>
      </div>

      <div
        className="md:hidden fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800 z-30"
        data-bottom-sheet
      >
        <div className="flex gap-1 p-2 justify-center">
          {blockTypes.slice(0, 4).map(({ type, icon: Icon }) => (
            <Button
              key={type}
              variant="ghost"
              size="sm"
              onClick={() => addBlock(type)}
              className="flex-1 h-11"
              data-testid={`mobile-add-${type}`}
            >
              <Icon className="w-5 h-5" />
            </Button>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowMobileAddMenu(!showMobileAddMenu)}
            className="flex-1 h-11"
            data-testid="mobile-more-blocks"
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>
        {showMobileAddMenu && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/50"
              onClick={() => setShowMobileAddMenu(false)}
            />
            <div className="absolute bottom-full left-0 right-0 bg-zinc-900 border-t border-zinc-800 p-4 z-50">
              <div className="grid grid-cols-3 gap-2">
                {blockTypes.map(({ type, icon: Icon, label }) => (
                  <button
                    key={type}
                    onClick={() => addBlock(type)}
                    className="flex flex-col items-center gap-2 p-4 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors"
                  >
                    <Icon className="w-6 h-6 text-zinc-400" />
                    <span className="text-xs text-zinc-300">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function NewProjectRedirect() {
  const [, navigate] = useLocation();
  const createProject = useCreateProject();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const create = async () => {
      try {
        const newProject = await createProject.mutateAsync({
          title: "Untitled",
          year: 2026,
          cover_url: null,
        });
        navigate(`/admin/projects/${newProject.id}`, { replace: true });
      } catch (err) {
        console.error("Failed to create project:", err);
        setError("Failed to create project");
      }
    };
    create();
  }, []);

  if (error) {
    return (
      <div className="h-[100dvh] bg-zinc-950 flex flex-col items-center justify-center gap-4">
        <p className="text-red-400">{error}</p>
        <Button onClick={() => navigate("/admin")}>Back to Projects</Button>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] bg-zinc-950 flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
    </div>
  );
}

export default function Admin() {
  const { user, loading: authLoading, signIn } = useAuth();
  const [matchList] = useRoute("/admin");
  const [matchNew] = useRoute("/admin/projects/new");
  const [matchEdit, params] = useRoute("/admin/projects/:id");

  if (authLoading) {
    return (
      <div className="h-[100dvh] flex items-center justify-center bg-zinc-950">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!user) {
    return <LoginForm onLogin={signIn} />;
  }

  if (matchNew) {
    return <NewProjectRedirect />;
  }

  if (matchEdit && params?.id) {
    return <ProjectBuilder projectId={params.id} />;
  }

  return <ProjectList />;
}
