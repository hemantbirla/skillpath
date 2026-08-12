import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { api } from "../lib/api";
import SkillCard from "../components/SkillCard";
import { Loading, EmptyState, ErrorState } from "../components/States";

export default function Explore() {
  const [term, setTerm] = useState("");
  const [skills, setSkills] = useState(null);
  const [error, setError] = useState(null);

  const [gateways, setGateways] = useState(null);
  const [gatewayError, setGatewayError] = useState(null);

  const [overview, setOverview] = useState(null);

  // ------------------------------------------------------------
  // Load skills
  // ------------------------------------------------------------

  const load = () => {
    setError(null);
    setSkills(null);

    api
      .searchSkills(term)
      .then((response) => {
        setSkills(response.skills || []);
      })
      .catch((err) => {
        setError(err.message || "Unable to load skills.");
      });
  };

  // ------------------------------------------------------------
  // Search with small debounce
  // ------------------------------------------------------------

  useEffect(() => {
    const timer = setTimeout(load, 200);

    return () => clearTimeout(timer);

    // load intentionally depends on the current search term.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [term]);

  // ------------------------------------------------------------
  // Load sidebar data
  // ------------------------------------------------------------

  useEffect(() => {
    api
      .gatewaySkills()
      .then((response) => {
        setGateways(response.skills || []);
      })
      .catch((err) => {
        setGatewayError(err.message || "Unable to load gateway skills.");
        setGateways([]);
      });

    api
      .overview()
      .then((response) => {
        setOverview(response.overview || null);
      })
      .catch(() => {
        // Overview is supplementary content.
        // Do not block the main skill explorer if it fails.
        setOverview(null);
      });
  }, []);

  // ------------------------------------------------------------
  // Group skills by category
  // ------------------------------------------------------------

  const grouped = (skills || []).reduce((acc, skill) => {
    const category = skill.category || "Other";

    if (!acc[category]) {
      acc[category] = [];
    }

    acc[category].push(skill);

    return acc;
  }, {});

  return (
    <div className="page">
      {/* ------------------------------------------------------
          Hero
      ------------------------------------------------------- */}

      <section className="hero">
        <p className="eyebrow">Knowledge graph · skills &amp; courses</p>

        <h1>Every skill is a stop. Every prerequisite is a line.</h1>

        <p className="hero__sub">
          SkillPath models {overview ? overview.skillCount : "…"} skills and{" "}
          {overview ? overview.courseCount : "…"} courses as a graph, so you can
          trace exactly how one skill leads to the next — and find the shortest
          way to get somewhere new.
        </p>

        <input
          className="search-input"
          type="search"
          placeholder='Search skills — try "react", "sql", "docker"…'
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          aria-label="Search skills"
        />
      </section>

      {/* ------------------------------------------------------
          Explore layout
      ------------------------------------------------------- */}

      <div className="explore-layout">
        {/* ----------------------------------------------------
            Skills
        ----------------------------------------------------- */}

        <div className="explore-main">
          {error && (
            <ErrorState
              title="Could not load skills"
              message={error}
              onRetry={load}
            />
          )}

          {!error && skills === null && <Loading label="Loading skills" />}

          {!error && skills !== null && skills.length === 0 && (
            <EmptyState
              title="No skills match that search"
              hint="Try a shorter or different term."
            />
          )}

          {!error &&
            skills !== null &&
            Object.entries(grouped).map(([category, list]) => (
              <section key={category} className="category-block">
                <h2 className="category-block__title">{category}</h2>

                <div className="skill-grid">
                  {list.map((skill) => (
                    <SkillCard key={skill.id} skill={skill} />
                  ))}
                </div>
              </section>
            ))}
        </div>

        {/* ----------------------------------------------------
            Gateway skills
        ----------------------------------------------------- */}

        <aside className="explore-side">
          <h3 className="side-title">Gateway skills</h3>

          <p className="side-hint">
            Ranked by how many other skills they eventually unlock — a
            transitive-closure query over the whole graph.
          </p>

          {gateways === null && <Loading label="Ranking" />}

          {gatewayError && (
            <ErrorState
              title="Could not load gateway skills"
              message={gatewayError}
              onRetry={() => {
                setGatewayError(null);
                setGateways(null);

                api
                  .gatewaySkills()
                  .then((response) => {
                    setGateways(response.skills || []);
                  })
                  .catch((err) => {
                    setGatewayError(
                      err.message || "Unable to load gateway skills.",
                    );
                    setGateways([]);
                  });
              }}
            />
          )}

          {!gatewayError && gateways && gateways.length === 0 && (
            <EmptyState
              title="No gateway skills"
              hint="No prerequisite relationships were found."
            />
          )}

          {!gatewayError && gateways && gateways.length > 0 && (
            <ol className="gateway-list">
              {gateways.map((gateway, index) => (
                <li key={gateway.id}>
                  <Link
                    to={`/skills/${gateway.id}`}
                    className="gateway-list__link"
                  >
                    <span className="mono gateway-list__rank">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <span>{gateway.name}</span>

                    <span className="mono gateway-list__count">
                      {gateway.unlockedCount}
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </aside>
      </div>
    </div>
  );
}
