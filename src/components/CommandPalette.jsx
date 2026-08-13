import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

function isMacPlatform() {
  if (typeof navigator === "undefined") return false;
  return /Mac|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

export function getModifierLabel() {
  return isMacPlatform() ? "⌘" : "Ctrl";
}

function scrollToId(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const input = document.createElement("textarea");
  input.value = text;
  input.setAttribute("readonly", "");
  input.style.position = "fixed";
  input.style.left = "-9999px";
  document.body.appendChild(input);
  input.select();
  document.execCommand("copy");
  document.body.removeChild(input);
}

export function CommandPalette({ theme, onToggleTheme, email, onCopied }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const modifier = getModifierLabel();

  const close = () => setOpen(false);

  const commands = useMemo(() => {
    const closePalette = () => setOpen(false);
    const jump = (id) => {
      scrollToId(id);
      closePalette();
    };

    const items = [
      {
        id: "command-top",
        group: "Jump to",
        label: "Top",
        keywords: "home header profile",
        action: () => jump("top"),
      },
      {
        id: "command-connect",
        group: "Jump to",
        label: "Connect",
        keywords: "links social github twitter linkedin mail",
        action: () => jump("connect"),
      },
      {
        id: "command-github",
        group: "Jump to",
        label: "GitHub",
        keywords: "contributions graph activity",
        action: () => jump("github"),
      },
      {
        id: "command-skills",
        group: "Jump to",
        label: "Skills",
        keywords: "tech stack tools",
        action: () => jump("skills"),
      },
      {
        id: "command-career",
        group: "Jump to",
        label: "Career",
        keywords: "work experience jobs",
        action: () => jump("career"),
      },
      {
        id: "command-projects",
        group: "Jump to",
        label: "Projects",
        keywords: "work builds",
        action: () => jump("projects"),
      },
    ];

    if (email) {
      items.push({
        id: "command-copy-email",
        group: "Actions",
        label: "Copy email",
        keywords: "mail contact clipboard",
        hint: email,
        action: async () => {
          try {
            await copyText(email);
            onCopied?.(email);
          } catch {
            onCopied?.(null);
          }
          closePalette();
        },
      });
    }

    items.push({
      id: "command-theme",
      group: "Actions",
      label: theme === "dark" ? "Switch to light mode" : "Switch to dark mode",
      keywords: "theme dark light toggle appearance",
      hint: theme === "dark" ? "Light" : "Dark",
      action: () => onToggleTheme(),
    });

    return items;
  }, [email, onCopied, onToggleTheme, theme]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const matched = needle
      ? commands.filter((command) =>
          [command.label, command.group, command.keywords, command.hint]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(needle),
        )
      : commands;

    const groups = [];

    matched.forEach((command) => {
      const last = groups[groups.length - 1];
      if (!last || last.name !== command.group) {
        groups.push({ name: command.group, items: [command] });
        return;
      }

      last.items.push(command);
    });

    return { matched, groups };
  }, [commands, query]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key.toLowerCase() !== "k" || !(event.metaKey || event.ctrlKey)) return;
      if (event.repeat) return;

      event.preventDefault();
      setOpen((current) => !current);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setActiveIndex(0);
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      inputRef.current?.focus();
    });

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.cancelAnimationFrame(frame);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    if (!open) return;

    const item = listRef.current?.querySelector("[data-active='true']");
    item?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, filtered.matched, open]);

  const runCommand = (command) => {
    if (!command) return;
    command.action();
  };

  const onPaletteKeyDown = (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) =>
        filtered.matched.length === 0 ? 0 : (current + 1) % filtered.matched.length,
      );
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) =>
        filtered.matched.length === 0
          ? 0
          : (current - 1 + filtered.matched.length) % filtered.matched.length,
      );
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      runCommand(filtered.matched[activeIndex]);
    }
  };

  return (
    <>
      <button
        aria-label="Open command palette"
        className="command-palette-trigger"
        type="button"
        onClick={() => setOpen(true)}
      >
        <span aria-hidden="true">{modifier}K</span>
        <span className="sr-only">Open command palette ({modifier}K)</span>
      </button>

      {open
        ? createPortal(
            <div className="command-palette-root" onKeyDown={onPaletteKeyDown}>
              <button
                aria-label="Close command palette"
                className="command-palette-backdrop"
                type="button"
                onClick={close}
              />
              <div
                aria-label="Command palette"
                aria-modal="true"
                className="command-palette"
                role="dialog"
              >
                <div className="command-palette-search">
                  <SearchIcon />
                  <input
                    ref={inputRef}
                    aria-activedescendant={filtered.matched[activeIndex]?.id}
                    aria-autocomplete="list"
                    aria-controls="command-palette-list"
                    autoCapitalize="off"
                    autoComplete="off"
                    autoCorrect="off"
                    className="command-palette-input"
                    placeholder="Jump to a section or run an action..."
                    spellCheck="false"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                  />
                  <kbd className="command-palette-key">esc</kbd>
                </div>

                <div ref={listRef} className="command-palette-list" id="command-palette-list" role="listbox">
                  {filtered.groups.length === 0 ? (
                    <p className="command-palette-empty">No matching commands</p>
                  ) : (
                    filtered.groups.map((group) => (
                      <div key={group.name} className="command-palette-group">
                        <p className="command-palette-group-label">{group.name}</p>
                        {group.items.map((command) => {
                          const index = filtered.matched.findIndex((item) => item.id === command.id);
                          const isActive = index === activeIndex;

                          return (
                            <button
                              key={command.id}
                              id={command.id}
                              aria-selected={isActive}
                              className="command-palette-item"
                              data-active={isActive}
                              role="option"
                              type="button"
                              onMouseEnter={() => setActiveIndex(index)}
                              onClick={() => runCommand(command)}
                            >
                              <span className="command-palette-item-label">{command.label}</span>
                              {command.hint ? <span className="command-palette-item-hint">{command.hint}</span> : null}
                            </button>
                          );
                        })}
                      </div>
                    ))
                  )}
                </div>

                <div className="command-palette-footer">
                  <span>
                    <kbd className="command-palette-key">↑</kbd>
                    <kbd className="command-palette-key">↓</kbd>
                    to navigate
                  </span>
                  <span>
                    <kbd className="command-palette-key">↵</kbd>
                    to select
                  </span>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      className="command-palette-search-icon"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}
