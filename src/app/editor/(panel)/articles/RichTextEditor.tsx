"use client";

import { EditorContent, useEditor, useEditorState, type Editor, type JSONContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Youtube from "@tiptap/extension-youtube";
import { Placeholder } from "@tiptap/extensions";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import { useRef, useState } from "react";
import { uploadFile } from "../../upload-client";
import { Cite, QUOTE_STYLES, QuoteStyle, Small, Sources } from "./extensions";

export type EditorValue = { html: string; json: JSONContent | null };

export function RichTextEditor({
  initialContent,
  onChange,
}: {
  initialContent: JSONContent | string | null;
  onChange: (value: EditorValue) => void;
}) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        link: { openOnClick: false, autolink: true, defaultProtocol: "https" },
      }),
      Image,
      Youtube.configure({ nocookie: true, modestBranding: true }),
      Placeholder.configure({ placeholder: "Start writing your article…" }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Highlight,
      Small,
      Cite,
      QuoteStyle,
      Sources,
    ],
    content: initialContent ?? "",
    editorProps: {
      attributes: { class: "article-body tiptap px-5 py-6 sm:px-8" },
    },
    onUpdate: ({ editor }) => onChange({ html: editor.getHTML(), json: editor.getJSON() }),
  });

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-bg">
      {editor && <Toolbar editor={editor} />}
      <EditorContent editor={editor} />
    </div>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      underline: e.isActive("underline"),
      strike: e.isActive("strike"),
      block: e.isActive("heading", { level: 2 })
        ? "h2"
        : e.isActive("heading", { level: 3 })
          ? "h3"
          : e.isActive("heading", { level: 4 })
            ? "h4"
            : "p",
      highlight: e.isActive("highlight"),
      small: e.isActive("small"),
      cite: e.isActive("cite"),
      sources: e.isActive("sources"),
      quoteVariant: (e.getAttributes("blockquote").variant as string | null) ?? "",
      align: (["center", "right", "justify"] as const).find((a) => e.isActive({ textAlign: a })) ?? "left",
      bullet: e.isActive("bulletList"),
      ordered: e.isActive("orderedList"),
      quote: e.isActive("blockquote"),
      link: e.isActive("link"),
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
    }),
  });

  const setLink = () => {
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL (leave empty to remove)", previous ?? "https://");
    if (url === null) return;
    if (url.trim() === "" || url === "https://") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
    }
  };

  const addVideo = () => {
    const url = window.prompt("YouTube video URL");
    if (url) editor.chain().focus().setYoutubeVideo({ src: url.trim() }).run();
  };

  const onImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const src = await uploadFile(file);
      const alt = window.prompt("Short image description (for accessibility)", "") ?? "";
      editor.chain().focus().setImage({ src, alt }).run();
    } catch (error) {
      alert((error as Error).message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="sticky top-0 z-10 flex flex-wrap items-center gap-1 border-b border-line bg-surface px-2 py-2">
      <select
        aria-label="Text style"
        title="Text style"
        value={state.block}
        onChange={(e) => {
          const v = e.target.value;
          const chain = editor.chain().focus();
          if (v === "p") chain.setParagraph().run();
          else chain.setHeading({ level: Number(v.slice(1)) as 2 | 3 | 4 }).run();
        }}
        className="rounded border border-line bg-bg px-2 py-1.5 text-sm font-semibold text-ink"
      >
        <option value="p">Paragraph</option>
        <option value="h2">Heading 2</option>
        <option value="h3">Heading 3</option>
        <option value="h4">Heading 4</option>
      </select>
      <Sep />
      <Btn label="Bold" active={state.bold} onClick={() => editor.chain().focus().toggleBold().run()}>
        <b>B</b>
      </Btn>
      <Btn label="Italic" active={state.italic} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <i>I</i>
      </Btn>
      <Btn label="Underline" active={state.underline} onClick={() => editor.chain().focus().toggleUnderline().run()}>
        <u>U</u>
      </Btn>
      <Btn label="Strikethrough" active={state.strike} onClick={() => editor.chain().focus().toggleStrike().run()}>
        <s>S</s>
      </Btn>
      <Btn label="Highlight (yellow marker)" active={state.highlight} onClick={() => editor.chain().focus().toggleHighlight().run()}>
        <span className="rounded-sm bg-accent/40 px-1 text-ink">H</span>
      </Btn>
      <Btn label="Small text" active={state.small} onClick={() => editor.chain().focus().toggleMark("small").run()}>
        <span className="text-xs">aA</span>
      </Btn>
      <Btn label="Link" active={state.link} onClick={setLink}>
        Link
      </Btn>
      <Sep />
      {(["left", "center", "right"] as const).map((a) => (
        <Btn key={a} label={`Align ${a}`} active={state.align === a} onClick={() => editor.chain().focus().setTextAlign(a).run()}>
          <AlignIcon align={a} />
        </Btn>
      ))}
      <Sep />
      <Btn label="Bullet list" active={state.bullet} onClick={() => editor.chain().focus().toggleBulletList().run()}>
        • List
      </Btn>
      <Btn label="Numbered list" active={state.ordered} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
        1. List
      </Btn>
      <Btn label="Quote" active={state.quote} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
        “ Quote
      </Btn>
      {state.quote && (
        <>
          <select
            aria-label="Quote style"
            title="Quote style"
            value={state.quoteVariant}
            onChange={(e) =>
              editor.chain().focus().updateAttributes("blockquote", { variant: e.target.value || null }).run()
            }
            className="rounded border border-accent bg-bg px-2 py-1.5 text-sm font-semibold text-ink"
          >
            {QUOTE_STYLES.map((q) => (
              <option key={q.label} value={q.value ?? ""}>
                {q.label}
              </option>
            ))}
          </select>
          <Btn label="Mark selected text as the quote's author" active={state.cite} onClick={() => editor.chain().focus().toggleMark("cite").run()}>
            — Author
          </Btn>
        </>
      )}
      <Btn
        label={state.sources ? "Remove the Sources box (keeps the text)" : "Sources box (small text for links and references)"}
        active={state.sources}
        onClick={() => {
          if (state.sources) editor.chain().focus().lift("sources").run();
          else
            editor
              .chain()
              .focus()
              .insertContent({
                type: "sources",
                content: [{ type: "bulletList", content: [{ type: "listItem", content: [{ type: "paragraph" }] }] }],
              })
              .run();
        }}
      >
        Sources
      </Btn>
      <Btn label="Divider" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
        —
      </Btn>
      <Sep />
      <Btn label="Insert image" onClick={() => fileInput.current?.click()} disabled={uploading}>
        {uploading ? "Uploading…" : "Image"}
      </Btn>
      <Btn label="Embed YouTube video" onClick={addVideo}>
        Video
      </Btn>
      <Sep />
      <Btn label="Undo" onClick={() => editor.chain().focus().undo().run()} disabled={!state.canUndo}>
        ↶
      </Btn>
      <Btn label="Redo" onClick={() => editor.chain().focus().redo().run()} disabled={!state.canRedo}>
        ↷
      </Btn>
      <input ref={fileInput} type="file" accept="image/*" hidden onChange={onImage} />
    </div>
  );
}

function Btn({
  label,
  active = false,
  disabled = false,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={`min-w-9 rounded px-2.5 py-1.5 text-sm font-semibold transition-colors disabled:opacity-40 ${
        active ? "bg-accent text-accent-ink" : "text-ink-soft hover:bg-surface-2 hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

function Sep() {
  return <span className="mx-1 h-5 w-px bg-line" aria-hidden />;
}

function AlignIcon({ align }: { align: "left" | "center" | "right" }) {
  const lines = { left: ["M4 6h16", "M4 12h10", "M4 18h13"], center: ["M4 6h16", "M7 12h10", "M5.5 18h13"], right: ["M4 6h16", "M10 12h10", "M7 18h13"] }[align];
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden>
      {lines.map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}
