import { useEffect, useState } from "react";

const COUNTER_API = "https://countapi.mileshilliard.com/api/v1";

function formatCount(value) {
  return new Intl.NumberFormat("en-US").format(value);
}

function getOrdinalSuffix(value) {
  const mod10 = value % 10;
  const mod100 = value % 100;

  if (mod10 === 1 && mod100 !== 11) return "st";
  if (mod10 === 2 && mod100 !== 12) return "nd";
  if (mod10 === 3 && mod100 !== 13) return "rd";
  return "th";
}

export function QuoteVisitorCard({ quote, counterKey }) {
  const [visitorCount, setVisitorCount] = useState(null);

  useEffect(() => {
    if (!counterKey) return;

    let cancelled = false;
    const sessionKey = `visitor-counted-${counterKey}`;
    const hasVisited = sessionStorage.getItem(sessionKey);
    const endpoint = hasVisited ? `${COUNTER_API}/get/${counterKey}` : `${COUNTER_API}/hit/${counterKey}`;

    fetch(endpoint)
      .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch visitor count");
        return response.json();
      })
      .then((data) => {
        if (cancelled) return;

        const value = Number(data.value);
        if (!Number.isNaN(value)) {
          setVisitorCount(value);
        }

        if (!hasVisited) {
          sessionStorage.setItem(sessionKey, "1");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setVisitorCount(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [counterKey]);

  if (!quote?.text) return null;

  const suffix = visitorCount === null ? "th" : getOrdinalSuffix(visitorCount);

  return (
    <section className="z-40 mx-auto w-full max-w-screen-sm px-6 py-12">
      <div className="quote-visitor-card">
        <div className="quote-visitor-quote">
          <span aria-hidden="true" className="quote-visitor-mark">
            <svg fill="currentColor" viewBox="0 0 24 24">
              <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.29l.865 1.463c-3.432 1.904-4.966 4.091-4.966 7.021 0 1.311.47 2.379 1.411 3.205.94.826 2.079 1.237 3.417 1.237 1.378 0 2.522-.448 3.432-1.345.91-.897 1.365-2.008 1.365-3.334 0-1.325-.455-2.436-1.365-3.333-.91-.897-2.054-1.346-3.432-1.346-1.004 0-1.871.29-2.6.87-.729.58-1.094 1.3-1.094 2.16h-2.777zm11.858 0c-1.03-1.094-1.583-2.321-1.583-4.31 0-3.5 2.457-6.637 6.03-8.29l.865 1.463c-3.432 1.904-4.966 4.091-4.966 7.021 0 1.311.47 2.379 1.411 3.205.94.826 2.079 1.237 3.417 1.237 1.378 0 2.522-.448 3.432-1.345.91-.897 1.365-2.008 1.365-3.334 0-1.325-.455-2.436-1.365-3.333-.91-.897-2.054-1.346-3.432-1.346-1.004 0-1.871.29-2.6.87-.729.58-1.094 1.3-1.094 2.16h-2.777z" />
            </svg>
          </span>
          <p className="quote-visitor-text">{quote.text}</p>
          {quote.author ? <p className="quote-visitor-author">— {quote.author}</p> : null}
        </div>

        <div aria-hidden="true" className="quote-visitor-divider" />

        <div className="quote-visitor-count">
          <p>
            You are the{" "}
            {visitorCount === null ? (
              <span className="quote-visitor-number">...</span>
            ) : (
              <span className="quote-visitor-number">
                {formatCount(visitorCount)}
                <sup className="quote-visitor-suffix">{suffix}</sup>
              </span>
            )}{" "}
            visitor
          </p>
        </div>
      </div>
    </section>
  );
}
