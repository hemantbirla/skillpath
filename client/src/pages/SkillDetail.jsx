import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../lib/api";
import { Loading, ErrorState, EmptyState } from "../components/States";

export default function SkillDetail() {
  const { id } = useParams();
  const [skill, setSkill] = useState(null);
  const [error, setError] = useState(null);

  const load = () => {
    setSkill(null);
    setError(null);
    api
      .skill(id)
      .then((r) => setSkill(r.skill))
      .catch((e) => setError(e.message));
  };

  useEffect(load, [id]);

  if (error)
    return (
      <div className="page">
        <ErrorState message={error} onRetry={load} />
      </div>
    );
  if (!skill)
    return (
      <div className="page">
        <Loading label="Loading skill" />
      </div>
    );

  return (
    <div className="page">
      <div className="breadcrumb">
        <Link to="/">Explore</Link> <span>/</span> <span>{skill.category}</span>
      </div>
      <h1>{skill.name}</h1>
      <p className="skill-detail__desc">{skill.description}</p>

      <div className="skill-detail__grid">
        <div className="skill-detail__col">
          <h2 className="section-title">Prerequisites</h2>
          {skill.prerequisites.length === 0 ? (
            <EmptyState
              title="No prerequisites"
              hint="This is a starting point in the graph."
            />
          ) : (
            <ul className="link-list">
              {skill.prerequisites.map((p) => (
                <li key={p.id}>
                  <Link to={`/skills/${p.id}`}>{p.name}</Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="skill-detail__col">
          <h2 className="section-title">Unlocks</h2>
          {skill.unlocks.length === 0 ? (
            <EmptyState
              title="Doesn't unlock anything yet"
              hint="This is currently a leaf skill in the graph."
            />
          ) : (
            <ul className="link-list">
              {skill.unlocks.map((u) => (
                <li key={u.id}>
                  <Link to={`/skills/${u.id}`}>{u.name}</Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <h2 className="section-title">Courses that teach this</h2>
      {skill.courses.length === 0 ? (
        <EmptyState
          title="No courses yet"
          hint="Nothing in the catalog teaches this skill directly."
        />
      ) : (
        <ul className="link-list link-list--courses">
          {skill.courses.map((c) => (
            <li key={c.id}>
              <Link to={`/courses/${c.id}`}>{c.title}</Link>
              <span className="pill">{c.level}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="cta-row">
        <Link className="btn" to={`/path?from=${skill.id}`}>
          Find a path from here
        </Link>
        <Link className="btn btn--ghost" to={`/path?to=${skill.id}`}>
          Find a path to here
        </Link>
      </div>
    </div>
  );
}
