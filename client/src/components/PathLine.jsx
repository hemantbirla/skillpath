import { Link } from "react-router-dom";

// Renders the shortest-path result as a metro line.
export default function PathLine({ steps = [] }) {
  if (steps.length === 0) {
    return null;
  }

  const n = steps.length;
  const width = Math.max(640, n * 220);
  const height = 220;
  const trackY = height / 2;
  const marginX = 80;
  const usable = width - marginX * 2;

  const points = steps.map((step, i) => ({
    ...step,
    x: n === 1 ? width / 2 : marginX + (usable * i) / (n - 1),
  }));

  return (
    <div className="path-line" style={{ "--path-line-count": n }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        role="img"
        aria-label="Prerequisite path diagram"
      >
        <line
          x1={marginX}
          y1={trackY}
          x2={width - marginX}
          y2={trackY}
          stroke="var(--line-amber)"
          strokeWidth="4"
          strokeLinecap="round"
        />

        {points.map((point, index) => {
          const isEnd = index === 0 || index === n - 1;
          const labelAbove = index % 2 === 0;

          return (
            <g key={point.id}>
              <circle
                cx={point.x}
                cy={trackY}
                r={isEnd ? 12 : 9}
                fill={isEnd ? "var(--line-amber)" : "var(--bg)"}
                stroke="var(--line-amber)"
                strokeWidth="4"
              />

              <text
                x={point.x}
                y={labelAbove ? trackY - 26 : trackY + 40}
                textAnchor="middle"
                className="path-line__label"
              >
                {point.name}
              </text>

              {point.category && (
                <text
                  x={point.x}
                  y={labelAbove ? trackY - 10 : trackY + 56}
                  textAnchor="middle"
                  className="path-line__sublabel"
                >
                  {point.category}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      <ol className="path-line__list">
        {points.map((point, index) => (
          <li key={point.id}>
            <Link to={`/skills/${point.id}`}>{point.name}</Link>

            {point.sampleCourses?.length > 0 && (
              <span className="path-line__courses">
                {" "}
                — taught in {point.sampleCourses.join(", ")}
              </span>
            )}

            {index === 0 && <span className="pill pill--muted">start</span>}

            {index === points.length - 1 && (
              <span className="pill pill--muted">target</span>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
