"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";

interface PostContentProps {
  content: string;
}

function parseMarkdown(content: string): string {
  let html = content;

  // First, extract mermaid blocks and replace with placeholders
  const mermaidBlocks: string[] = [];
  html = html.replace(/```mermaid[\r\n]+([\s\S]*?)```/g, (_, code) => {
    const placeholder = `__MERMAID_BLOCK_${mermaidBlocks.length}__`;
    mermaidBlocks.push(`<div class="mermaid-wrapper"><pre class="mermaid">${code.trim()}</pre></div>`);
    return placeholder;
  });

  // Extract code blocks and replace with placeholders
  const codeBlocks: string[] = [];
  html = html.replace(/```(\w*)[\r\n]+([\s\S]*?)```/g, (_, lang, code) => {
    const language = lang || 'plaintext';
    const escapedCode = escapeHtml(code.trim());
    const placeholder = `__CODE_BLOCK_${codeBlocks.length}__`;
    codeBlocks.push(`<div class="code-block-wrapper"><div class="code-block-header"><span class="code-lang">${language}</span><button class="copy-btn" data-code="${escapedCode.replace(/"/g, '&quot;')}">Copy</button></div><pre class="language-${language}" data-language="${language}"><code class="language-${language}">${escapedCode}</code></pre></div>`);
    return placeholder;
  });

  // Parse horizontal rules (must be on its own line with optional whitespace)
  html = html.replace(/^---+$/gm, '<hr />');

  // Now process other markdown (headings won't affect code blocks)
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  // Parse images: ![alt text](url)
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" loading="lazy" />');

  // Parse links: [text](url) - internal links don't open in new tab
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, text, url) => {
    const isInternal = url.startsWith('/') || url.startsWith('#');
    if (isInternal) {
      return `<a href="${url}">${text}</a>`;
    }
    return `<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`;
  });

  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  html = html.replace(/^> (.+)$/gm, '<blockquote><p>$1</p></blockquote>');

  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  html = html.replace(/^\|(.+)\|$/gm, (_, rowContent) => {
    const cells = rowContent.split('|').map((c: string) => c.trim());
    const cellsHtml = cells.map((c: string) => `<td>${c}</td>`).join('');
    return `<tr>${cellsHtml}</tr>`;
  });
  html = html.replace(/(<tr>.*<\/tr>\n?)+/gs, (match) => {
    if (match.includes('---')) {
      const rows = match.split('\n').filter(Boolean);
      const header = rows[0];
      const body = rows.slice(2).join('\n');
      const headerHtml = header.replace(/<td>/g, '<th>').replace(/<\/td>/g, '</th>');
      return `<table><thead>${headerHtml}</thead><tbody>${body}</tbody></table>`;
    }
    return `<table>${match}</table>`;
  });

  html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/gs, (match) => `<ol>${match}</ol>`);

  html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>(?!.*<\/ol>).*<\/li>\n?)+/gs, (match) => {
    if (!match.includes('</ol>')) {
      return `<ul>${match}</ul>`;
    }
    return match;
  });

  const lines = html.split('\n');
  const result: string[] = [];
  let inBlock = false;

  for (const line of lines) {
    const trimmed = line.trim();
    // Check if this is a placeholder
    if (trimmed.startsWith('__CODE_BLOCK_') || trimmed.startsWith('__MERMAID_BLOCK_')) {
      result.push(line);
      continue;
    }
    if (
      trimmed.startsWith('<h') ||
      trimmed.startsWith('<pre') ||
      trimmed.startsWith('<div class="code-block') ||
      trimmed.startsWith('<div class="mermaid') ||
      trimmed.startsWith('<blockquote') ||
      trimmed.startsWith('<ul') ||
      trimmed.startsWith('<ol') ||
      trimmed.startsWith('<table') ||
      trimmed.startsWith('</') ||
      trimmed === ''
    ) {
      if (trimmed.startsWith('<pre') || trimmed.startsWith('<ul') || trimmed.startsWith('<ol') || trimmed.startsWith('<table') || trimmed.startsWith('<div class="code-block') || trimmed.startsWith('<div class="mermaid')) {
        inBlock = true;
      }
      if (trimmed.startsWith('</pre') || trimmed.startsWith('</ul') || trimmed.startsWith('</ol') || trimmed.startsWith('</table') || trimmed.startsWith('</div>')) {
        inBlock = false;
      }
      result.push(line);
    } else if (!inBlock && trimmed && !trimmed.startsWith('<')) {
      result.push(`<p>${trimmed}</p>`);
    } else {
      result.push(line);
    }
  }

  html = result.join('\n');

  // Restore mermaid blocks
  mermaidBlocks.forEach((block, i) => {
    html = html.replace(`__MERMAID_BLOCK_${i}__`, block);
  });

  // Restore code blocks
  codeBlocks.forEach((block, i) => {
    html = html.replace(`__CODE_BLOCK_${i}__`, block);
  });

  return html;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function unescapeHtml(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'");
}

