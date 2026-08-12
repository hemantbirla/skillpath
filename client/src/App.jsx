import { Link, Route, Routes } from "react-router-dom";

import Navbar from "./components/Navbar";

import Explore from "./pages/Explore";
import SkillDetail from "./pages/SkillDetail";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import PathFinder from "./pages/PathFinder";
import Recommendations from "./pages/Recommendations";

function NotFound() {
  return (
    <div className="page state state--empty">
      <p className="state__title">That page doesn't exist</p>

      <p className="state__hint">
        <Link to="/">Back to Explore</Link>
      </p>
    </div>
  );
}

export default function App() {
  return (
    <div className="app-shell">
      <Navbar />

      <main>
        <Routes>
          <Route path="/" element={<Explore />} />

          <Route path="/skills/:id" element={<SkillDetail />} />

          <Route path="/courses" element={<Courses />} />

          <Route path="/courses/:id" element={<CourseDetail />} />

          <Route path="/path" element={<PathFinder />} />

          <Route path="/recommendations" element={<Recommendations />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <footer className="app-footer">
        <span>SkillPath — a knowledge graph on CognoDB</span>
      </footer>
    </div>
  );
}
