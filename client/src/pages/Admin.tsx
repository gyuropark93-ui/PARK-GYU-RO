import { useState, useEffect, useCallback } from 'react';
import { useLocation, useRoute } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useProjects, useProject, useCreateProject, useUpdateProject, useDeleteProject, useProjectBlocks, useCreateBlock, useUpdateBlock, useDeleteBlock, useReorderBlocks, uploadImage } from '@/hooks/use-projects';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Pencil, Trash2, LogOut, Plus, ArrowLeft, Image, Type, Video, Grid3X3, GripVertical, ChevronUp, ChevronDown, Save, X } from 'lucide-react';
import type { Project, ProjectBlock, BlockType, ImageBlockData, TextBlockData, VideoBlockData, GridBlockData } from '@/lib/supabase';
import { TipTapEditor } from '@/components/TipTapEditor';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function LoginForm({ onLogin }: { onLogin: (email: string, password: string) => Promise<void> }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await onLogin(email, password);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
      <div className="w-full max-w-md bg-zinc-900 rounded-2xl border border-zinc-800 p-8">
        <h1 className="font-display text-2xl text-center text-white mb-6">Admin Login</h1>
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
          <Button type="submit" className="w-full" disabled={loading} data-testid="button-login">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign In'}
          </Button>
        </form>
      </div>
    </div>
  );
}

