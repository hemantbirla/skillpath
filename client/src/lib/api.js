const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

async function request(path) {
  let res;

  try {
    res = await fetch(`${API_BASE}${path}`);
  } catch (networkErr) {
    const err = new Error(
      "Could not reach the SkillPath API. Is the server running?",
    );

    err.cause = networkErr;
    throw err;
  }

  if (!res.ok) {
    let message = `Request failed (${res.status})`;

    try {
      const body = await res.json();

      if (body?.error) {
        message = body.error;
      }
    } catch {
      // Response wasn't JSON.
    }

    throw new Error(message);
  }

  return res.json();
}

export const api = {
  health: () => request("/health"),

  overview: () => request("/overview"),

  searchSkills: (term = "", category = "", difficulty = "") => {
    const params = new URLSearchParams();

    if (term) params.set("search", term);
    if (category) params.set("category", category);
    if (difficulty) params.set("difficulty", difficulty);

    const query = params.toString();

    return request(`/skills${query ? `?${query}` : ""}`);
  },

  gatewaySkills: () => request("/skills/gateways"),

  skill: (id) => request(`/skills/${encodeURIComponent(id)}`),

  searchCourses: (term = "") =>
    request(`/courses?search=${encodeURIComponent(term)}`),

  course: (id) => request(`/courses/${encodeURIComponent(id)}`),

  path: (from, to) =>
    request(
      `/path?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
    ),

  learners: () => request("/learners"),

  recommendations: (learnerId) =>
    request(`/learners/${encodeURIComponent(learnerId)}/recommendations`),
};
