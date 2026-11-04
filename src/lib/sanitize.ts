import "server-only";
import sanitizeHtml from "sanitize-html";

// Only the markup the editor can produce is allowed through.
export function sanitizeArticleHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      "p", "br", "h2", "h3", "h4", "strong", "b", "em", "i", "u", "s", "a",
      "ul", "ol", "li", "blockquote", "code", "pre", "hr", "img", "div", "iframe",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt", "title"],
      div: ["data-youtube-video"],
      iframe: ["src", "width", "height", "allowfullscreen", "allow", "frameborder"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowedIframeHostnames: ["www.youtube.com", "www.youtube-nocookie.com"],
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { target: "_blank", rel: "noopener noreferrer nofollow" }),
    },
  });
}
