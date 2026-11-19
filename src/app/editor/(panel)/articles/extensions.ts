import { Extension, Mark, mergeAttributes, Node } from "@tiptap/core";

/**
 * "Surse" box at the end of an article: smaller, quieter text for links and references.
 * The "Surse" heading comes from CSS, so writers only type the list.
 */
export const Sources = Node.create({
  name: "sources",
  group: "block",
  content: "block+",
  defining: true,
  parseHTML: () => [{ tag: "aside[data-sources]" }],
  renderHTML: ({ HTMLAttributes }) => [
    "aside",
    mergeAttributes(HTMLAttributes, { "data-sources": "", class: "article-sources" }),
    0,
  ],
});

/** Smaller text for asides, captions or credits inside a paragraph. */
export const Small = Mark.create({
  name: "small",
  parseHTML: () => [{ tag: "small" }],
  renderHTML: ({ HTMLAttributes }) => ["small", HTMLAttributes, 0],
});

/** Who said it: the author line of a quote. */
export const Cite = Mark.create({
  name: "cite",
  parseHTML: () => [{ tag: "cite" }],
  renderHTML: ({ HTMLAttributes }) => ["cite", HTMLAttributes, 0],
});

export const QUOTE_STYLES = [
  { value: null, label: "Classic" },
  { value: "pull", label: "Big (pull quote)" },
  { value: "box", label: "Box" },
  { value: "chat", label: "Speech bubble" },
] as const;

/** Lets a quote pick one of the QUOTE_STYLES (stored as data-variant). */
export const QuoteStyle = Extension.create({
  name: "quoteStyle",
  addGlobalAttributes: () => [
    {
      types: ["blockquote"],
      attributes: {
        variant: {
          default: null,
          parseHTML: (element) => element.getAttribute("data-variant"),
          renderHTML: (attributes) => (attributes.variant ? { "data-variant": attributes.variant } : {}),
        },
      },
    },
  ],
});
