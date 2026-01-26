export type VideoProvider = 'youtube' | 'vimeo' | 'unknown';

export interface EmbedResult {
  embedUrl: string | null;
  provider: VideoProvider;
  error?: string;
}

export function toEmbedUrl(raw: string): EmbedResult {
  if (!raw || typeof raw !== 'string') {
    return { embedUrl: null, provider: 'unknown', error: 'No URL provided' };
  }

  const trimmed = raw.trim();
  if (!trimmed) {
    return { embedUrl: null, provider: 'unknown', error: 'Empty URL' };
  }

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return { embedUrl: null, provider: 'unknown', error: 'Invalid URL format' };
  }

  const hostname = url.hostname.toLowerCase().replace(/^www\./, '');

  if (hostname === 'youtube.com' || hostname === 'youtu.be') {
    let videoId: string | null = null;

    if (hostname === 'youtu.be') {
      videoId = url.pathname.slice(1).split('/')[0] || null;
    } else if (url.pathname.startsWith('/watch')) {
      videoId = url.searchParams.get('v');
    } else if (url.pathname.startsWith('/embed/')) {
      videoId = url.pathname.replace('/embed/', '').split('/')[0] || null;
    } else if (url.pathname.startsWith('/shorts/')) {
      videoId = url.pathname.replace('/shorts/', '').split('/')[0] || null;
    }

    if (!videoId || videoId.length < 5) {
      return { embedUrl: null, provider: 'youtube', error: 'Could not extract YouTube video ID' };
    }

    return {
      embedUrl: `https://www.youtube.com/embed/${videoId}`,
      provider: 'youtube'
    };
  }

  if (hostname === 'vimeo.com' || hostname === 'player.vimeo.com') {
    let videoId: string | null = null;

    if (hostname === 'player.vimeo.com') {
      const match = url.pathname.match(/\/video\/(\d+)/);
      videoId = match ? match[1] : null;
    } else {
      const match = url.pathname.match(/^\/(\d+)/);
      videoId = match ? match[1] : null;
    }

    if (!videoId) {
      return { embedUrl: null, provider: 'vimeo', error: 'Could not extract Vimeo video ID' };
    }

    return {
      embedUrl: `https://player.vimeo.com/video/${videoId}`,
      provider: 'vimeo'
    };
  }

  return { embedUrl: null, provider: 'unknown', error: 'Unsupported video platform. Use YouTube or Vimeo.' };
}

export function getAspectRatioClass(aspect: '16:9' | '4:3' | '1:1' = '16:9'): string {
  switch (aspect) {
    case '4:3': return 'aspect-[4/3]';
    case '1:1': return 'aspect-square';
    default: return 'aspect-video';
  }
}
