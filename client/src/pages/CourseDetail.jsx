import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { api } from "../lib/api";
import { Loading, ErrorState, EmptyState } from "../components/States";

export default function CourseDetail() {
  const { id } = useParams();

  const [course, setCourse] = useState(null);
  const [error, setError] = useState(null);

  const load = () => {
    setCourse(null);
    setError(null);

    api
      .course(id)
      .then((response) => {
        setCourse(response.course);
      })
      .catch((err) => {
        setError(err.message);
      });
  };

  useEffect(() => {
    load();
  }, [id]);

  if (error) {
    return (
      <div className="page">
        <ErrorState message={error} onRetry={load} />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="page">
        <Loading label="Loading course" />
      </div>
    );
  }

  const requires = course.requires || [];
  const teaches = course.teaches || [];

  return (
    <div className="page">
      <div className="breadcrumb">
        <Link to="/courses">Courses</Link>
        <span>/</span>
        <span>{course.level}</span>
      </div>

      <p className="eyebrow">Course</p>

      <h1>{course.title}</h1>

      {course.description && (
        <p className="skill-detail__desc">{course.description}</p>
      )}

      <div className="meta-row">
        {course.durationHours !== null &&
          course.durationHours !== undefined && (
            <span className="mono">{course.durationHours}h</span>
          )}

        {course.provider && <span>{course.provider}</span>}

        {course.instructor && <span>Taught by {course.instructor}</span>}

        {course.url && (
          <a href={course.url} target="_blank" rel="noreferrer">
            Course page ↗
          </a>
        )}
      </div>

      <div className="skill-detail__grid">
        <div className="skill-detail__col">
          <h2 className="section-title">Requires</h2>

          {requires.length === 0 ? (
            <EmptyState
              title="No prerequisite skills"
              hint="A good starting point in the catalog."
            />
          ) : (
            <ul className="link-list">
              {requires.map((skill) => (
                <li key={skill.id}>
                  <Link to={`/skills/${skill.id}`}>{skill.name}</Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="skill-detail__col">
          <h2 className="section-title">Teaches</h2>

          {teaches.length === 0 ? (
            <EmptyState
              title="No skills listed"
              hint="This course doesn't currently have teaching relationships."
            />
          ) : (
            <ul className="link-list">
              {teaches.map((skill) => (
                <li key={skill.id}>
                  <Link to={`/skills/${skill.id}`}>{skill.name}</Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {requires.length > 0 && (
        <div className="cta-row">
          <Link className="btn btn--ghost" to={`/skills/${requires[0].id}`}>
            Explore prerequisites
          </Link>
        </div>
      )}
    </div>
  );
}
