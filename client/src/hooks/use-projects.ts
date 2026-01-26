import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, Project, ProjectInsert, ProjectUpdate, ProjectBlock, ProjectBlockInsert, ProjectBlockUpdate } from '@/lib/supabase';

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('year', { ascending: false })
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Project[];
    },
  });
}

export function useProject(id: string | undefined) {
  return useQuery({
    queryKey: ['projects', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as Project;
    },
    enabled: !!id,
  });
}

export function useProjectsByYear(year: number) {
  return useQuery({
    queryKey: ['projects', 'year', year],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('year', year)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Project[];
    },
    enabled: year >= 2023 && year <= 2026,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (project: ProjectInsert) => {
      const { data, error } = await supabase
        .from('projects')
        .insert(project)
        .select()
        .single();
      
      if (error) throw error;
      return data as Project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: ProjectUpdate }) => {
      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Project;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects', variables.id] });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useProjectBlocks(projectId: string | undefined) {
  return useQuery({
    queryKey: ['project_blocks', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      const { data, error } = await supabase
        .from('project_blocks')
        .select('*')
        .eq('project_id', projectId)
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      return data as ProjectBlock[];
    },
    enabled: !!projectId,
  });
}

export function useCreateBlock() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (block: ProjectBlockInsert) => {
      const { data, error } = await supabase
        .from('project_blocks')
        .insert(block)
        .select()
        .single();
      
      if (error) throw error;
      return data as ProjectBlock;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['project_blocks', variables.project_id] });
    },
  });
}

export function useUpdateBlock() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, projectId, updates }: { id: string; projectId: string; updates: ProjectBlockUpdate }) => {
      const { data, error } = await supabase
        .from('project_blocks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as ProjectBlock;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['project_blocks', variables.projectId] });
    },
  });
}

export function useDeleteBlock() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, projectId }: { id: string; projectId: string }) => {
      const { error } = await supabase
        .from('project_blocks')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['project_blocks', variables.projectId] });
    },
  });
}

export function useReorderBlocks() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ projectId, blocks }: { projectId: string; blocks: { id: string; sort_order: number }[] }) => {
      const updates = blocks.map((block) =>
        supabase
          .from('project_blocks')
          .update({ sort_order: block.sort_order })
          .eq('id', block.id)
      );
      
      await Promise.all(updates);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['project_blocks', variables.projectId] });
    },
  });
}

export async function uploadImage(file: File, folder: string = 'images'): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = `${folder}/${fileName}`;

  const { error } = await supabase.storage
    .from('project-assets')
    .upload(filePath, file);

  if (error) throw error;

  const { data } = supabase.storage
    .from('project-assets')
    .getPublicUrl(filePath);

  return data.publicUrl;
}

export const uploadThumbnail = (file: File) => uploadImage(file, 'covers');
