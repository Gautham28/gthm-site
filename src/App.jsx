import { useEffect, useMemo, useState } from "react";
import { site } from "./lib/content.js";

function App() {
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const toggleLabel = useMemo(
    () => (theme === "dark" ? "Switch to light mode" : "Switch to dark mode"),
    [theme],
  );

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--body)] transition-colors duration-300">
      <button
        aria-label={toggleLabel}
        className="group fixed bottom-6 right-6 z-50 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--toggle-border)] bg-[var(--toggle-bg)] text-[var(--heading)] backdrop-blur-sm transition-all duration-300 hover:scale-[0.9] hover:bg-transparent"
        type="button"
        onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
      >
        {theme === "dark" ? <MoonIcon /> : <SunIcon />}
        <span className="sr-only">Toggle theme</span>
      </button>

      <div className="relative flex flex-col">
        <div className="min-h-40 w-full" />

        <header className="flex flex-col gap-8">
          <div className="mx-auto flex w-full max-w-screen-sm flex-col gap-8 px-6 py-12">
            <div className="flex flex-col gap-2">
              <h1 className="text-xl font-medium leading-7 tracking-tight text-[var(--heading)]">
                {site.profile.name}
              </h1>
              <p className="text-[var(--body)]">{site.profile.tagline}</p>
            </div>

            <div className="text-[var(--body)]">
              {site.introParagraphs.map((paragraph) => (
                <p key={paragraph} className="mb-6 last:mb-0">
                  {paragraph}
                </p>
              ))}
              <FooterLine parts={site.footer.parts} />
            </div>
          </div>
        </header>

        <main className="z-40 flex flex-col">
          <Section title={site.sections.skills.title} subtitle={site.sections.skills.subtitle}>
            <div className="grid w-full grid-cols-3 gap-8">
              {site.skills.map((skill) => (
                <span key={skill} className="text-sm leading-5 text-[var(--body)]">
                  {skill}
                </span>
              ))}
            </div>
          </Section>

          <Section title={site.sections.career.title} subtitle={site.sections.career.subtitle}>
            <div className="grid w-full grid-cols-1 gap-8">
              {site.career.map((entry) => (
                <CompanyEntry key={entry.company} {...entry} />
              ))}
            </div>
          </Section>

          <Section title={site.sections.designWork.title} subtitle={site.sections.designWork.subtitle}>
            <div className="grid w-full grid-cols-1 gap-8">
              <div className="flex flex-col gap-8">
                {site.designWork.map((item) => (
                  <TextEntry key={item.title} {...item} />
                ))}
              </div>
            </div>
          </Section>

          <Section title={site.sections.projects.title} subtitle={site.sections.projects.subtitle}>
            <div className="grid w-full grid-cols-1 gap-8">
              <div className="flex flex-col gap-12">
                {site.projects.map((project) => (
                  <ProjectEntry key={project.title} {...project} />
                ))}
              </div>
            </div>
          </Section>

          <Section title={site.sections.oss.title} subtitle={site.sections.oss.subtitle}>
            <div className="grid w-full grid-cols-1 gap-8">
              <div className="flex flex-col gap-8">
                {site.oss.map((item) => (
                  <div key={item.title} className="flex flex-col gap-0">
                    <div className="flex w-full flex-col gap-1">
                      <ExternalLink href={item.url}>{item.title}</ExternalLink>
                      <p className="whitespace-nowrap text-sm leading-5 text-[var(--muted-body)]">
                        {item.time}
                      </p>
                    </div>
                    <div className="pt-6">
                      <Timeline items={item.bullets} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Section>
        </main>
      </div>

      <TopFade />
      <BottomFade />
      <PixelFooter />
    </div>
  );
}

function Section({ title, subtitle, children }) {
  return (
    <section className="z-40 mx-auto flex w-full max-w-screen-sm flex-col gap-8 px-6 py-12">
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

function TextEntry({ title, url, body }) {
  return (
    <article className="flex w-full flex-col gap-1">
      <ExternalLink href={url}>{title}</ExternalLink>
      <p className="text-sm leading-5 text-[var(--muted-body)]">{body}</p>
    </article>
  );
}

function ProjectEntry({ title, url, body, bullets }) {
  return (
    <article className="flex flex-col gap-0">
      <TextEntry title={title} url={url} body={body} />
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

function FooterLine({ parts }) {
  return (
    <p>
      {parts.map((part, index) =>
        typeof part === "string" ? (
          <span key={`${part}-${index}`}>{part}</span>
        ) : (
          <InlineLink key={`${part.label}-${index}`} href={part.href}>
            {part.label}
          </InlineLink>
        ),
      )}
    </p>
  );
}

function InlineLink({ href, children }) {
  return (
    <a className="inline-link" href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
      {children}
    </a>
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
    <svg aria-hidden="true" className="h-7 w-7" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg aria-hidden="true" className="h-7 w-7" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
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
