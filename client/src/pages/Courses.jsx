import { useEffect, useState } from "react";

import { api } from "../lib/api";
import CourseCard from "../components/CourseCard";
import { Loading, EmptyState, ErrorState } from "../components/States";

export default function Courses() {
  const [term, setTerm] = useState("");
  const [courses, setCourses] = useState(null);
  const [error, setError] = useState(null);

  const load = () => {
    setError(null);
    setCourses(null);

    api
      .searchCourses(term)
      .then((response) => {
        setCourses(response.courses);
      })
      .catch((err) => {
        setError(err.message);
      });
  };

  useEffect(() => {
    const timer = setTimeout(load, 200);

    return () => clearTimeout(timer);
  }, [term]);

  return (
    <div className="page">
      <p className="eyebrow">Catalog</p>

      <h1>Courses</h1>

      <input
        className="search-input"
        type="search"
        placeholder='Search courses — try "kubernetes", "design"...'
        value={term}
        onChange={(event) => setTerm(event.target.value)}
        aria-label="Search courses"
      />

      {error && <ErrorState message={error} onRetry={load} />}

      {!error && courses === null && <Loading label="Loading courses" />}

      {!error && courses !== null && courses.length === 0 && (
        <EmptyState
          title="No courses match that search"
          hint="Try a shorter or different term."
        />
      )}

      {!error && courses !== null && courses.length > 0 && (
        <div className="course-grid">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}
