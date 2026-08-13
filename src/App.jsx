import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { CommandPalette } from "./components/CommandPalette.jsx";
import { GitHubGraph } from "./components/GitHubGraph.jsx";
import { QuoteVisitorCard } from "./components/QuoteVisitorCard.jsx";
import { Toast } from "./components/Toast.jsx";
import { site } from "./lib/content.js";

const CAREER_PREVIEW_COUNT = 2;
const PROJECTS_PREVIEW_COUNT = 2;
const REVEAL_DURATION = 620;

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.classList.toggle("dark", theme === "dark");
}

function App() {
  const [theme, setTheme] = useState("dark");
  const [showAllCareer, setShowAllCareer] = useState(false);
  const [showAllProjects, setShowAllProjects] = useState(false);
  const [toast, setToast] = useState("");
  const toggleRef = useRef(null);
  const toastTimerRef = useRef(null);

  const email = useMemo(() => {
    const mail = site.connect.find((link) => link.href?.startsWith("mailto:"));
    return mail?.href.replace(/^mailto:/i, "") ?? "";
  }, []);

  const showToast = useCallback((message) => {
    setToast(message);
    window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(""), 2200);
  }, []);

  const handleCopiedEmail = useCallback(
    (copied) => {
      showToast(copied ? `Copied ${copied}` : "Could not copy email");
    },
    [showToast],
  );

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    return () => window.clearTimeout(toastTimerRef.current);
  }, []);

  const toggleLabel = useMemo(
    () => (theme === "dark" ? "Switch to light mode" : "Switch to dark mode"),
    [theme],
  );

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    const button = toggleRef.current;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!document.startViewTransition || !button || reducedMotion) {
      setTheme(nextTheme);
      return;
    }

    const { left, top, width, height } = button.getBoundingClientRect();
    const originX = left + width / 2;
    const originY = top + height / 2;
    const endRadius = Math.hypot(
      Math.max(originX, window.innerWidth - originX),
      Math.max(originY, window.innerHeight - originY),
    );

    const transition = document.startViewTransition(() => {
      flushSync(() => setTheme(nextTheme));
      applyTheme(nextTheme);
    });

    transition.ready
      .then(() => {
        document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${originX}px ${originY}px)`,
              `circle(${endRadius}px at ${originX}px ${originY}px)`,
            ],
          },
          {
            duration: REVEAL_DURATION,
            easing: "cubic-bezier(0.65, 0, 0.35, 1)",
            pseudoElement: "::view-transition-new(root)",
          },
        );
      })
      .catch(() => {});
  };

  const visibleCareer = showAllCareer ? site.career : site.career.slice(0, CAREER_PREVIEW_COUNT);
  const visibleProjects = showAllProjects ? site.projects : site.projects.slice(0, PROJECTS_PREVIEW_COUNT);

  return (
    <div className="theme-surface min-h-screen bg-[var(--bg)] text-[var(--body)]">
      <CommandPalette
        email={email}
        theme={theme}
        onCopied={handleCopiedEmail}
        onToggleTheme={toggleTheme}
      />
      <Toast message={toast} />

      <button
        ref={toggleRef}
        aria-label={toggleLabel}
        className="theme-toggle group fixed bottom-6 right-6 z-50 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--toggle-border)] bg-[var(--toggle-bg)] text-[var(--heading)] backdrop-blur-sm transition-all duration-300 hover:scale-[0.9] hover:bg-transparent"
        type="button"
        onClick={toggleTheme}
      >
        <span key={theme} className="theme-toggle-icon">
          {theme === "dark" ? <MoonIcon /> : <SunIcon />}
        </span>
        <span className="sr-only">Toggle theme</span>
      </button>

      <div className="relative flex flex-col">
        <div className="min-h-16 w-full" />

        <header id="top" className="site-section flex flex-col gap-8">
          <div className="mx-auto flex w-full max-w-screen-sm flex-col gap-8 px-6 py-12">
            <div className="flex items-center gap-5">
              <img
                alt={site.profile.name}
                className="h-20 w-20 shrink-0 rounded-2xl object-cover"
                src={site.profile.image}
              />
              <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-semibold leading-8 tracking-tight text-[var(--heading)]">
                  {site.profile.name}
                </h1>
                <p className="text-[var(--body)]">{site.profile.tagline}</p>
              </div>
            </div>

            <div className="text-[var(--body)]">
              {site.introParagraphs.map((paragraph) => (
                <p key={paragraph} className="mb-6 last:mb-0">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </header>

        <main className="z-40 flex flex-col">
          <ConnectSection id="connect" title={site.sections.connect.title} links={site.connect} />

          <GitHubGraph username={site.github?.username} />

          <Section id="skills" title={site.sections.skills.title} subtitle={site.sections.skills.subtitle}>
            <div className="grid w-full grid-cols-3 gap-8">
              {site.skills.map((skill) => (
                <span key={skill} className="text-sm leading-5 text-[var(--body)]">
                  {skill}
                </span>
              ))}
            </div>
          </Section>

          <Section id="career" title={site.sections.career.title} subtitle={site.sections.career.subtitle}>
            <div className="grid w-full grid-cols-1 gap-8">
              {visibleCareer.map((entry) => (
                <CompanyEntry key={entry.company} {...entry} />
              ))}
            </div>
            {site.career.length > CAREER_PREVIEW_COUNT ? (
              <ViewAllButton
                isExpanded={showAllCareer}
                onToggle={() => setShowAllCareer((current) => !current)}
              />
            ) : null}
          </Section>

          <Section id="projects" title={site.sections.projects.title} subtitle={site.sections.projects.subtitle}>
            <div className="grid w-full grid-cols-1 gap-8">
              <div className="flex flex-col gap-12">
                {visibleProjects.map((project) => (
                  <ProjectEntry key={project.title} {...project} />
                ))}
              </div>
            </div>
            {site.projects.length > PROJECTS_PREVIEW_COUNT ? (
              <ViewAllButton
                isExpanded={showAllProjects}
                onToggle={() => setShowAllProjects((current) => !current)}
              />
            ) : null}
          </Section>

          <QuoteVisitorCard counterKey={site.visitorCounter?.key} quote={site.quote} />
        </main>
      </div>

      <TopFade />
      <BottomFade />
      <PixelFooter />
    </div>
  );
}

function ConnectSection({ id, title, links }) {
  return (
    <section id={id} className="site-section z-40 mx-auto flex w-full max-w-screen-sm flex-col gap-8 px-6 py-12">
      <h2 className="font-semibold leading-6 tracking-tight text-[var(--heading)]">{title}</h2>
      <div className="flex flex-wrap gap-3">
        {links.map((link) => (
          <ConnectLink key={link.label} {...link} />
        ))}
      </div>
    </section>
  );
}

function ConnectLink({ label, icon, href }) {
  return (
    <a
      className="connect-link"
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel="noreferrer"
    >
      <ConnectIcon name={icon} />
      <span>{label}</span>
    </a>
  );
}

function GithubIcon({ className = "h-4 w-4 shrink-0" }) {
  return (
    <svg aria-hidden="true" className={className} fill="currentColor" viewBox="0 0 24 24">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

function ConnectIcon({ name }) {
  const icons = {
    github: <GithubIcon />,
    twitter: (
      <svg aria-hidden="true" className="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    linkedin: (
      <svg aria-hidden="true" className="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.537H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.49v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
    mail: (
      <svg
        aria-hidden="true"
        className="h-4 w-4 shrink-0"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <rect width="20" height="16" x="2" y="4" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
      </svg>
    ),
    medium: (
      <svg aria-hidden="true" className="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 24 24">
        <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z" />
      </svg>
    ),
    resume: (
      <svg
        aria-hidden="true"
        className="h-4 w-4 shrink-0"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
      </svg>
    ),
  };

  return icons[name] ?? null;
}

function Section({ id, title, subtitle, children }) {
  return (
    <section id={id} className="site-section z-40 mx-auto flex w-full max-w-screen-sm flex-col gap-8 px-6 py-12">
      <div className="flex flex-col gap-2">
        <h2 className="font-semibold leading-6 tracking-tight text-[var(--heading)]">{title}</h2>
        <p className="text-sm leading-5 text-[var(--body)]">{subtitle}</p>
      </div>
      {children}
    </section>
  );
}

function CompanyEntry({ company, url, summary, roles }) {
  return (
    <article className="flex flex-col gap-12">
      <div className="flex flex-col gap-0">
        <div className="flex w-full flex-col gap-1">
          <ExternalLink href={url}>{company}</ExternalLink>
          <p className="text-sm leading-5 text-[var(--muted-body)]">{summary}</p>
        </div>
        <div className="pt-6">
          <Timeline items={roles} />
        </div>
      </div>
    </article>
  );
}

function TextEntry({ title, url, body, githubUrl }) {
  return (
    <article className="flex w-full flex-col gap-1">
      <div className="flex items-center gap-3">
        <ExternalLink href={url}>{title}</ExternalLink>
        {githubUrl ? <GithubRepoLink href={githubUrl} /> : null}
      </div>
      <p className="text-sm leading-5 text-[var(--muted-body)]">{body}</p>
    </article>
  );
}

function GithubRepoLink({ href }) {
  return (
    <a
      aria-label="View source on GitHub"
      className="inline-flex shrink-0 items-center text-[var(--muted-body)] transition-colors duration-150 hover:text-[var(--heading)]"
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel="noreferrer"
    >
      <GithubIcon />
    </a>
  );
}

function ProjectEntry({ title, url, body, bullets, githubUrl }) {
  return (
    <article className="flex flex-col gap-0">
      <TextEntry body={body} githubUrl={githubUrl} title={title} url={url} />
      <div className="pt-6">
        <Timeline items={bullets.map((bullet) => ({ body: bullet }))} />
      </div>
    </article>
  );
}

function Timeline({ items }) {
  return (
    <ol className="flex flex-col">
      {items.map((item, index) => (
        <li key={`${item.title || item.body}-${index}`} className="flex gap-3 pt-6 first:pt-0">
          <div
            className={`relative flex w-6 flex-shrink-0 flex-col items-center ${
              index === 0 ? "pt-1.5" : ""
            }`}
          >
            {index > 0 ? <div aria-hidden="true" className="h-[9px] w-[1.5px] bg-[var(--line)]" /> : null}
            <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--body)]" />
            {index < items.length - 1 ? (
              <div
                aria-hidden="true"
                className="-mb-[calc(1.5rem+9px)] -mt-[3px] min-h-0 w-[1.5px] flex-1 shrink-0 bg-[var(--line)]"
              />
            ) : null}
          </div>

          <div className="flex flex-1 flex-col gap-1 pb-6 last:pb-0">
            {item.title ? (
              <span className="font-medium leading-6 text-[var(--heading)]">
                {item.url ? <ExternalLink href={item.url}>{item.title}</ExternalLink> : item.title}
              </span>
            ) : null}
            {item.time ? <span className="text-sm leading-5 text-[var(--body)]">{item.time}</span> : null}
            {Array.isArray(item.body) ? (
              <div className="text-sm leading-5 text-[var(--muted-body)]">
                <p>{item.body[0]}</p>
                <ul className="mt-1 list-none space-y-0.5">
                  {item.body.slice(1).map((line) => (
                    <li key={line} className="relative pl-4 before:absolute before:left-0 before:content-['-']">
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-sm leading-5 text-[var(--muted-body)]">{item.body}</p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}

function ViewAllButton({ isExpanded, onToggle }) {
  return (
    <button
      aria-expanded={isExpanded}
      className="group inline-flex w-fit items-center gap-2 self-center text-sm leading-5 text-[var(--body)] transition-colors duration-150 hover:text-[var(--heading)]"
      type="button"
      onClick={onToggle}
    >
      <span>{isExpanded ? "Show less" : "View all"}</span>
      <svg
        aria-hidden="true"
        className={`h-4 w-4 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </button>
  );
}

