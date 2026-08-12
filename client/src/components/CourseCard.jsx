import { Link } from "react-router-dom";

export default function CourseCard({ course }) {
  return (
    <Link to={`/courses/${course.id}`} className="course-card">
      <div className="course-card__top">
        <span className="course-card__title">{course.title}</span>

        {course.level && <span className="tag">{course.level}</span>}
      </div>

      <div className="course-card__meta">
        {course.durationHours !== null &&
          course.durationHours !== undefined && (
            <span className="pill">{course.durationHours}h</span>
          )}

        {course.provider && <span className="pill">{course.provider}</span>}

        {course.instructor && <span>{course.instructor}</span>}
      </div>

      {course.skillsTaught?.length > 0 && (
        <div className="chip-row">
          {course.skillsTaught.map((skill) => (
            <span className="chip" key={skill}>
              {skill}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
