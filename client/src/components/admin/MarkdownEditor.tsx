import { useMemo, useRef } from "react";
import { markdownToSafeHtml } from "../../utils/markdown";

type Props = {
  label: string;
  value: string;
  onChange: (next: string) => void;
};

const wrapSelection = (
  el: HTMLTextAreaElement,
  left: string,
  right: string,
) => {
  const start = el.selectionStart ?? 0;
  const end = el.selectionEnd ?? 0;
  const value = el.value;
  const selected = value.slice(start, end);
  const next = value.slice(0, start) + left + selected + right + value.slice(end);

  el.value = next;
  const cursor = start + left.length + selected.length + right.length;
  el.focus();
  el.setSelectionRange(cursor, cursor);
  return next;
};

const MarkdownEditor = ({ label, value, onChange }: Props) => {
  const ref = useRef<HTMLTextAreaElement | null>(null);

  const previewHtml = useMemo(() => markdownToSafeHtml(value), [value]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <label className="text-sm font-semibold text-gray-900">{label}</label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="px-2 py-1 rounded-md border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50"
            onClick={() => {
              const el = ref.current;
              if (!el) return;
              onChange(wrapSelection(el, "**", "**"));
            }}
          >
            Bold
          </button>
          <button
            type="button"
            className="px-2 py-1 rounded-md border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50"
            onClick={() => {
              const el = ref.current;
              if (!el) return;
              onChange(wrapSelection(el, "_", "_"));
            }}
          >
            Italic
          </button>
          <button
            type="button"
            className="px-2 py-1 rounded-md border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50"
            onClick={() => {
              const el = ref.current;
              if (!el) return;
              onChange(wrapSelection(el, "[", "](https://)"));
            }}
          >
            Link
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={10}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500 font-mono text-sm"
          placeholder="Write **bold**, _italic_, and [links](https://...)"
        />

        <div className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white">
          <div
            className="text-gray-700 leading-relaxed text-sm"
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
        </div>
      </div>
    </div>
  );
};

export default MarkdownEditor;

