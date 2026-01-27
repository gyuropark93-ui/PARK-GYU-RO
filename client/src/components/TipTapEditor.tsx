import { useEditor, EditorContent } from "@tiptap/react";
import Placeholder from "@tiptap/extension-placeholder";
import { useState, useEffect, useCallback } from "react";
import { getSharedExtensions } from "@/lib/tiptapExtensions";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  RemoveFormatting,
  ChevronDown,
  Eye,
  Edit2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

interface TipTapEditorProps {
  content: Record<string, unknown> | null;
  onChange: (json: Record<string, unknown>) => void;
}

const FONT_FAMILIES = [
  { label: "Helvetica", value: "Helvetica, Arial, sans-serif" },
  { label: "Inter", value: "Inter, sans-serif" },
  { label: "Pretendard", value: "Pretendard, -apple-system, sans-serif" },
];

const FONT_SIZES = [12, 14, 16, 18, 20, 24, 28, 32, 40, 48];

const HEADING_OPTIONS = [
  { label: "단락", value: "paragraph" },
  { label: "H1", value: 1 },
  { label: "H2", value: 2 },
  { label: "H3", value: 3 },
];

function MenuBar({ editor }: { editor: ReturnType<typeof useEditor> }) {
  const [linkUrl, setLinkUrl] = useState("");
  const [linkOpen, setLinkOpen] = useState(false);

  if (!editor) return null;

  const getCurrentFontFamily = () => {
    const attrs = editor.getAttributes("textStyle");
    const family = attrs.fontFamily || "";
    const match = FONT_FAMILIES.find((f) => f.value === family);
    return match?.label || "Helvetica";
  };

  const getCurrentFontSize = () => {
    const attrs = editor.getAttributes("textStyle");
    return attrs.fontSize || "16";
  };

  const getCurrentHeading = () => {
    if (editor.isActive("heading", { level: 1 })) return "H1";
    if (editor.isActive("heading", { level: 2 })) return "H2";
    if (editor.isActive("heading", { level: 3 })) return "H3";
    return "단락";
  };

  const setFontFamily = (value: string) => {
    editor.chain().focus().setFontFamily(value).run();
  };

  const setFontSize = (size: number) => {
    editor.chain().focus().setMark("textStyle", { fontSize: size }).run();
  };

  const setHeading = (value: string | number) => {
    if (value === "paragraph") {
      editor.chain().focus().setParagraph().run();
    } else {
      editor
        .chain()
        .focus()
        .toggleHeading({ level: value as 1 | 2 | 3 })
        .run();
    }
  };

  const handleSetLink = () => {
    if (linkUrl) {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: linkUrl })
        .run();
    } else {
      editor.chain().focus().unsetLink().run();
    }
    setLinkOpen(false);
    setLinkUrl("");
  };

  const openLinkPopover = () => {
    const previousUrl = editor.getAttributes("link").href || "";
    setLinkUrl(previousUrl);
    setLinkOpen(true);
  };

  return (
    <div
      className="flex flex-wrap gap-0.5 p-1.5 border-b border-zinc-700 bg-zinc-800/80 overflow-x-auto"
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-xs text-zinc-300 hover:bg-zinc-700 gap-1 min-w-[60px]"
            data-testid="heading-dropdown"
          >
            {getCurrentHeading()}
            <ChevronDown className="w-3 h-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-zinc-800 border-zinc-700">
          {HEADING_OPTIONS.map((opt) => (
            <DropdownMenuItem
              key={opt.label}
              onClick={() => setHeading(opt.value)}
              className="text-zinc-300 hover:bg-zinc-700 cursor-pointer"
            >
              {opt.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="w-px h-6 bg-zinc-600 mx-1 self-center" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-xs text-zinc-300 hover:bg-zinc-700 gap-1 min-w-[80px]"
            data-testid="font-family-dropdown"
          >
            {getCurrentFontFamily()}
            <ChevronDown className="w-3 h-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-zinc-800 border-zinc-700">
          {FONT_FAMILIES.map((font) => (
            <DropdownMenuItem
              key={font.value}
              onClick={() => setFontFamily(font.value)}
              className="text-zinc-300 hover:bg-zinc-700 cursor-pointer"
              style={{ fontFamily: font.value }}
            >
              {font.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-xs text-zinc-300 hover:bg-zinc-700 gap-1 min-w-[50px]"
            data-testid="font-size-dropdown"
          >
            {getCurrentFontSize()}
            <ChevronDown className="w-3 h-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-zinc-800 border-zinc-700 max-h-48 overflow-y-auto custom-scrollbar">
          {FONT_SIZES.map((size) => (
            <DropdownMenuItem
              key={size}
              onClick={() => setFontSize(size)}
              className="text-zinc-300 hover:bg-zinc-700 cursor-pointer"
            >
              {size}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="w-px h-6 bg-zinc-600 mx-1 self-center" />

      <Button
        type="button"
        size="icon"
        variant="ghost"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`h-7 w-7 ${editor.isActive("bold") ? "bg-zinc-600 text-white" : "text-zinc-400 hover:text-zinc-200"}`}
        title="Bold (Ctrl+B)"
        data-testid="format-bold"
      >
        <Bold className="w-4 h-4" />
      </Button>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`h-7 w-7 ${editor.isActive("italic") ? "bg-zinc-600 text-white" : "text-zinc-400 hover:text-zinc-200"}`}
        title="Italic (Ctrl+I)"
        data-testid="format-italic"
      >
        <Italic className="w-4 h-4" />
      </Button>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`h-7 w-7 ${editor.isActive("underline") ? "bg-zinc-600 text-white" : "text-zinc-400 hover:text-zinc-200"}`}
        title="Underline (Ctrl+U)"
        data-testid="format-underline"
      >
        <UnderlineIcon className="w-4 h-4" />
      </Button>

      <div className="w-px h-6 bg-zinc-600 mx-1 self-center" />

      <Button
        type="button"
        size="icon"
        variant="ghost"
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        className={`h-7 w-7 ${editor.isActive({ textAlign: "left" }) ? "bg-zinc-600 text-white" : "text-zinc-400 hover:text-zinc-200"}`}
        data-testid="align-left"
      >
        <AlignLeft className="w-4 h-4" />
      </Button>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        className={`h-7 w-7 ${editor.isActive({ textAlign: "center" }) ? "bg-zinc-600 text-white" : "text-zinc-400 hover:text-zinc-200"}`}
        data-testid="align-center"
      >
        <AlignCenter className="w-4 h-4" />
      </Button>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        className={`h-7 w-7 ${editor.isActive({ textAlign: "right" }) ? "bg-zinc-600 text-white" : "text-zinc-400 hover:text-zinc-200"}`}
        data-testid="align-right"
      >
        <AlignRight className="w-4 h-4" />
      </Button>

      <div className="w-px h-6 bg-zinc-600 mx-1 self-center" />

      <Button
        type="button"
        size="icon"
        variant="ghost"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`h-7 w-7 ${editor.isActive("bulletList") ? "bg-zinc-600 text-white" : "text-zinc-400 hover:text-zinc-200"}`}
        data-testid="list-bullet"
      >
        <List className="w-4 h-4" />
      </Button>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`h-7 w-7 ${editor.isActive("orderedList") ? "bg-zinc-600 text-white" : "text-zinc-400 hover:text-zinc-200"}`}
        data-testid="list-ordered"
      >
        <ListOrdered className="w-4 h-4" />
      </Button>

      <div className="w-px h-6 bg-zinc-600 mx-1 self-center" />

      <Popover open={linkOpen} onOpenChange={setLinkOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={openLinkPopover}
            className={`h-7 w-7 ${editor.isActive("link") ? "bg-zinc-600 text-white" : "text-zinc-400 hover:text-zinc-200"}`}
            data-testid="insert-link"
          >
            <LinkIcon className="w-4 h-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 bg-zinc-800 border-zinc-700 p-3">
          <div className="flex flex-col gap-2">
            <label className="text-xs text-zinc-400">URL</label>
            <Input
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com"
              className="h-8 text-sm bg-zinc-900 border-zinc-600 text-zinc-200"
              onKeyDown={(e) => e.key === "Enter" && handleSetLink()}
              data-testid="link-url-input"
            />
            <div className="flex gap-2 mt-1">
              <Button
                type="button"
                size="sm"
                onClick={handleSetLink}
                className="flex-1 h-7 text-xs"
                data-testid="link-apply"
              >
                Apply
              </Button>
              {editor.isActive("link") && (
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    editor.chain().focus().unsetLink().run();
                    setLinkOpen(false);
                  }}
                  className="h-7 text-xs"
                  data-testid="link-remove"
                >
                  Remove
                </Button>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <Button
        type="button"
        size="icon"
        variant="ghost"
        onClick={() =>
          editor.chain().focus().clearNodes().unsetAllMarks().run()
        }
        className="h-7 w-7 text-zinc-400 hover:text-zinc-200"
        title="Clear formatting"
        data-testid="clear-formatting"
      >
        <RemoveFormatting className="w-4 h-4" />
      </Button>
    </div>
  );
}

function PreviewContent({
  content,
}: {
  content: Record<string, unknown> | null;
}) {
  const editor = useEditor({
    extensions: getSharedExtensions(false),
    content: content || { type: "doc", content: [] },
    editable: false,
  });

  useEffect(() => {
    if (editor && content) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) return null;

  return (
    <div className="prose prose-invert prose-sm max-w-none p-4 tiptap-preview">
      <EditorContent editor={editor} />
    </div>
  );
}

export function TipTapEditor({ content, onChange }: TipTapEditorProps) {
  const [isPreview, setIsPreview] = useState(false);

  const editor = useEditor({
    extensions: [
      ...getSharedExtensions(true),
      Placeholder.configure({
        placeholder: "Start typing your content...",
      }),
    ],
    content: content || { type: "doc", content: [] },
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
    <div
      className="rounded-lg border border-zinc-700 bg-zinc-800 overflow-hidden tiptap-editor"
      onMouseDown={handleMouseDown}
    >
      <div className="flex items-center justify-between px-2 py-1 bg-zinc-800 border-b border-zinc-700">
        <span className="text-xs text-zinc-500">Rich Text</span>
        <div className="flex gap-1">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setIsPreview(false)}
            className={`h-6 px-2 text-xs ${!isPreview ? "bg-zinc-700 text-white" : "text-zinc-400"}`}
            data-testid="editor-mode-edit"
          >
            <Edit2 className="w-3 h-3 mr-1" />
            Edit
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setIsPreview(true)}
            className={`h-6 px-2 text-xs ${isPreview ? "bg-zinc-700 text-white" : "text-zinc-400"}`}
            data-testid="editor-mode-preview"
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

export function TipTapRenderer({
  content,
}: {
  content: Record<string, unknown> | null;
}) {
  const editor = useEditor({
    extensions: getSharedExtensions(false),
    content: content || { type: "doc", content: [] },
    editable: false,
  });

  useEffect(() => {
    if (editor && content) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) return null;

  return (
    <div className="prose prose-invert max-w-none tiptap-content">
      <EditorContent editor={editor} />
    </div>
  );
}
