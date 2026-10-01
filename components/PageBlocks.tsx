"use client";
import type { ContentBlock } from "@/lib/content";

const SIZES = { s: 15, m: 18, l: 24 };

export default function PageBlocks({ blocks }: { blocks: ContentBlock[] }) {
  if (!blocks || !blocks.length) return null;
  return (
    <>
      {blocks.map((b, i) => (
        <p key={i} style={{
          whiteSpace: "pre-wrap",
          fontWeight: b.bold ? 800 : 400,
          color: b.color,
          fontSize: SIZES[b.size] || 18,
          lineHeight: 2,
          textAlign: b.align,
          background: b.color === "#ffffff" ? "#7a1c1c" : undefined,
          borderRadius: 6,
          padding: b.color === "#ffffff" ? "8px" : 0,
        }}>{b.text}</p>
      ))}
    </>
  );
}
