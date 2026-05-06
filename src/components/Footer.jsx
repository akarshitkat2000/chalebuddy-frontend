// src/components/Footer.jsx
import { Link } from "react-router-dom";
import LogoSVG from "./LogoSVG";
import { showToast } from "../data";

const EXPLORE_LINKS = [
  ["Home", "/"],
  ["Find a Guide", "/find-guide"],
  ["Create a Trip", "/create-trip"],
  ["Local Food", "/local-food"],
  ["Stays", "/stays"],
  ["Transport", "/transport"],
  ["Become a Guide", "/become-guide"],
];

const COMPANY_LINKS = [
  ["About Us", "/about"],
  ["Contact Us", "/contact"],
];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-grid">

          {/* Brand column */}
          <div>
            <div className="footer-logo">
              <LogoSVG height={32} />
              <span className="footer-logo-text" style={{ display: "none" }}>
                ChaleBuddy
              </span>
            </div>
            <p className="footer-tagline">
              India's #1 solo travel companion platform. Crafted with ❤️ in Kanpur, UP since 2024.
            </p>
          </div>

          {/* Explore */}
          <div>
            <div className="footer-heading">Explore</div>
            <div className="footer-links">
              {EXPLORE_LINKS.map(([label, to]) => (
                <Link key={to} to={to}>{label}</Link>
              ))}
            </div>
          </div>

          {/* Company */}
          <div>
            <div className="footer-heading">Company</div>
            <div className="footer-links">
              {COMPANY_LINKS.map(([label, to]) => (
                <Link key={to} to={to}>{label}</Link>
              ))}
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
            </div>
          </div>

          {/* Download + Pledge */}
          <div>
            <div className="footer-heading">Download App</div>
            <div className="footer-links">
              <button onClick={() => showToast("Android app aayega jald hi! 📱")}>
                📱 Google Play
              </button>
              <button onClick={() => showToast("iOS app aayega jald hi! 🍎")}>
                🍎 App Store
              </button>
            </div>
            <div style={{ marginTop: "1.25rem" }}>
              <div className="footer-heading">Our Pledge</div>
              <p style={{ color: "rgba(255,255,255,0.28)", fontSize: ".78rem", lineHeight: 1.7 }}>
                2% of every booking supports local artisan communities. 🌿
              </p>
            </div>
          </div>

        </div>

        <div className="footer-bottom">
          <div className="footer-copy">
            © 2024 Chale Buddy · chalebuddy.in · Solo Travelers Welcome.
          </div>
          <div style={{ color: "rgba(255,255,255,0.18)", fontSize: ".73rem" }}>
            Designed for exploration. Rooted in tradition.
          </div>
        </div>
      </div>
    </footer>
  );
}