function PostContentInner({ content }: PostContentProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [htmlContent, setHtmlContent] = useState('');

  useEffect(() => {
    const parsed = parseMarkdown(content);
    setHtmlContent(parsed);
  }, [content]);

  const handleCopy = useCallback(async (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains('copy-btn')) {
      const code = target.getAttribute('data-code');
      if (code) {
        try {
          await navigator.clipboard.writeText(unescapeHtml(code));
          target.textContent = 'Copied!';
          setTimeout(() => {
            target.textContent = 'Copy';
          }, 2000);
        } catch {
          target.textContent = 'Failed';
          setTimeout(() => {
            target.textContent = 'Copy';
          }, 2000);
        }
      }
    }
  }, []);

  useEffect(() => {
    const container = contentRef.current;
    if (container) {
      container.addEventListener('click', handleCopy);
      return () => container.removeEventListener('click', handleCopy);
    }
  }, [handleCopy, htmlContent]);

  useEffect(() => {
    if (contentRef.current && htmlContent) {
      const loadPrism = async () => {
        const Prism = (await import('prismjs')).default;
        
        await Promise.all([
          import('prismjs/components/prism-javascript'),
          import('prismjs/components/prism-typescript'),
          import('prismjs/components/prism-jsx'),
          import('prismjs/components/prism-tsx'),
          import('prismjs/components/prism-css'),
          import('prismjs/components/prism-python'),
          import('prismjs/components/prism-bash'),
          import('prismjs/components/prism-json'),
          import('prismjs/components/prism-markdown'),
          import('prismjs/components/prism-yaml'),
          import('prismjs/components/prism-sql'),
          import('prismjs/components/prism-go'),
          import('prismjs/components/prism-rust'),
          import('prismjs/components/prism-hcl'),
        ]);
        
        if (contentRef.current) {
          Prism.highlightAllUnder(contentRef.current);
        }
      };
      
      loadPrism();
    }
  }, [htmlContent]);

  useEffect(() => {
    if (contentRef.current && htmlContent) {
      const loadMermaid = async () => {
        const mermaid = (await import('mermaid')).default;
        mermaid.initialize({ 
          startOnLoad: false,
          theme: 'dark',
          themeVariables: {
            primaryColor: '#3b82f6',
            primaryTextColor: '#fff',
            primaryBorderColor: '#60a5fa',
            lineColor: '#94a3b8',
            secondaryColor: '#1e293b',
            tertiaryColor: '#0f172a',
            background: '#0f172a',
            mainBkg: '#1e293b',
            nodeBorder: '#3b82f6',
            clusterBkg: '#1e293b',
            titleColor: '#f1f5f9',
            edgeLabelBackground: '#1e293b',
          },
          flowchart: {
            curve: 'basis',
            padding: 20,
          },
        });
        
        const mermaidElements = contentRef.current?.querySelectorAll('.mermaid:not([data-processed])');
        if (mermaidElements && mermaidElements.length > 0) {
          for (let i = 0; i < mermaidElements.length; i++) {
            const el = mermaidElements[i] as HTMLElement;
            const code = el.textContent || '';
            const id = `mermaid-${Date.now()}-${i}`;
            try {
              const { svg } = await mermaid.render(id, code);
              el.innerHTML = svg;
              el.setAttribute('data-processed', 'true');
            } catch (e) {
              console.error('Mermaid render error:', e);
            }
          }
        }
      };
      
      loadMermaid();
    }
  }, [htmlContent]);

  return (
    <div 
      ref={contentRef}
      className="prose"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}

export const PostContent = dynamic(() => Promise.resolve(PostContentInner), {
  ssr: false,
  loading: () => <div className="prose animate-pulse"><div className="h-4 bg-[var(--code-bg)] rounded w-3/4 mb-4"></div><div className="h-4 bg-[var(--code-bg)] rounded w-1/2 mb-4"></div></div>
});