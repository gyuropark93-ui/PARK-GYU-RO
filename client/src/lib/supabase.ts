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
  thumbnail_url: string;
  video_url: string | null;
  description: string;
  created_at: string;
}

export type ProjectInsert = Omit<Project, 'id' | 'created_at'>;
export type ProjectUpdate = Partial<ProjectInsert>;