function ProjectList() {
  const [, navigate] = useLocation();
  const { data: projects, isLoading } = useProjects();
  const deleteProject = useDeleteProject();
  const { signOut, user } = useAuth();

  const projectsByYear = projects?.reduce((acc, project) => {
    const year = project.year;
    if (!acc[year]) acc[year] = [];
    acc[year].push(project);
    return acc;
  }, {} as Record<number, Project[]>) || {};

  const years = Object.keys(projectsByYear).map(Number).sort((a, b) => b - a);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this project and all its content?')) return;
    await deleteProject.mutateAsync(id);
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      <header className="sticky top-0 z-10 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/" className="text-zinc-400 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </a>
            <h1 className="font-display text-xl text-white">Projects</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-500">{user?.email}</span>
            <Button 
              onClick={() => navigate('/admin/projects/new')}
              className="bg-blue-600 hover:bg-blue-700"
              data-testid="button-new-project"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
            <Button variant="ghost" size="icon" onClick={signOut} className="text-zinc-400 hover:text-white" data-testid="button-logout">
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {isLoading && (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        )}

        {!isLoading && years.length === 0 && (
          <div className="text-center py-20">
            <p className="text-zinc-500 mb-4">No projects yet</p>
            <Button onClick={() => navigate('/admin/projects/new')} data-testid="button-create-first">
              Create your first project
            </Button>
          </div>
        )}

        {years.map((year) => (
          <div key={year} className="mb-10">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-sm">{year}</span>
              {year}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {projectsByYear[year].map((project) => (
                <div
                  key={project.id}
                  className="group bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden hover:border-zinc-700 transition-colors"
                >
                  <div className="aspect-video relative overflow-hidden bg-zinc-800">
                    {project.cover_url ? (
                      <img src={project.cover_url} alt={project.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-600">
                        <Image className="w-8 h-8" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => navigate(`/admin/projects/${project.id}`)}
                        data-testid={`button-edit-${project.id}`}
                      >
                        <Pencil className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(project.id)}
                        disabled={deleteProject.isPending}
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
              ))}
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}

interface BlockEditorProps {
  block: ProjectBlock;
  onUpdate: (data: ProjectBlock['data']) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
  isMobile: boolean;
  dragHandleProps?: {
    attributes: ReturnType<typeof useSortable>['attributes'];
    listeners: ReturnType<typeof useSortable>['listeners'];
  };
}

function BlockEditor({ block, onUpdate, onDelete, onMoveUp, onMoveDown, isFirst, isLast, isMobile, dragHandleProps }: BlockEditorProps) {
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file);
      onUpdate({ url } as ImageBlockData);
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleGridImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploading(true);
    try {
      const urls = await Promise.all(files.map(f => uploadImage(f)));
      const currentUrls = (block.data as GridBlockData).urls || [];
      onUpdate({ urls: [...currentUrls, ...urls] } as GridBlockData);
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  const removeGridImage = (index: number) => {
    const urls = [...(block.data as GridBlockData).urls];
    urls.splice(index, 1);
    onUpdate({ urls } as GridBlockData);
  };

  const textData = block.data as TextBlockData;

  return (
    <div className="group bg-zinc-900 rounded-xl border border-zinc-800 overflow-visible">
      <div className="flex items-center gap-2 px-4 py-2 bg-zinc-800/50 border-b border-zinc-800">
        {!isMobile && dragHandleProps && (
          <div 
            {...dragHandleProps.attributes} 
            {...dragHandleProps.listeners}
            className="cursor-grab active:cursor-grabbing p-1 -ml-1 rounded hover:bg-zinc-700 transition-colors touch-none"
            data-testid={`drag-handle-${block.id}`}
          >
            <GripVertical className="w-4 h-4 text-zinc-500" />
          </div>
        )}
        <span className="text-xs text-zinc-500 uppercase tracking-wide flex-1">
          {block.type}
        </span>
        {isMobile && (
          <div className="flex gap-1">
            <Button size="icon" variant="ghost" onClick={onMoveUp} disabled={isFirst} className="h-7 w-7">
              <ChevronUp className="w-4 h-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={onMoveDown} disabled={isLast} className="h-7 w-7">
              <ChevronDown className="w-4 h-4" />
            </Button>
          </div>
        )}
        <Button size="icon" variant="ghost" onClick={onDelete} className="h-7 w-7 text-zinc-500 hover:text-red-400">
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="p-4">
        {block.type === 'image' && (
          <div>
            {(block.data as ImageBlockData).url ? (
              <div className="relative">
                <img src={(block.data as ImageBlockData).url} alt="" className="w-full h-auto rounded-lg" />
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute top-2 right-2"
                  onClick={() => onUpdate({ url: '' } as ImageBlockData)}
                >
                  Replace
                </Button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-zinc-700 rounded-lg cursor-pointer hover:border-zinc-600 transition-colors">
                {uploading ? (
                  <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
                ) : (
                  <>
                    <Image className="w-8 h-8 text-zinc-600 mb-2" />
                    <span className="text-sm text-zinc-500">Click to upload</span>
                  </>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
            )}
          </div>
        )}

        {block.type === 'text' && (
          <TipTapEditor
            content={textData.json || null}
            onChange={(json) => onUpdate({ json } as TextBlockData)}
          />
        )}

        {block.type === 'video' && (
          <div>
            <Input
              value={(block.data as VideoBlockData).embedUrl || ''}
              onChange={(e) => onUpdate({ embedUrl: e.target.value } as VideoBlockData)}
              placeholder="YouTube or Vimeo embed URL"
              className="bg-zinc-800 border-zinc-700 text-white"
            />
            {(block.data as VideoBlockData).embedUrl && (
              <div className="mt-4 aspect-video bg-black rounded-lg overflow-hidden">
                <iframe
                  src={(block.data as VideoBlockData).embedUrl}
                  className="w-full h-full"
                  allowFullScreen
                />
              </div>
            )}
          </div>
        )}

        {block.type === 'grid' && (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
              {((block.data as GridBlockData).urls || []).map((url, idx) => (
                <div key={idx} className="relative aspect-square rounded-lg overflow-hidden group/img">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <Button
                    size="icon"
                    variant="destructive"
                    className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover/img:opacity-100 transition-opacity"
                    onClick={() => removeGridImage(idx)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
              <label className="aspect-square flex items-center justify-center border-2 border-dashed border-zinc-700 rounded-lg cursor-pointer hover:border-zinc-600 transition-colors">
                {uploading ? (
                  <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
                ) : (
                  <Plus className="w-6 h-6 text-zinc-600" />
                )}
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleGridImageUpload} />
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface SortableBlockEditorProps extends Omit<BlockEditorProps, 'dragHandleProps'> {
  id: string;
}

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
    zIndex: isDragging ? 1000 : 'auto',
  };

  return (
    <div ref={setNodeRef} style={style}>
      <BlockEditor
        {...props}
        dragHandleProps={{ attributes, listeners }}
      />
    </div>
  );
}

function ProjectBuilder({ projectId }: { projectId?: string }) {
  const [, navigate] = useLocation();
  const { data: existingProject, isLoading: loadingProject } = useProject(projectId);
  const { data: blocks = [], isLoading: loadingBlocks } = useProjectBlocks(projectId);
  
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const createBlock = useCreateBlock();
  const updateBlock = useUpdateBlock();
  const deleteBlock = useDeleteBlock();
  const reorderBlocks = useReorderBlocks();

  const [title, setTitle] = useState('');
  const [year, setYear] = useState('2026');
  const [coverUrl, setCoverUrl] = useState('');
  const [localBlocks, setLocalBlocks] = useState<ProjectBlock[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (existingProject) {
      setTitle(existingProject.title);
      setYear(existingProject.year.toString());
      setCoverUrl(existingProject.cover_url);
    }
  }, [existingProject]);

  useEffect(() => {
    if (blocks.length > 0 || localBlocks.length === 0) {
      setLocalBlocks(blocks);
    }
  }, [JSON.stringify(blocks.map(b => b.id))]);

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file, 'covers');
      setCoverUrl(url);
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  const addBlock = async (type: BlockType) => {
    if (!projectId) return;
    
    let data: ProjectBlock['data'];
    switch (type) {
      case 'image':
        data = { url: '' };
        break;
      case 'text':
        data = { json: { type: 'doc', content: [] } };
        break;
      case 'video':
        data = { embedUrl: '' };
        break;
      case 'grid':
        data = { urls: [] };
        break;
    }

    await createBlock.mutateAsync({
      project_id: projectId,
      type,
      data,
      sort_order: blocks.length,
    });
  };

  const handleBlockUpdate = async (blockId: string, data: ProjectBlock['data']) => {
    if (!projectId) return;
    await updateBlock.mutateAsync({ id: blockId, projectId, updates: { data } });
  };

  const handleBlockDelete = async (blockId: string) => {
    if (!projectId) return;
    await deleteBlock.mutateAsync({ id: blockId, projectId });
  };

  const moveBlock = async (index: number, direction: 'up' | 'down') => {
    if (!projectId) return;
    const newBlocks = [...blocks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newBlocks.length) return;
    
    [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];
    
    const updates = newBlocks.map((block, idx) => ({ id: block.id, sort_order: idx }));
    await reorderBlocks.mutateAsync({ projectId, blocks: updates });
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id || !projectId) return;

    const oldIndex = blocks.findIndex((b) => b.id === active.id);
    const newIndex = blocks.findIndex((b) => b.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const newBlocks = arrayMove(blocks, oldIndex, newIndex);
    setLocalBlocks(newBlocks);

    const updates = newBlocks.map((block, idx) => ({ id: block.id, sort_order: idx }));
    await reorderBlocks.mutateAsync({ projectId, blocks: updates });
  }, [blocks, projectId, reorderBlocks]);

  const handleSave = async () => {
    if (!title.trim()) {
      alert('Please enter a project title');
      return;
    }
    
    setSaving(true);
    try {
      if (projectId) {
        await updateProject.mutateAsync({
          id: projectId,
          updates: { title, year: parseInt(year), cover_url: coverUrl }
        });
      } else {
        const newProject = await createProject.mutateAsync({
          title,
          year: parseInt(year),
          cover_url: coverUrl
        });
        navigate(`/admin/projects/${newProject.id}`);
      }
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  };

  if (projectId && (loadingProject || loadingBlocks)) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const sidebarContent = (
    <div className="space-y-2">
      <p className="text-xs text-zinc-500 uppercase tracking-wide mb-3">Add Content</p>
      <button
        onClick={() => addBlock('image')}
        disabled={!projectId}
        className="w-full flex items-center gap-3 p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors text-left disabled:opacity-50"
        data-testid="button-add-image"
      >
        <div className="w-10 h-10 rounded-lg bg-zinc-700 flex items-center justify-center">
          <Image className="w-5 h-5 text-zinc-400" />
        </div>
        <span className="text-sm text-zinc-300">Image</span>
      </button>
      <button
        onClick={() => addBlock('text')}
        disabled={!projectId}
        className="w-full flex items-center gap-3 p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors text-left disabled:opacity-50"
        data-testid="button-add-text"
      >
        <div className="w-10 h-10 rounded-lg bg-zinc-700 flex items-center justify-center">
          <Type className="w-5 h-5 text-zinc-400" />
        </div>
        <span className="text-sm text-zinc-300">Text</span>
      </button>
      <button
        onClick={() => addBlock('video')}
        disabled={!projectId}
        className="w-full flex items-center gap-3 p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors text-left disabled:opacity-50"
        data-testid="button-add-video"
      >
        <div className="w-10 h-10 rounded-lg bg-zinc-700 flex items-center justify-center">
          <Video className="w-5 h-5 text-zinc-400" />
        </div>
        <span className="text-sm text-zinc-300">Video</span>
      </button>
      <button
        onClick={() => addBlock('grid')}
        disabled={!projectId}
        className="w-full flex items-center gap-3 p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors text-left disabled:opacity-50"
        data-testid="button-add-grid"
      >
        <div className="w-10 h-10 rounded-lg bg-zinc-700 flex items-center justify-center">
          <Grid3X3 className="w-5 h-5 text-zinc-400" />
        </div>
        <span className="text-sm text-zinc-300">Image Grid</span>
      </button>
      {!projectId && (
        <p className="text-xs text-zinc-600 mt-4 px-2">
          Save the project first to add content blocks
        </p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      <header className="sticky top-0 z-20 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800">
        <div className="px-4 md:px-6 py-3 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/admin')}
            className="text-zinc-400 hover:text-white"
            data-testid="button-back-to-list"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Project title"
            className="flex-1 max-w-md bg-transparent border-none text-xl text-white placeholder:text-zinc-600 focus-visible:ring-0 px-0"
            data-testid="input-project-title"
          />
          
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="w-24 bg-zinc-800 border-zinc-700" data-testid="select-year">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2023">2023</SelectItem>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2026">2026</SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700"
            data-testid="button-save-project"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save
          </Button>
        </div>
      </header>

      <div className="flex-1 flex">
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
              <div className="px-4 py-2 bg-zinc-800/50 border-b border-zinc-800">
                <span className="text-xs text-zinc-500 uppercase tracking-wide">Cover Image</span>
              </div>
              <div className="p-4">
                {coverUrl ? (
                  <div className="relative">
                    <img src={coverUrl} alt="Cover" className="w-full aspect-video object-cover rounded-lg" />
                    <label className="absolute top-2 right-2">
                      <Button size="sm" variant="secondary" asChild>
                        <span>{uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Replace'}</span>
                      </Button>
                      <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
                    </label>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-zinc-700 rounded-lg cursor-pointer hover:border-zinc-600 transition-colors">
                    {uploading ? (
                      <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
                    ) : (
                      <>
                        <Image className="w-10 h-10 text-zinc-600 mb-2" />
                        <span className="text-sm text-zinc-500">Upload cover image</span>
                      </>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
                  </label>
                )}
              </div>
            </div>

            {!isMobile ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={blocks.map((b) => b.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {blocks.map((block, index) => (
                    <SortableBlockEditor
                      key={block.id}
                      id={block.id}
                      block={block}
                      onUpdate={(data) => handleBlockUpdate(block.id, data)}
                      onDelete={() => handleBlockDelete(block.id)}
                      onMoveUp={() => moveBlock(index, 'up')}
                      onMoveDown={() => moveBlock(index, 'down')}
                      isFirst={index === 0}
                      isLast={index === blocks.length - 1}
                      isMobile={isMobile}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            ) : (
              blocks.map((block, index) => (
                <BlockEditor
                  key={block.id}
                  block={block}
                  onUpdate={(data) => handleBlockUpdate(block.id, data)}
                  onDelete={() => handleBlockDelete(block.id)}
                  onMoveUp={() => moveBlock(index, 'up')}
                  onMoveDown={() => moveBlock(index, 'down')}
                  isFirst={index === 0}
                  isLast={index === blocks.length - 1}
                  isMobile={isMobile}
                />
              ))
            )}

            {blocks.length === 0 && projectId && (
              <div className="text-center py-12 text-zinc-600">
                <p className="mb-2">No content blocks yet</p>
                <p className="text-sm">Use the sidebar to add content</p>
              </div>
            )}
          </div>
        </main>

        <aside className="hidden md:block w-64 border-l border-zinc-800 p-4 bg-zinc-900/50">
          {sidebarContent}
        </aside>
      </div>

      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800 p-4">
        <div className="flex gap-2 justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => addBlock('image')}
            disabled={!projectId}
            className="flex-1"
          >
            <Image className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => addBlock('text')}
            disabled={!projectId}
            className="flex-1"
          >
            <Type className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => addBlock('video')}
            disabled={!projectId}
            className="flex-1"
          >
            <Video className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => addBlock('grid')}
            disabled={!projectId}
            className="flex-1"
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function Admin() {
  const { user, loading: authLoading, signIn } = useAuth();
  const [matchList] = useRoute('/admin');
  const [matchNew] = useRoute('/admin/projects/new');
  const [matchEdit, params] = useRoute('/admin/projects/:id');

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!user) {
    return <LoginForm onLogin={signIn} />;
  }

  if (matchNew) {
    return <ProjectBuilder />;
  }

  if (matchEdit && params?.id) {
    return <ProjectBuilder projectId={params.id} />;
  }

  return <ProjectList />;
}
