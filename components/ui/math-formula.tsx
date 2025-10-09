"use client";

import {
  BlockMath as ReactKatexBlockMath,
  InlineMath as ReactKatexInlineMath,
} from "react-katex";
import "katex/dist/katex.min.css";

interface InlineMathProps {
  children: string;
  className?: string;
}

export function InlineMath({ children, className = "" }: InlineMathProps) {
  return (
    <span className={className}>
      <ReactKatexInlineMath math={children} />
    </span>
  );
}

interface BlockMathProps {
  children: string;
  className?: string;
}

export function BlockMath({ children, className = "" }: BlockMathProps) {
  return (
    <div className={`text-sm text-center ${className}`}>
      <ReactKatexBlockMath math={children} />
    </div>
  );
}
