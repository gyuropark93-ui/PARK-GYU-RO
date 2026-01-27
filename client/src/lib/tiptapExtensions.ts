import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import { TextStyle } from "@tiptap/extension-text-style";
import FontFamily from "@tiptap/extension-font-family";

export const FontSize = TextStyle.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      fontSize: {
        default: null,
        parseHTML: (element: HTMLElement) =>
          element.style.fontSize?.replace("px", ""),
        renderHTML: (attributes: Record<string, unknown>) => {
          if (!attributes.fontSize) return {};
          return { style: `font-size: ${attributes.fontSize}px` };
        },
      },
    };
  },
});

export function getSharedExtensions(editable: boolean = true) {
  return [
    StarterKit,
    Underline,
    TextAlign.configure({ types: ["heading", "paragraph"] }),
    Link.configure({
      openOnClick: !editable,
      HTMLAttributes: {
        class: "text-blue-400 underline cursor-pointer",
        target: "_blank",
        rel: "noopener noreferrer",
      },
    }),
    FontSize,
    FontFamily,
  ];
}
