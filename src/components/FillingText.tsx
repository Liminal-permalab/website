"use client";

// Text that fills in letter by letter on an otherwise empty page. The whole text keeps its place from the start
// (the part not yet written is there but invisible), so nothing jumps while it fills. Screen readers get the
// complete text at once, and so does anyone who asked their device for less motion.
import { useEffect, useState, type ReactNode } from "react";

const LETTER_MS = 34;
const PAUSE_LETTERS = 16; // the wait between two lines, counted in letters

export function FillingText({ title, lines, onProgress, children }: { title: string; lines: readonly string[]; /** Told how much is written, from 0 to 1. */ onProgress?: (written: number) => void; children?: ReactNode }) {
  const parts = [title, ...lines];
  // where each part starts on one long line of letters, pauses included
  const starts = parts.reduce<number[]>((all, part, i) => [...all, i === 0 ? 0 : (all[i - 1] ?? 0) + (parts[i - 1]?.length ?? 0) + PAUSE_LETTERS], []);
  const total = (starts.at(-1) ?? 0) + (parts.at(-1)?.length ?? 0);
  const [written, setWritten] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const all = setTimeout(() => setWritten(total), 0);
      return () => clearTimeout(all);
    }
    const timer = setInterval(() => setWritten((n) => (n >= total ? n : n + 1)), LETTER_MS);
    return () => clearInterval(timer);
  }, [total]);

  useEffect(() => { onProgress?.(total ? written / total : 1); }, [written, total, onProgress]);

  const done = written >= total;
  const part = (text: string, index: number) => {
    const shown = Math.max(0, Math.min(text.length, written - (starts[index] ?? 0)));
    const writing = shown > 0 && (shown < text.length || (index === parts.length - 1 ? !done : written < (starts[index + 1] ?? 0)));
    return (
      <>
        <span>{text.slice(0, shown)}</span>
        {writing && <span className="filling-cursor" />}
        <span className="invisible">{text.slice(shown)}</span>
      </>
    );
  };

  return (
    <div>
      <div className="sr-only">
        <h1>{title}</h1>
        {lines.map((line) => <p key={line}>{line}</p>)}
      </div>
      <div aria-hidden="true">
        <p className="hero-title filling-title">{part(title, 0)}</p>
        <div className="mt-6 flex flex-col gap-3">
          {lines.map((line, i) => <p key={line} className="filling-line">{part(line, i + 1)}</p>)}
        </div>
      </div>
      <div className="filling-after" data-shown={done}>{children}</div>
    </div>
  );
}
