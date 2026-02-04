const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

// Minimal markdown support for admin-authored content.
// Supported:
// - **bold**
// - _italic_
// - [text](url)
// - newlines -> <br/>
export const markdownToSafeHtml = (markdown: string) => {
  let html = escapeHtml(markdown);

  // Links: [label](https://example.com)
  html = html.replaceAll(
    /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-amber-600 underline underline-offset-4">$1</a>',
  );

  // Bold: **text**
  html = html.replaceAll(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");

  // Italic: _text_
  html = html.replaceAll(/_([^_]+)_/g, "<em>$1</em>");

  // Line breaks
  html = html.replaceAll("\n", "<br />");

  return html;
};

