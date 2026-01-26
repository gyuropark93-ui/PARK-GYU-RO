import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useProjects, useCreateProject, useUpdateProject, useDeleteProject, uploadThumbnail } from '@/hooks/use-projects';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Pencil, Trash2, LogOut, Plus, ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';
import type { Project, ProjectInsert } from '@/lib/supabase';

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
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="font-display text-2xl text-center">Admin Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              data-testid="input-email"
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              data-testid="input-password"
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading} data-testid="button-login">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign In'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

interface ProjectFormProps {
  initial?: Project;
  onSubmit: (data: ProjectInsert) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
}

function ProjectForm({ initial, onSubmit, onCancel, loading }: ProjectFormProps) {
  const [year, setYear] = useState(initial?.year?.toString() || '2026');
  const [title, setTitle] = useState(initial?.title || '');
  const [thumbnailUrl, setThumbnailUrl] = useState(initial?.thumbnail_url || '');
  const [videoUrl, setVideoUrl] = useState(initial?.video_url || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    try {
      const url = await uploadThumbnail(file);
      setThumbnailUrl(url);
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      year: parseInt(year),
      title,
      thumbnail_url: thumbnailUrl,
      video_url: videoUrl || null,
      description,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm text-muted-foreground">Year</label>
        <Select value={year} onValueChange={setYear}>
          <SelectTrigger data-testid="select-year">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2023">2023</SelectItem>
            <SelectItem value="2024">2024</SelectItem>
            <SelectItem value="2025">2025</SelectItem>
            <SelectItem value="2026">2026</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <label className="text-sm text-muted-foreground">Title</label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Project title"
          required
          data-testid="input-title"
        />
      </div>

      <div>
        <label className="text-sm text-muted-foreground">Thumbnail</label>
        <div className="flex gap-2">
          <Input
            value={thumbnailUrl}
            onChange={(e) => setThumbnailUrl(e.target.value)}
            placeholder="Image URL or upload"
            className="flex-1"
            data-testid="input-thumbnail"
          />
          <label className="cursor-pointer">
            <Button type="button" variant="outline" disabled={uploading} asChild>
              <span>
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Upload'}
              </span>
            </Button>
            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </label>
        </div>
        {thumbnailUrl && (
          <img src={thumbnailUrl} alt="Preview" className="mt-2 h-24 rounded object-cover" />
        )}
      </div>

      <div>
        <label className="text-sm text-muted-foreground">Video URL (optional)</label>
        <Input
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          placeholder="YouTube or Vimeo embed URL"
          data-testid="input-video"
        />
      </div>

      <div>
        <label className="text-sm text-muted-foreground">Description</label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Project description"
          rows={4}
          required
          data-testid="input-description"
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={loading || uploading} data-testid="button-save">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : initial ? 'Update' : 'Create'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

export default function Admin() {
  const { user, loading: authLoading, signIn, signOut } = useAuth();
  const { data: projects, isLoading: projectsLoading } = useProjects();
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();
  
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <LoginForm onLogin={signIn} />;
  }

  const handleCreate = async (data: ProjectInsert) => {
    await createProject.mutateAsync(data);
    setIsCreating(false);
  };

  const handleUpdate = async (data: ProjectInsert) => {
    if (!editingProject) return;
    await updateProject.mutateAsync({ id: editingProject.id, updates: data });
    setEditingProject(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this project?')) return;
    await deleteProject.mutateAsync(id);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" data-testid="button-back">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="font-display text-3xl font-bold">Project Admin</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user.email}</span>
            <Button variant="outline" onClick={signOut} data-testid="button-logout">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {editingProject ? 'Edit Project' : 'New Project'}
                {!isCreating && !editingProject && (
                  <Button size="sm" onClick={() => setIsCreating(true)} data-testid="button-new">
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(isCreating || editingProject) && (
                <ProjectForm
                  initial={editingProject || undefined}
                  onSubmit={editingProject ? handleUpdate : handleCreate}
                  onCancel={() => {
                    setIsCreating(false);
                    setEditingProject(null);
                  }}
                  loading={createProject.isPending || updateProject.isPending}
                />
              )}
              {!isCreating && !editingProject && (
                <p className="text-muted-foreground text-sm">
                  Click "Add" to create a new project
                </p>
              )}
            </CardContent>
          </Card>

          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>All Projects</CardTitle>
              </CardHeader>
              <CardContent>
                {projectsLoading && (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                )}
                
                {projects && projects.length === 0 && (
                  <p className="text-muted-foreground text-center py-8">No projects yet</p>
                )}

                {projects && projects.length > 0 && (
                  <div className="space-y-3">
                    {projects.map((project) => (
                      <div
                        key={project.id}
                        className="flex items-center gap-4 p-3 rounded-lg bg-secondary/30"
                      >
                        <img
                          src={project.thumbnail_url}
                          alt={project.title}
                          className="w-16 h-10 rounded object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{project.title}</p>
                          <p className="text-sm text-muted-foreground">{project.year}</p>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              setEditingProject(project);
                              setIsCreating(false);
                            }}
                            data-testid={`button-edit-${project.id}`}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDelete(project.id)}
                            disabled={deleteProject.isPending}
                            data-testid={`button-delete-${project.id}`}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
