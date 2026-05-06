// src/pages/HomePage.jsx
import { useNavigate } from "react-router-dom";
import { STAYS_DATA, TRIPS, showToast } from "../data";
import HeroSection from "../components/HeroSection";

const SERVICES = [
  { icon: "🧭", label: "Find a Guide",   to: "/find-guide" },
  { icon: "🗺️", label: "Create a Trip",  to: "/create-trip" },
  { icon: "🍛", label: "Local Food",     to: "/local-food" },
  { icon: "🏠", label: "Stays",          to: "/stays" },
  { icon: "🚂", label: "Transport",      to: "/transport" },
  { icon: "🏆", label: "Become a Guide", to: "/become-guide" },
];

export default function HomePage({ openLogin }) {
  const navigate      = useNavigate();
  const featuredStays = STAYS_DATA.slice(0, 3);

  return (
    <>
      {/* HERO — Video Background */}
      <HeroSection />

      {/* SERVICES STRIP */}
      <div className="services-strip">
        <div className="services-inner">
          {SERVICES.map(s => (
            <button key={s.to} className="service-pill" onClick={() => navigate(s.to)}>
              <span>{s.icon}</span><span>{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* TRANSPORT STRIP — replaces WHY section */}
      <div className="transport-strip" style={{ position:"relative" }}>
        <div className="transport-inner">
          <span className="eyebrow" style={{ color:"rgba(240,123,36,.8)" }}>Book Anywhere, Anytime</span>
          <h2>Your Journey, <em style={{ fontStyle:"italic", color:"var(--orange)" }}>Your Way.</em></h2>
          <p>Train, Bus, ya Flight — ek jagah se sab book karo. India ke kone kone tak pahunchne ka sabse aasaan tarika.</p>
          <div className="transport-modes">
            {[
              { icon:"🚂", title:"Trains",         sub:"500+ routes" },
              { icon:"🚌", title:"Buses",           sub:"200+ operators" },
              { icon:"✈️", title:"Flights",         sub:"All major airlines" },
              { icon:"🚗", title:"Local Transport", sub:"Auto, Cab & more" },
            ].map(m => (
              <div key={m.title} className="transport-mode-card" onClick={() => navigate("/transport")}>
                <div className="transport-mode-icon">{m.icon}</div>
                <div className="transport-mode-title">{m.title}</div>
                <div className="transport-mode-sub">{m.sub}</div>
              </div>
            ))}
          </div>
          <button className="btn btn-orange" onClick={() => navigate("/transport")}>Book Transport Now →</button>
        </div>
        <div className="train-animate">
          <div className="train-track" />
          <div className="train-loco">🚂</div>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <section className="how-section">
        <div className="how-header">
          <span className="eyebrow" style={{ color:"rgba(240,123,36,.85)" }}>Simple Process</span>
          <h2>Adventure in 3 Simple Steps</h2>
          <p style={{ color:"rgba(255,255,255,.55)", marginTop:".75rem" }}>Post your trip, get matched, and explore — we handle every step.</p>
        </div>
        <div className="how-steps">
          {[
            { n:"01", icon:"🗺️", t:"Post Your Trip",   d:"Share your destination, dates, and interests. Your perfect adventure starts with one post." },
            { n:"02", icon:"🤝", t:"Match & Connect",  d:"Get matched with verified travel buddies or book a local guide who knows every hidden alley." },
            { n:"03", icon:"✨", t:"Explore Together", d:"Eat local food, see hidden gems, make friends for life. Stories that stay with you forever." },
          ].map(s => (
            <div key={s.n} className="how-step">
              <div className="how-num">{s.n}</div>
              <div className="how-step-icon">{s.icon}</div>
              <div className="how-step-title">{s.t}</div>
              <div className="how-step-desc">{s.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED STAYS */}
      <section className="home-section">
        <div className="section-header">
          <div>
            <span className="eyebrow">Popular Stays</span>
            <h2>Ghar Jaisa <em style={{ fontStyle:"italic", color:"var(--orange)" }}>Sukoon</em></h2>
          </div>
          <button className="btn btn-ghost-teal btn-sm" onClick={() => navigate("/stays")}>View All Stays →</button>
        </div>
        <div className="cards-scroll">
          {featuredStays.map(s => (
            <div key={s.id} className="stay-preview-card">
              <div className="stay-card-img">
                <img src={s.img} alt={s.name} />
                <div className="stay-badge-overlay">
                  {s.type==="homestay"?"🍛 Homestay":s.type==="quick"?"⚡ Quick Stay":"🌙 Overnight"}
                </div>
                <button className="stay-heart" onClick={() => showToast("Wishlist mein add! ❤️")}>🤍</button>
              </div>
              <div className="stay-body-p">
                <div className="stay-city">📍 {s.city}, {s.area}</div>
                <div className="stay-name">{s.name}</div>
                <div className="stay-host">Hosted by {s.host} · ★ {s.rating}</div>
                <div className="stay-amenities">
                  {s.amenities.slice(0,3).map(a => <span key={a} className="stay-amenity">{a}</span>)}
                </div>
                <div className="stay-footer-p">
                  <div className="stay-price-p">₹{s.overnightPrice.toLocaleString("en-IN")} <span>/night</span></div>
                  <button className="btn btn-teal btn-sm" onClick={() => navigate("/stays")}>Book →</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOD TEASER */}
      <section style={{ background:"linear-gradient(135deg,#1a0800,#2d1400)", padding:"5rem 1.5rem" }}>
        <div className="food-inner">
          <div className="food-text">
            <span className="eyebrow" style={{ color:"rgba(240,123,36,.8)" }}>India Ka Asli Zaika</span>
            <h2>Eat Where the <em>Locals Eat.</em></h2>
            <p>From Varanasi's legendary kachori-sabzi to Mumbai's pav bhaji — our food guides know every hidden dhaba, rooftop kitchen, and secret chai stall.</p>
            <button className="btn btn-orange" onClick={() => navigate("/local-food")}>Explore Local Food →</button>
          </div>
          <div className="food-grid-mini">
            {[["🥙","Kachori-Sabzi","Varanasi"],["🍚","Biryani","Lucknow"],["☕","Masala Chai","All India"],["🥞","Dosa","Chennai"]].map(([e,n,c]) => (
              <div key={n} className="food-mini-card" onClick={() => navigate("/local-food")}>
                <div className="food-mini-emoji">{e}</div>
                <div className="food-mini-name">{n}</div>
                <div className="food-mini-city">{c}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMMUNITY TRIPS */}
      <section className="home-section">
        <div className="section-header">
          <div>
            <span className="eyebrow">Community Trips</span>
            <h2>Find Your Travel Buddy</h2>
          </div>
          <button className="btn btn-ghost-teal btn-sm" onClick={() => navigate("/create-trip")}>Post Your Trip →</button>
        </div>
        <div className="cards-scroll">
          {TRIPS.map(t => (
            <div key={t.id} className="trip-card">
              <div className="trip-img"><img src={t.img} alt={t.title} /></div>
              <div className="trip-body">
                <div className="trip-location">{t.location}</div>
                <div className="trip-title">{t.title}</div>
                <div className="trip-desc">{t.desc}</div>
                <div className="trip-footer">
                  <span className="trip-date">{t.date}</span>
                  <button className="btn btn-teal btn-sm" onClick={() => navigate("/create-trip")}>Join →</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="testi-section">
        <div className="testi-inner">
          <div style={{ textAlign:"center", marginBottom:"3rem" }}>
            <span className="eyebrow">Real Stories</span>
            <h2 style={{ fontFamily:"var(--font-display)", fontSize:"clamp(1.6rem,3vw,2.5rem)", color:"var(--charcoal)", marginTop:".75rem" }}>
              What Travelers Say
            </h2>
            <p style={{ color:"var(--stone)", marginTop:".75rem" }}>Over 12,000 adventures and counting — all starting on Chale Buddy.</p>
          </div>
          <div className="testi-grid">
            {[
              { q:`"Found my trek buddy for Kedarnath through Chale Buddy. Made a lifelong friend — 10/10!"`, n:"Ravi Kumar", c:"📍 Delhi → Kedarnath", av:"RK", bg:"var(--teal)" },
              { q:`"Our Varanasi guide Meera knew every gali, every ghat, every best chai spot. She made Varanasi feel like home in just 2 days!"`, n:"Ananya Singh", c:"📍 Pune → Varanasi", av:"AS", bg:"#059669" },
              { q:`"Solo female traveler — Chale Buddy's verified guides gave me the confidence to explore India on my own terms!"`, n:"Preethi M.", c:"📍 Bengaluru → Manali", av:"PM", bg:"#7C3AED" },
            ].map(t => (
              <div key={t.n} className="testi-card">
                <div className="testi-stars">★★★★★</div>
                <p className="testi-quote">{t.q}</p>
                <div className="testi-author">
                  <div className="testi-av" style={{ background:t.bg }}>{t.av}</div>
                  <div><div className="testi-name">{t.n}</div><div className="testi-city">{t.c}</div></div>
                </div>
              </div>
            ))}
          </div>
          <div className="trust-bar">
            {[["4.9 ★","Avg Rating"],["12k+","Trips Done"],["98%","Recommend"],["500+","Guides"]].map(([n,l],i,a) => (
              <div key={l} style={{ display:"flex", alignItems:"center", gap:"3rem" }}>
                <div style={{ textAlign:"center" }}>
                  <div className="trust-num">{n}</div>
                  <div className="trust-label">{l}</div>
                </div>
                {i < a.length-1 && <div className="trust-div" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <div className="cta-banner">
        <span className="eyebrow" style={{ color:"rgba(255,255,255,.55)" }}>Start Today</span>
        <h2>Start Your Journey Alone,<br />But Never Feel Lonely.</h2>
        <p>Guides ready hain. Buddies ready hain. Sirf tu nikal. 🎒</p>
        <div className="cta-btns">
          <button className="btn btn-orange"      onClick={() => navigate("/create-trip")}>🗺️ Create a Trip</button>
          <button className="btn btn-ghost-white" onClick={() => navigate("/become-guide")}>Become a Guide</button>
          <button className="btn btn-ghost-white" onClick={openLogin}>Sign Up Free</button>
        </div>
      </div>
    </>
  );
}
