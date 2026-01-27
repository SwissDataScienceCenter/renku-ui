/*!
 * Copyright 2026 - Swiss Data Science Center (SDSC)
 * A partnership between École Polytechnique Fédérale de Lausanne (EPFL) and
 * Eidgenössische Technische Hochschule Zürich (ETHZ).
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import mermaid from "mermaid";
import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown, { type Options } from "react-markdown";
import rehypeKatex from "rehype-katex";
import rehypeMermaid from "rehype-mermaid";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import remarkMath from "remark-math";

import "katex/dist/katex.min.css";

type MarkdownProps = Options & {
  children?: string;
  sanitize?: boolean;
};

export default function Markdown({
  children,
  sanitize = true,
  rehypePlugins,
  remarkPlugins,
  ...props
}: MarkdownProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [initDone, setInitDone] = useState(false);

  const sanitizeSchema = useMemo(() => {
    return {
      ...defaultSchema,
      attributes: {
        ...defaultSchema.attributes,
        pre: [...(defaultSchema.attributes?.pre ?? []), ["className"]],
        code: [...(defaultSchema.attributes?.code ?? []), ["className"]],
      },
    };
  }, []);

  useEffect(() => {
    // Initialize mermaid when needed
    const element = containerRef.current;
    if (!element) return;

    const nodes = element.querySelectorAll<HTMLElement>("pre.mermaid");
    if (nodes.length === 0) return;

    if (!initDone) {
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: "strict",
      });
      setInitDone(true);
    }

    mermaid.run({ nodes, suppressErrors: true });
  }, [children, initDone]);

  const baseRehypePlugins = [
    rehypeRaw,
    ...(sanitize ? [[rehypeSanitize, sanitizeSchema]] : []),
    [rehypeMermaid, { strategy: "pre-mermaid" }],
    rehypeKatex,
  ];

  const baseRemarkPlugins = [remarkMath, ...(remarkPlugins ?? [])];

  return (
    <div ref={containerRef}>
      <ReactMarkdown
        rehypePlugins={[...baseRehypePlugins, ...(rehypePlugins ?? [])]}
        remarkPlugins={[...baseRemarkPlugins]}
        {...props}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
