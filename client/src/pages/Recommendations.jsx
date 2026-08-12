import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { api } from "../lib/api";
import { Loading, EmptyState, ErrorState } from "../components/States";

export default function Recommendations() {
  const [learners, setLearners] = useState(null);
  const [learnerId, setLearnerId] = useState("");
  const [recs, setRecs] = useState(null);
  const [error, setError] = useState(null);

  // Load learners
  useEffect(() => {
    api
      .learners()
      .then((response) => {
        const learnerList = response.learners || [];

        setLearners(learnerList);

        if (learnerList.length > 0) {
          setLearnerId(learnerList[0].id);
        }
      })
      .catch((err) => {
        setError(err.message);
        setLearners([]);
      });
  }, []);

  // Load recommendations whenever learner changes
  useEffect(() => {
    if (!learnerId) {
      setRecs(null);
      return;
    }

    setRecs(null);
    setError(null);

    api
      .recommendations(learnerId)
      .then((response) => {
        setRecs(response.recommendations || []);
      })
      .catch((err) => {
        setError(err.message);
      });
  }, [learnerId]);

  const retry = () => {
    window.location.reload();
  };

  return (
    <div className="page">
      <p className="eyebrow">Readiness + peer signal</p>

      <h1>What should this learner take next?</h1>

      <p className="hero__sub">
        A course qualifies when every skill it requires is already something the
        learner has, and it teaches at least one new skill. Results are ranked
        by how many similar learners — people who share two or more known skills
        — have already completed it.
      </p>

      {error && <ErrorState message={error} onRetry={retry} />}

      {!error && learners === null && <Loading label="Loading learners" />}

      {!error && learners?.length === 0 && (
        <EmptyState
          title="No learners found"
          hint="There are currently no learners available for recommendations."
        />
      )}

      {!error && learners && learners.length > 0 && (
        <>
          <div className="learner-picker">
            {learners.map((learner) => (
              <button
                key={learner.id}
                type="button"
                className={
                  learner.id === learnerId
                    ? "learner-chip learner-chip--active"
                    : "learner-chip"
                }
                onClick={() => setLearnerId(learner.id)}
              >
                {learner.name}
                <span className="mono"> · {learner.skillCount} skills</span>
              </button>
            ))}
          </div>

          {learnerId && recs === null && !error && (
            <Loading label="Finding matches" />
          )}

          {recs && recs.length === 0 && (
            <EmptyState
              title="Nothing new to recommend right now"
              hint="This learner already qualifies for everything reachable from their current skills."
            />
          )}

          {recs && recs.length > 0 && (
            <ul className="rec-list">
              {recs.map((course) => (
                <li key={course.id} className="rec-card">
                  <div className="rec-card__top">
                    <Link
                      to={`/courses/${course.id}`}
                      className="rec-card__title"
                    >
                      {course.title}
                    </Link>

                    <span className="pill">{course.level}</span>
                  </div>

                  <div className="meta-row">
                    <span className="mono">{course.durationHours}h</span>

                    <span>
                      {course.peersCompleted} similar learner
                      {course.peersCompleted === 1 ? "" : "s"} completed this
                    </span>
                  </div>

                  {course.newSkills?.length > 0 && (
                    <div className="chip-row">
                      {course.newSkills.map((skill) => (
                        <span className="chip" key={skill}>
                          + {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
