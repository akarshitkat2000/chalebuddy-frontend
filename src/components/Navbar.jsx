import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import LogoSVG from "./LogoSVG";
import { useAuth } from "../context/AuthContext";
import { showToast } from "../data";

const NAV_LINKS = [
  { label:"Home",           to:"/" },
  { label:"Find a Guide",   to:"/find-guide" },
  { label:"Create a Trip",  to:"/create-trip" },
  { label:"Become a Guide", to:"/become-guide" },
  { label:"Local Food",     to:"/local-food" },
  { label:"Stays",          to:"/stays" },
  { label:"Transport",      to:"/transport" },
];

export default function Navbar({ openLogin }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout }        = useAuth();
  const navigate                = useNavigate();
  const close = () => setMenuOpen(false);

  const handleLogout = async () => {
    await logout();
    close();
    showToast("Logged out successfully 👋");
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner">
          <span className="nav-logo" onClick={() => { navigate("/"); close(); }}>
            <LogoSVG height={38} />
            <span className="nav-logo-fallback">ChaleBuddy</span>
          </span>

          <ul className="nav-links">
            {NAV_LINKS.map(({ label, to }) => (
              <li key={to}>
                <NavLink to={to} end={to==="/"} className={({ isActive }) => isActive ? "active" : ""} onClick={close}>
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="nav-right">
            {user ? (
              <div style={{ display:"flex", alignItems:"center", gap:".5rem" }}>
                {user.role === "admin" && (
                  <NavLink to="/admin" className={({ isActive }) => `btn btn-sm ${isActive ? "btn-orange" : "btn-ghost-white"}`} onClick={close}>
                    ⚙️ Admin
                  </NavLink>
                )}
                <div style={{ width:32, height:32, borderRadius:"50%", background:"var(--orange)", color:"white", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:".75rem", flexShrink:0, cursor:"pointer" }}
                  onClick={() => navigate(user.role === "admin" ? "/admin" : "/")}>
                  {user.name?.split(" ").map(w => w[0]).join("").toUpperCase().slice(0,2)}
                </div>
                <button className="btn btn-ghost-white btn-sm" onClick={handleLogout}>Logout</button>
              </div>
            ) : (
              <button className="btn btn-orange btn-sm" onClick={openLogin}>Sign In</button>
            )}
            <button className="hamburger" onClick={() => setMenuOpen(m => !m)}>
              <span /><span /><span />
            </button>
          </div>
        </div>
      </nav>

      {menuOpen && (
        <div className="mobile-menu">
          {NAV_LINKS.map(({ label, to }) => (
            <NavLink key={to} to={to} end={to==="/"} className={({ isActive }) => isActive?"active":""} onClick={close}>{label}</NavLink>
          ))}
          <NavLink to="/about"   onClick={close}>About Us</NavLink>
          <NavLink to="/contact" onClick={close}>Contact Us</NavLink>
          {user?.role === "admin" && <NavLink to="/admin" onClick={close}>⚙️ Admin Dashboard</NavLink>}
          {user ? (
            <button onClick={handleLogout}>Logout ({user.name?.split(" ")[0]})</button>
          ) : (
            <button onClick={() => { openLogin(); close(); }}>Sign In / Sign Up</button>
          )}
        </div>
      )}
    </>
  );
}
