import { Link } from "react-router-dom";

const CATEGORY_COLOR = {
  Foundations: "var(--line-amber)",
  Web: "var(--line-teal)",
  Systems: "var(--line-violet)",
  Data: "var(--line-teal)",
  AI: "var(--line-violet)",
  DevOps: "var(--line-rose)",
  Design: "var(--line-amber)",
};

export default function SkillCard({ skill }) {
  const color = CATEGORY_COLOR[skill.category] || "var(--line-amber)";

  return (
    <Link to={`/skills/${skill.id}`} className="skill-card">
      <span
        className="skill-card__stop"
        style={{ "--stop-color": color }}
        aria-hidden="true"
      />

      <div className="skill-card__body">
        <div className="skill-card__top">
          <span className="skill-card__name">{skill.name}</span>

          <span className="tag" style={{ "--tag-color": color }}>
            {skill.category}
          </span>
        </div>

        {skill.description && (
          <p className="skill-card__desc">{skill.description}</p>
        )}
      </div>
    </Link>
  );
}
