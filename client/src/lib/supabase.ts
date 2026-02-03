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
  cover_url: string | null;
  created_at: string;
  updated_at?: string;
  sort_order?: number;
}

export type ProjectInsert = Omit<Project, 'id' | 'created_at' | 'updated_at'>;
export type ProjectUpdate = Partial<ProjectInsert> & { updated_at?: string };

export type BlockType = 'image' | 'text' | 'video' | 'grid' | 'divider' | 'spacer';

export interface BlockLayout {
  align?: 'left' | 'center' | 'right';
  width?: 'normal' | 'wide' | 'full';
  padTop?: number;
  padBottom?: number;
  bg?: 'none' | 'card';
}

export interface ImageBlockData {
  url: string;
  caption?: string;
  fit?: 'cover' | 'contain';
  position?: 'center' | 'top' | 'bottom';
  layout?: BlockLayout;
  mediaType?: 'image' | 'gif' | 'video';
  videoOptions?: {
    mode: 'autoplay' | 'click';
    loop?: boolean;
  };
}

export interface TextBlockData {
  markdown?: string;
  json?: Record<string, unknown>;
  layout?: BlockLayout;
}

export interface VideoBlockData {
  originalUrl?: string;
  embedUrl: string;
  aspect?: '16:9' | '4:3' | '1:1';
  lazyPreview?: boolean;
  layout?: BlockLayout;
}

export interface GridBlockData {
  urls: string[];
  columnsDesktop?: number;
  columnsMobile?: number;
  gap?: number;
  layout?: BlockLayout;
}

export interface DividerBlockData {
  style?: 'solid' | 'dashed';
  thickness?: number;
  opacity?: number;
  width?: 'normal' | 'wide' | 'full';
  layout?: BlockLayout;
}

export interface SpacerBlockData {
  height?: number;
  layout?: BlockLayout;
}

export type BlockData = ImageBlockData | TextBlockData | VideoBlockData | GridBlockData | DividerBlockData | SpacerBlockData;

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
