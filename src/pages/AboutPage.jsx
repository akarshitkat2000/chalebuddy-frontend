// src/pages/AboutPage.jsx
import { useNavigate } from "react-router-dom";

export default function AboutPage() {
  const navigate = useNavigate();

  return (
    <>
      {/* Hero */}
      <div className="about-hero" style={{ paddingTop: "calc(var(--nav-h) + 3rem)" }}>
        <span className="eyebrow" style={{ color: "rgba(255,255,255,.5)" }}>Our Story</span>
        <h1 style={{ marginTop: ".75rem" }}>
          Because No Great Story<br /><em>Starts with Traveling Alone.</em>
        </h1>
        <p style={{ color: "rgba(255,255,255,.6)", maxWidth: "520px", margin: "0 auto 2rem" }}>
          We believe the true magic of exploring the world is found when you have a companion to share the path with.
        </p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <button className="btn btn-orange" onClick={() => navigate("/find-guide")}>Find a Guide</button>
          <button className="btn btn-ghost-white" onClick={() => navigate("/become-guide")}>Become a Guide</button>
        </div>
      </div>

      {/* Story section */}
      <section style={{ background: "var(--cream)" }}>
        <div className="about-story">
          <div className="story-img">
            <img src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80" alt="India landscape" />
          </div>
          <div className="story-text">
            <span className="eyebrow">Who We Are</span>
            <h2>Connecting Souls Across India's Incredible Landscapes</h2>
            <p>Chale Buddy isn't just a website — it's a beacon of hope for thousands of solo travelers who feel the solitude of unknown roads.</p>
            <p>Founded in 2024 by a group of passionate Indian travelers from Kanpur, we built Chale Buddy after experiencing firsthand how much better every trip becomes when shared with the right people.</p>
            <p>Our platform bridges the gap between curious travelers and knowledgeable locals — from the ghats of Varanasi to the peaks of Ladakh.</p>
            <div className="story-highlight">
              "Our dream is simple: that no path remains unfamiliar, and no traveler ever walks alone."
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="about-stats">
        <div className="about-stats-inner">
          {[["10k+","Friendships Made"],["500+","Local Experts"],["100%","Safe & Verified"]].map(([n, l]) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div className="about-stat-num">{n}</div>
              <div className="about-stat-label">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Core values */}
      <section style={{ padding: "5rem 1.5rem" }}>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <span className="eyebrow">What We Stand For</span>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.8rem,3.5vw,3rem)", color: "var(--charcoal)", marginTop: ".75rem" }}>
            Our Core Values
          </h2>
        </div>
        <div className="about-values-grid">
          {[
            ["01","Local First","We believe local knowledge is the most valuable currency in travel."],
            ["02","Safety Always","Every guide is verified, background-checked, and reviewed by real travelers."],
            ["03","Inclusive Opportunity","Anyone 15+ with local knowledge can become a guide. No degree needed."],
            ["04","Authentic Experiences","No tourist traps, no scripted tours — just real India through real eyes."],
            ["05","Community First","2% of every booking goes back to support local artisan communities."],
            ["06","Never Walk Alone","Whether you need a guide, a buddy, or just a local food recommendation."],
          ].map(([n, t, d]) => (
            <div key={n} className="value-card">
              <div className="value-num">{n}</div>
              <div className="value-title">{t}</div>
              <p className="value-desc">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section style={{ background: "var(--cream)", padding: "5rem 1.5rem", textAlign: "center" }}>
        <span className="eyebrow">The Team</span>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.8rem,3vw,2.5rem)", color: "var(--charcoal)", marginTop: ".75rem", marginBottom: "1.25rem" }}>
          Built by Travelers, for Travelers
        </h2>
        <p style={{ color: "var(--stone)", maxWidth: "580px", margin: "0 auto", fontSize: "1.02rem", lineHeight: 1.8 }}>
          We are a small but passionate team of explorers, developers, and storytellers based in Kanpur, UP.
        </p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap", marginTop: "2.5rem" }}>
          <button className="btn btn-teal" onClick={() => navigate("/contact")}>Get in Touch</button>
          <button className="btn btn-ghost-teal" onClick={() => navigate("/become-guide")}>Join Our Guide Network</button>
        </div>
      </section>

      {/* CTA */}
      <div className="cta-banner">
        <span className="eyebrow" style={{ color: "rgba(255,255,255,.6)" }}>Join Us</span>
        <h2>Ready to Start Your Adventure?</h2>
        <p>Join thousands of travelers who've found their perfect companion on Chale Buddy.</p>
        <div className="cta-btns">
          <button className="btn btn-ghost-white" onClick={() => navigate("/create-trip")}>Find a Buddy</button>
          <button className="btn btn-orange" onClick={() => navigate("/find-guide")}>Hire a Guide</button>
        </div>
      </div>
    </>
  );
}
