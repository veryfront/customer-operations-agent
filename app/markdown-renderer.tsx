"use client";

import ReactMarkdown from "react-markdown@9.0.3";
import remarkGfm from "remark-gfm@4.0.1";
import type { MarkdownRendererProps } from "veryfront/markdown";

export function MarkdownRenderer({ source }: MarkdownRendererProps): React.JSX.Element {
  return <ReactMarkdown remarkPlugins={[remarkGfm]}>{source}</ReactMarkdown>;
}
