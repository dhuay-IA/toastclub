import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const inlineEntryAssets = () => ({
  name: "inline-entry-assets",
  apply: "build" as const,
  enforce: "post" as const,
  generateBundle(_options, bundle) {
    const htmlAsset = bundle["index.html"];

    if (!htmlAsset || htmlAsset.type !== "asset" || typeof htmlAsset.source !== "string") {
      return;
    }

    let html = htmlAsset.source;

    for (const [fileName, item] of Object.entries(bundle)) {
      const normalizedFileName = fileName.replace(/\\/g, "/");
      const relativeFileName = `./${normalizedFileName}`;
      const assetPattern = escapeRegExp(relativeFileName);

      if (item.type === "chunk" && item.isEntry) {
        const code = item.code.replace(/<\/script/gi, "<\\/script");

        html = html.replace(
          new RegExp(`<script type="module" crossorigin src="${assetPattern}"></script>`),
          () => `<script type="module">${code}</script>`
        );
        delete bundle[fileName];
      }

      if (item.type === "asset" && normalizedFileName.endsWith(".css")) {
        html = html.replace(
          new RegExp(`<link rel="stylesheet" crossorigin href="${assetPattern}">`),
          () => `<style>${item.source}</style>`
        );
        delete bundle[fileName];
      }
    }

    htmlAsset.source = html;
  },
});

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: "./",
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    inlineEntryAssets(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
