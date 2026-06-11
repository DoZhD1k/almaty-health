"use client";

import katex from "katex";
import "katex/dist/katex.min.css";

interface InlineMathProps {
  children: string;
  className?: string;
}

export function InlineMath({ children, className = "" }: InlineMathProps) {
  const html = katex.renderToString(children, {
    throwOnError: false,
    displayMode: false,
  });
  return (
    <span className={className} dangerouslySetInnerHTML={{ __html: html }} />
  );
}

interface BlockMathProps {
  children: string;
  className?: string;
}

export function BlockMath({ children, className = "" }: BlockMathProps) {
  const html = katex.renderToString(children, {
    throwOnError: false,
    displayMode: true,
  });
  return (
    <div
      className={`text-sm text-center ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
