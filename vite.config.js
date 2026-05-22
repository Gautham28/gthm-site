import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { createHtmlPlugin } from "vite-plugin-html";
import { parseSiteMarkdown } from "./src/lib/parseSite.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const siteMd = fs.readFileSync(path.resolve(__dirname, "content/site.md"), "utf8");
const { data: siteData } = parseSiteMarkdown(siteMd);

export default defineConfig({
  plugins: [
    react(),
    createHtmlPlugin({
      inject: {
        data: {
          title: siteData.meta.title,
          description: siteData.meta.description,
        },
      },
    }),
  ],
});
