import { useEffect, useRef, useState } from "react";

const MARK = "GTHM";

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function PixelFooter() {
  const footerRef = useRef(null);
  const lettersRef = useRef([]);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(media.matches);

    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const footer = footerRef.current;
    if (!footer || reduceMotion) return;

    let frame = 0;
    let queued = false;

    const update = () => {
      queued = false;

      const rect = footer.getBoundingClientRect();
      const viewHeight = window.innerHeight;

      if (rect.top > viewHeight || rect.bottom < 0) {
        return;
      }

      const progress = clamp((viewHeight - rect.top) / (viewHeight + rect.height), 0, 1);
      const t = window.scrollY * 0.016;

      lettersRef.current.forEach((letter, index) => {
        if (!letter) return;

        const wave = Math.sin(t + index * 0.9) * (6 + progress * 18);
        letter.style.transform = `translate3d(0, ${wave}px, 0)`;
      });

      const burst = Math.sin(t * 5.7) * Math.sin(t * 2.15);
      const glitchOn = burst > 0.58;
      const intensity = glitchOn ? burst * progress : progress * 0.2;

      footer.style.setProperty("--glitch-x", `${intensity * 14}px`);
      footer.style.setProperty("--glitch-y", `${(glitchOn ? Math.sin(t * 8) : 0) * 6 * progress}px`);
      footer.style.setProperty("--glitch-skew", glitchOn ? `${burst * 4}deg` : "0deg");
      footer.style.setProperty("--glitch-clip-top", glitchOn ? `${((Math.sin(t * 9) + 1) / 2) * 42}%` : "0%");
      footer.style.setProperty(
        "--glitch-clip-bottom",
        glitchOn ? `${((Math.cos(t * 7.4) + 1) / 2) * 42}%` : "0%",
      );
      footer.style.setProperty("--glitch-opacity", String((glitchOn ? 0.7 : 0.22) * progress));
    };

    const onScroll = () => {
      if (queued) return;
      queued = true;
      frame = window.requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    update();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.cancelAnimationFrame(frame);
    };
  }, [reduceMotion]);

  return (
    <footer
      ref={footerRef}
      aria-hidden="true"
      className="pixel-footer relative z-10 mt-32 h-48 w-full items-center justify-center"
    >
      <div className="footer-glow" />
      <div className="relative z-10 mx-auto h-48 w-full max-w-screen-sm items-center justify-center">
        <div className="relative mx-auto flex h-full w-full max-w-screen-sm items-start overflow-hidden">
          <span className="pixel-mark pixel-mark-glitch pixel-mark-glitch--red">{MARK}</span>
          <span className="pixel-mark pixel-mark-glitch pixel-mark-glitch--cyan">{MARK}</span>
          <h2 className="pixel-mark">
            {reduceMotion
              ? MARK
              : MARK.split("").map((letter, index) => (
                  <span
                    key={`${letter}-${index}`}
                    ref={(node) => {
                      lettersRef.current[index] = node;
                    }}
                    className="pixel-mark-letter"
                  >
                    {letter}
                  </span>
                ))}
          </h2>
        </div>
      </div>
    </footer>
  );
}
