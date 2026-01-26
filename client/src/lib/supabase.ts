import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables not set. Some features may not work.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
);

export interface Project {
  id: string;
  year: number;
  title: string;
  cover_url: string;
  created_at: string;
}

export type ProjectInsert = Omit<Project, 'id' | 'created_at'>;
export type ProjectUpdate = Partial<ProjectInsert>;

export type BlockType = 'image' | 'text' | 'video' | 'grid';

export interface ImageBlockData {
  url: string;
}

export interface TextBlockData {
  markdown: string;
}

export interface VideoBlockData {
  embedUrl: string;
}

export interface GridBlockData {
  urls: string[];
}

export type BlockData = ImageBlockData | TextBlockData | VideoBlockData | GridBlockData;

export interface ProjectBlock {
  id: string;
  project_id: string;
  sort_order: number;
  type: BlockType;
  data: BlockData;
  created_at: string;
}

export type ProjectBlockInsert = Omit<ProjectBlock, 'id' | 'created_at'>;
export type ProjectBlockUpdate = Partial<Omit<ProjectBlock, 'id' | 'project_id' | 'created_at'>>;
