"use client";

import { EditorContent, useEditor, useEditorState, type Editor, type JSONContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Youtube from "@tiptap/extension-youtube";
import { Placeholder } from "@tiptap/extensions";
import { useRef, useState } from "react";
import { uploadFile } from "../../upload-client";

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
      h2: e.isActive("heading", { level: 2 }),
      h3: e.isActive("heading", { level: 3 }),
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
      <Btn label="Heading 2" active={state.h2} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
        H2
      </Btn>
      <Btn label="Heading 3" active={state.h3} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
        H3
      </Btn>
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
      <Btn label="Link" active={state.link} onClick={setLink}>
        Link
      </Btn>
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
