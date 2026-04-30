import { useNavigate } from "react-router-dom";

export default function NavBar({ rightContent }) {
  const navigate = useNavigate();
  return (
    <>
      <nav className="nav-bar" role="navigation" aria-label="Main navigation">
        <span className="nav-brand" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
          MathQuick
        </span>
        {rightContent && <div style={{ display: "flex", alignItems: "center" }}>{rightContent}</div>}
      </nav>
      <div className="nav-spacer" />
    </>
  );
}
