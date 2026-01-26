import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useState, useEffect, useCallback } from 'react';
import { Bold, Italic, List, ListOrdered, Heading2, Eye, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TipTapEditorProps {
  content: Record<string, unknown> | null;
  onChange: (json: Record<string, unknown>) => void;
}

function MenuBar({ editor }: { editor: ReturnType<typeof useEditor> }) {
  if (!editor) return null;

  return (
    <div className="flex flex-wrap gap-1 p-2 border-b border-zinc-700 bg-zinc-800/50">
      <Button
        type="button"
        size="icon"
        variant="ghost"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`h-7 w-7 ${editor.isActive('bold') ? 'bg-zinc-700 text-white' : 'text-zinc-400'}`}
      >
        <Bold className="w-4 h-4" />
      </Button>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`h-7 w-7 ${editor.isActive('italic') ? 'bg-zinc-700 text-white' : 'text-zinc-400'}`}
      >
        <Italic className="w-4 h-4" />
      </Button>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`h-7 w-7 ${editor.isActive('heading', { level: 2 }) ? 'bg-zinc-700 text-white' : 'text-zinc-400'}`}
      >
        <Heading2 className="w-4 h-4" />
      </Button>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`h-7 w-7 ${editor.isActive('bulletList') ? 'bg-zinc-700 text-white' : 'text-zinc-400'}`}
      >
        <List className="w-4 h-4" />
      </Button>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`h-7 w-7 ${editor.isActive('orderedList') ? 'bg-zinc-700 text-white' : 'text-zinc-400'}`}
      >
        <ListOrdered className="w-4 h-4" />
      </Button>
    </div>
  );
}

function PreviewContent({ content }: { content: Record<string, unknown> | null }) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: content || { type: 'doc', content: [] },
    editable: false,
  });

  useEffect(() => {
    if (editor && content) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) return null;

  return (
    <div className="prose prose-invert prose-sm max-w-none p-4">
      <EditorContent editor={editor} />
    </div>
  );
}

export function TipTapEditor({ content, onChange }: TipTapEditorProps) {
  const [isPreview, setIsPreview] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Start typing your content...',
      }),
    ],
    content: content || { type: 'doc', content: [] },
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON());
    },
  });

  useEffect(() => {
    if (editor && content && !editor.isFocused) {
      const currentContent = JSON.stringify(editor.getJSON());
      const newContent = JSON.stringify(content);
      if (currentContent !== newContent) {
        editor.commands.setContent(content);
      }
    }
  }, [content, editor]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  return (
    <div className="rounded-lg border border-zinc-700 bg-zinc-800 overflow-hidden" onMouseDown={handleMouseDown}>
      <div className="flex items-center justify-between px-2 py-1 bg-zinc-800 border-b border-zinc-700">
        <span className="text-xs text-zinc-500">Rich Text</span>
        <div className="flex gap-1">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setIsPreview(false)}
            className={`h-6 px-2 text-xs ${!isPreview ? 'bg-zinc-700 text-white' : 'text-zinc-400'}`}
          >
            <Edit2 className="w-3 h-3 mr-1" />
            Edit
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setIsPreview(true)}
            className={`h-6 px-2 text-xs ${isPreview ? 'bg-zinc-700 text-white' : 'text-zinc-400'}`}
          >
            <Eye className="w-3 h-3 mr-1" />
            Preview
          </Button>
        </div>
      </div>

      {isPreview ? (
        <PreviewContent content={content} />
      ) : (
        <>
          <MenuBar editor={editor} />
          <div className="min-h-[120px] p-4">
            <EditorContent 
              editor={editor} 
              className="prose prose-invert prose-sm max-w-none focus:outline-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[80px] [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-zinc-500 [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none"
            />
          </div>
        </>
      )}
    </div>
  );
}
