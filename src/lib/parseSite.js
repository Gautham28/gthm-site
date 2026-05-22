import { parse } from "yaml";

export function parseSiteMarkdown(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);

  if (!match) {
    throw new Error("Invalid site.md: expected YAML frontmatter between --- fences");
  }

  return {
    data: parse(match[1]),
    content: match[2],
  };
}
