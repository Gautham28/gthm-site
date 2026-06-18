import { useEffect, useMemo, useState } from "react";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAY_LABELS = [
  { row: 2, label: "Mon" },
  { row: 4, label: "Wed" },
  { row: 6, label: "Fri" },
];

function buildWeeks(contributions) {
  if (!contributions.length) return [];

  const weeks = [];
  let week = Array(7).fill(null);

  contributions.forEach((day, index) => {
    const dayOfWeek = new Date(`${day.date}T12:00:00`).getDay();

    if (dayOfWeek === 0 && index > 0 && week.some(Boolean)) {
      weeks.push(week);
      week = Array(7).fill(null);
    }

    week[dayOfWeek] = day;
  });

  if (week.some(Boolean)) {
    weeks.push(week);
  }

  return weeks;
}

function getMonthLabels(weeks) {
  const labels = [];
  let lastMonth = -1;

  weeks.forEach((week, columnIndex) => {
    const firstDay = week.find(Boolean);
    if (!firstDay) return;

    const date = new Date(`${firstDay.date}T12:00:00`);
    const month = date.getMonth();

    if (month !== lastMonth && date.getDate() <= 7) {
      labels.push({ columnIndex, label: MONTHS[month] });
      lastMonth = month;
    }
  });

  return labels;
}

function ContributionCell({ day }) {
  if (!day) {
    return <span aria-hidden="true" className="github-graph-cell github-graph-cell--empty" />;
  }

  const title = day.count === 0 ? "No activity" : `${day.count} contribution${day.count === 1 ? "" : "s"}`;

  return (
    <span
      aria-label={title}
      className="github-graph-cell"
      data-level={day.level}
      title={`${day.count} contribution${day.count === 1 ? "" : "s"} on ${day.date}`}
    />
  );
}

export function GitHubGraph({ username }) {
  const year = new Date().getFullYear();
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!username) return;

    let cancelled = false;

    fetch(`https://github-contributions-api.jogruber.de/v4/${username}?y=${year}`)
      .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch contributions");
        return response.json();
      })
      .then((payload) => {
        if (!cancelled) {
          setData(payload);
          setError(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setData(null);
          setError(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [username, year]);

  const weeks = useMemo(() => buildWeeks(data?.contributions ?? []), [data]);
  const monthLabels = useMemo(() => getMonthLabels(weeks), [weeks]);
  const total = data?.total?.[String(year)] ?? data?.contributions?.reduce((sum, day) => sum + day.count, 0) ?? 0;

  if (!username) return null;

  return (
    <section className="z-40 mx-auto flex w-full max-w-screen-sm flex-col px-6 pb-12">
      <div className="github-graph">
        {error ? (
          <p className="text-sm leading-5 text-[var(--muted-body)]">Unable to load GitHub activity right now.</p>
        ) : !data ? (
          <div aria-hidden="true" className="github-graph-skeleton" />
        ) : (
          <>
            <div className="github-graph-scroll">
              <div className="github-graph-layout">
                <div aria-hidden="true" className="github-graph-day-labels">
                  {DAY_LABELS.map(({ row, label }) => (
                    <span key={label} className="github-graph-day-label" style={{ gridRow: row }}>
                      {label}
                    </span>
                  ))}
                </div>

                <div className="github-graph-main">
                  <div
                    aria-hidden="true"
                    className="github-graph-months"
                    style={{ gridTemplateColumns: `repeat(${weeks.length}, var(--github-cell-size))` }}
                  >
                    {monthLabels.map(({ columnIndex, label }) => (
                      <span
                        key={`${label}-${columnIndex}`}
                        className="github-graph-month"
                        style={{ gridColumnStart: columnIndex + 1 }}
                      >
                        {label}
                      </span>
                    ))}
                  </div>

                  <div className="github-graph-grid">
                    {weeks.map((week, weekIndex) => (
                      <div key={weekIndex} className="github-graph-week">
                        {week.map((day, dayIndex) => (
                          <ContributionCell key={day?.date ?? `${weekIndex}-${dayIndex}`} day={day} />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="github-graph-footer">
              <p className="github-graph-total">
                {total} {total === 1 ? "activity" : "activities"} in {year}
              </p>
              <div aria-hidden="true" className="github-graph-legend">
                <span>Less</span>
                <div className="github-graph-legend-cells">
                  {[0, 1, 2, 3, 4].map((level) => (
                    <span key={level} className="github-graph-cell" data-level={level} />
                  ))}
                </div>
                <span>More</span>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
