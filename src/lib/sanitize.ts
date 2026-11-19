import "server-only";
import sanitizeHtml from "sanitize-html";

// Only the markup the editor can produce is allowed through.
export function sanitizeArticleHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      "p", "br", "h2", "h3", "h4", "strong", "b", "em", "i", "u", "s", "a",
      "ul", "ol", "li", "blockquote", "code", "pre", "hr", "img", "div", "iframe",
      "small", "cite", "mark", "aside",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt", "title"],
      div: ["data-youtube-video"],
      p: ["style"],
      h2: ["style"],
      h3: ["style"],
      h4: ["style"],
      blockquote: ["data-variant"],
      aside: ["data-sources", "class"],
      iframe: ["src", "width", "height", "allowfullscreen", "allow", "frameborder"],
    },
    allowedClasses: { aside: ["article-sources"] },
    // Only text alignment survives from inline styles.
    allowedStyles: {
      "*": { "text-align": [/^(left|right|center|justify)$/] },
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowedIframeHostnames: ["www.youtube.com", "www.youtube-nocookie.com"],
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { target: "_blank", rel: "noopener noreferrer nofollow" }),
    },
  });
}
