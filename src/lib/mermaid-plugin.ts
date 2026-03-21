/**
 * Lightweight Mermaid plugin for Streamdown.
 *
 * Loads @mermaid-js/tiny (~1.9MB) via CDN instead of bundling
 * the full mermaid package (~5.1MB across 43 chunks).
 *
 * Implements the same DiagramPlugin interface that Streamdown expects,
 * so it's a drop-in replacement for @streamdown/mermaid.
 */

const CDN_URL =
  "https://cdn.jsdelivr.net/npm/@mermaid-js/tiny@11/dist/mermaid.tiny.js";

const DEFAULT_CONFIG = {
  startOnLoad: false,
  theme: "default" as const,
  securityLevel: "strict" as const,
  fontFamily: "monospace",
  suppressErrorRendering: true,
};

type MermaidConfig = Record<string, unknown>;

interface MermaidInstance {
  initialize: (config: MermaidConfig) => void;
  render: (id: string, source: string) => Promise<{ svg: string }>;
}

interface DiagramPlugin {
  name: "mermaid";
  type: "diagram";
  language: string;
  getMermaid: (config?: MermaidConfig) => MermaidInstance;
}

interface GlobalMermaid {
  initialize: (config: MermaidConfig) => void;
  render: (id: string, source: string) => Promise<{ svg: string }>;
}

declare global {
  interface Window {
    mermaid?: GlobalMermaid;
  }
}

let loadPromise: Promise<GlobalMermaid> | null = null;

function loadMermaidFromCDN(): Promise<GlobalMermaid> {
  if (loadPromise) return loadPromise;

  if (typeof window === "undefined") {
    return Promise.reject(new Error("Mermaid can only run in the browser"));
  }

  // Already loaded via a previous call
  if (window.mermaid) {
    return Promise.resolve(window.mermaid);
  }

  loadPromise = new Promise<GlobalMermaid>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = CDN_URL;
    script.async = true;
    script.onload = () => {
      if (window.mermaid) {
        resolve(window.mermaid);
      } else {
        loadPromise = null;
        reject(new Error("mermaid global not found after script load"));
      }
    };
    script.onerror = () => {
      loadPromise = null;
      reject(new Error(`Failed to load mermaid from ${CDN_URL}`));
    };
    document.head.appendChild(script);
  });

  return loadPromise;
}

function createMermaidPlugin(
  options: { config?: MermaidConfig } = {},
): DiagramPlugin {
  let initialized = false;
  let mermaidRef: GlobalMermaid | null = null;
  const config: MermaidConfig = { ...DEFAULT_CONFIG, ...options.config };

  const ensureReady = async (): Promise<GlobalMermaid> => {
    mermaidRef ??= await loadMermaidFromCDN();
    return mermaidRef;
  };

  const instance: MermaidInstance = {
    initialize(cfg: MermaidConfig) {
      Object.assign(config, cfg);
      if (mermaidRef) {
        mermaidRef.initialize(config);
        initialized = true;
      }
    },
    async render(id: string, source: string): Promise<{ svg: string }> {
      const mermaid = await ensureReady();
      if (!initialized) {
        mermaid.initialize(config);
        initialized = true;
      }
      return mermaid.render(id, source);
    },
  };

  return {
    name: "mermaid" as const,
    type: "diagram" as const,
    language: "mermaid",
    getMermaid(cfg?: MermaidConfig) {
      if (cfg) {
        instance.initialize(cfg);
      }
      return instance;
    },
  };
}

const mermaid = createMermaidPlugin();

export { createMermaidPlugin, mermaid };
export type { DiagramPlugin, MermaidConfig, MermaidInstance };
