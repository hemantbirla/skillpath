import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { api } from "../lib/api";
import PathLine from "../components/PathLine";
import { Loading, EmptyState, ErrorState } from "../components/States";

export default function PathFinder() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [allSkills, setAllSkills] = useState(null);
  const [from, setFrom] = useState(searchParams.get("from") || "");
  const [to, setTo] = useState(searchParams.get("to") || "");

  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api
      .searchSkills("")
      .then((response) => {
        setAllSkills(response.skills);
      })
      .catch((err) => {
        setError(err.message);
      });
  }, []);

  const findPath = async (event) => {
    event?.preventDefault();

    if (!from || !to) {
      return;
    }

    setSearchParams({ from, to });
    setError(null);
    setResult(null);
    setLoading(true);

    try {
      const response = await api.path(from, to);
      setResult(response);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (allSkills && from && to) {
      findPath();
    }

    // Intentionally runs when skills finish loading.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allSkills]);

  return (
    <div className="page">
      <p className="eyebrow">Multi-hop traversal</p>

      <h1>Find the path between two skills</h1>

      <p className="hero__sub">
        Pick a skill you know and one you want to learn. SkillPath walks the
        shortest chain of prerequisites between them — a query that needs a
        bounded recursive CTE in SQL, but is one
        <code>shortestPath()</code> pattern here.
      </p>

      <form className="path-form" onSubmit={findPath}>
        <label className="field">
          <span>From</span>

          <select
            value={from}
            onChange={(event) => setFrom(event.target.value)}
            required
          >
            <option value="" disabled>
              Choose a skill…
            </option>

            {(allSkills || []).map((skill) => (
              <option key={skill.id} value={skill.id}>
                {skill.name}
              </option>
            ))}
          </select>
        </label>

        <span className="path-form__arrow" aria-hidden="true">
          →
        </span>

        <label className="field">
          <span>To</span>

          <select
            value={to}
            onChange={(event) => setTo(event.target.value)}
            required
          >
            <option value="" disabled>
              Choose a skill…
            </option>

            {(allSkills || []).map((skill) => (
              <option key={skill.id} value={skill.id}>
                {skill.name}
              </option>
            ))}
          </select>
        </label>

        <button
          className="btn"
          type="submit"
          disabled={!from || !to || loading}
        >
          {loading ? "Finding…" : "Find path"}
        </button>
      </form>

      {loading && <Loading label="Walking the graph" />}

      {error && <ErrorState message={error} onRetry={findPath} />}

      {!loading && !error && result && !result.found && (
        <EmptyState
          title="No path found"
          hint="There's no chain of prerequisites connecting these two skills in either direction."
        />
      )}

      {!loading && !error && result?.found && (
        <div className="path-result">
          <p className="path-result__summary">
            <span className="mono">{result.hops}</span> hop
            {result.hops === 1 ? "" : "s"} — {result.steps.length} stops
            {result.reversed && (
              <span className="pill pill--muted">reverse direction</span>
            )}
          </p>

          {result.reversed && (
            <p className="side-hint">
              No chain runs from your “from” skill to your “to” skill, but one
              runs the other way — shown below.
            </p>
          )}

          <PathLine steps={result.steps} />
        </div>
      )}
    </div>
  );
}
