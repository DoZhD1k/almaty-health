"use client";

<<<<<<< HEAD
import katex from "katex";
=======
import {
  BlockMath as ReactKatexBlockMath,
  InlineMath as ReactKatexInlineMath,
} from "react-katex";
>>>>>>> gitlab/main
import "katex/dist/katex.min.css";

interface InlineMathProps {
  children: string;
  className?: string;
}

export function InlineMath({ children, className = "" }: InlineMathProps) {
<<<<<<< HEAD
  const html = katex.renderToString(children, {
    throwOnError: false,
    displayMode: false,
  });
  return (
    <span className={className} dangerouslySetInnerHTML={{ __html: html }} />
=======
  return (
    <span className={className}>
      <ReactKatexInlineMath math={children} />
    </span>
>>>>>>> gitlab/main
  );
}

interface BlockMathProps {
  children: string;
  className?: string;
}

export function BlockMath({ children, className = "" }: BlockMathProps) {
<<<<<<< HEAD
  const html = katex.renderToString(children, {
    throwOnError: false,
    displayMode: true,
  });
  return (
    <div
      className={`text-sm text-center ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
=======
  return (
    <div className={`text-sm text-center ${className}`}>
      <ReactKatexBlockMath math={children} />
    </div>
>>>>>>> gitlab/main
  );
}