function ExternalLink({ href, children }) {
  return (
    <a
      className="group inline-flex w-fit items-center gap-2 text-[var(--heading)] transition-colors duration-150 hover:text-[var(--heading)]"
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel="noreferrer"
    >
      <span>{children}</span>
      <svg
        aria-hidden="true"
        className="h-4 w-4 opacity-65 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path d="M7 7h10v10" />
        <path d="M7 17 17 7" />
      </svg>
    </a>
  );
}

function TopFade() {
  return <div aria-hidden="true" className="top-fade" />;
}

function BottomFade() {
  return <div aria-hidden="true" className="bottom-fade" />;
}

function PixelFooter() {
  return (
    <footer className="relative z-10 mt-32 h-48 w-full items-center justify-center" aria-hidden="true">
      <div className="footer-glow" />
      <div className="relative z-10 mx-auto h-48 w-full max-w-screen-sm items-center justify-center">
        <div className="relative mx-auto flex h-full w-full max-w-screen-sm items-start overflow-hidden">
          <h2 className="pixel-mark">GTHM</h2>
        </div>
      </div>
    </footer>
  );
}

function MoonIcon() {
  return (
    <svg aria-hidden="true" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" viewBox="0 0 24 24">
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg aria-hidden="true" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="m19.07 4.93-1.41 1.41" />
      <path d="M20 12h2" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M12 20v2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="M2 12h2" />
      <path d="m4.93 4.93 1.41 1.41" />
    </svg>
  );
}

export default App;
