'use client';

import { Maximize2, X } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';

const DIAGRAM_FONT = 'var(--font-inter), system-ui, sans-serif';

// Literal colours, because Mermaid computes shades from these and can't read CSS variables.
const DARK_DIAGRAM = {
  fontFamily: DIAGRAM_FONT,
  background: '#1c2230',
  primaryColor: '#262d3d',
  primaryBorderColor: '#54d045',
  primaryTextColor: '#ffffff',
  secondaryColor: '#262d3d',
  tertiaryColor: '#1c2230',
  lineColor: '#a1a1aa',
  textColor: '#ffffff',
};
const LIGHT_DIAGRAM = {
  fontFamily: DIAGRAM_FONT,
  background: '#ffffff',
  primaryColor: '#eceef2',
  primaryBorderColor: '#1f7a14',
  primaryTextColor: '#10131c',
  secondaryColor: '#eceef2',
  tertiaryColor: '#ffffff',
  lineColor: '#52525b',
  textColor: '#10131c',
};

function isDarkTheme() {
  return document.documentElement.classList.contains('dark');
}

/**
 * Mermaid is large, so it's imported only when a diagram nears the screen.
 * The source stays visible until then, and if a diagram can't be drawn.
 */
export function MermaidDiagram({ code }: { code: string }) {
  const id = `mermaid-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const containerRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [nearScreen, setNearScreen] = useState(false);
  const [dark, setDark] = useState<boolean | null>(null);
  const [svg, setSvg] = useState<string | null>(null);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setNearScreen(true);
          observer.disconnect();
        }
      },
      { rootMargin: '400px' },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // Redraw when the theme changes, since Mermaid bakes colours into its output.
  useEffect(() => {
    const sync = () => setDark(isDarkTheme());
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    sync();
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!nearScreen || dark === null) return;
    let cancelled = false;

    const draw = async () => {
      try {
        const { default: mermaid } = await import('mermaid');
        mermaid.initialize({
          startOnLoad: false,
          // Strict mode sanitizes the output and disables click handlers in diagrams.
          securityLevel: 'strict',
          theme: 'base',
          themeVariables: dark ? DARK_DIAGRAM : LIGHT_DIAGRAM,
        });
        const result = await mermaid.render(`${id}-${dark ? 'd' : 'l'}`, code);
        if (!cancelled) setSvg(result.svg);
      } catch {
        if (!cancelled) setSvg(null);
      }
    };

    // Mermaid is heavy, so it waits until the page has finished its own work.
    const idle = window.requestIdleCallback?.(() => void draw(), { timeout: 2000 });
    const timer = idle === undefined ? setTimeout(() => void draw(), 200) : undefined;

    return () => {
      cancelled = true;
      if (idle !== undefined) window.cancelIdleCallback(idle);
      clearTimeout(timer);
    };
  }, [nearScreen, dark, code, id]);

  return (
    <figure ref={containerRef} className="bm-diagram">
      {svg ? (
        <>
          <div
            role="img"
            aria-label="Diagram"
            className="bm-diagram-canvas"
            // Sanitized by Mermaid's strict security level.
            dangerouslySetInnerHTML={{ __html: svg }}
          />
          <button
            type="button"
            className="bm-diagram-expand"
            aria-label="Expand diagram"
            onClick={() => dialogRef.current?.showModal()}
          >
            <Maximize2 aria-hidden className="size-4" />
          </button>
          <dialog
            ref={dialogRef}
            className="bm-diagram-dialog"
            aria-label="Expanded diagram"
            onClick={(event) => {
              if (event.target === dialogRef.current) dialogRef.current?.close();
            }}
          >
            <button
              type="button"
              autoFocus
              className="bm-diagram-close"
              aria-label="Close diagram"
              onClick={() => dialogRef.current?.close()}
            >
              <X aria-hidden className="size-5" />
            </button>
            <div className="bm-diagram-canvas" dangerouslySetInnerHTML={{ __html: svg }} />
          </dialog>
        </>
      ) : (
        <pre className="bm-diagram-source">
          <code>{code}</code>
        </pre>
      )}
    </figure>
  );
}
