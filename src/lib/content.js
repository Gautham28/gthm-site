import siteRaw from "../../content/site.md?raw";
import { parseSiteMarkdown } from "./parseSite.js";

const { data, content } = parseSiteMarkdown(siteRaw);

export const site = {
  profile: data.profile,
  sections: data.sections,
  skills: data.skills,
  career: data.career,
  designWork: data.designWork,
  projects: data.projects,
  oss: data.oss,
  introParagraphs: content.trim().split(/\n\n+/).filter(Boolean),
  footer: data.footer,
  meta: data.meta,
};
