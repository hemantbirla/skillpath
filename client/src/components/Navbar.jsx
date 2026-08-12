import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Explore", end: true },
  { to: "/courses", label: "Courses" },
  { to: "/path", label: "Path Finder" },
  { to: "/recommendations", label: "For You" },
];

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar__inner">
        <div className="wordmark">
          <span className="wordmark__dot" aria-hidden="true" />
          <span>SkillPath</span>
        </div>

        <nav className="navlinks" aria-label="Primary navigation">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                isActive ? "navlink navlink--active" : "navlink"
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
