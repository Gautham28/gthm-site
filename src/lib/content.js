import siteRaw from "../../content/site.md?raw";
import { parseSiteMarkdown } from "./parseSite.js";

const { data, content } = parseSiteMarkdown(siteRaw);

export const site = {
  profile: data.profile,
  sections: data.sections,
  connect: data.connect,
  github: data.github,
  skills: data.skills,
  career: data.career,
  projects: data.projects,
  quote: data.quote,
  visitorCounter: data.visitorCounter,
  introParagraphs: content.trim().split(/\n\n+/).filter(Boolean),
  meta: data.meta,
};
