import { useEffect, useRef, useState } from "react";
import "./HeroSection.css";

/* ─── tiny hook: intersection-based reveal ─── */
function useReveal(delay = 0) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return [ref, visible];
}

/* ─── Stats data ─── */
const STATS = [
  { num: "500+",  label: "Verified\nGuides"  },
  { num: "12k+",  label: "Trips\nCreated"    },
  { num: "200+",  label: "Cities\nCovered"   },
  { num: "4.9★",  label: "Avg\nRating"       },
];

export default function HeroSection() {
  const videoRef   = useRef(null);
  const [pill,   pillVisible  ] = useReveal(100);
  const [h1,     h1Visible    ] = useReveal(280);
  const [sub,    subVisible   ] = useReveal(480);
  const [btns,   btnsVisible  ] = useReveal(660);
  const [stats,  statsVisible ] = useReveal(850);

  /* ensure autoplay even after hydration */
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.play().catch(() => {});
  }, []);

  return (
    <section className="cb-hero" aria-label="ChaleBuddy Hero">

      {/* ══════════ VIDEO LAYER ══════════ */}
      <div className="cb-video-wrap">
        <video
          ref={videoRef}
          className="cb-video"
          src="/mp4.mp4"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
        />
        {/* LEFT FADE — seamless blend into #060d1a */}
        <div className="cb-video-fade-left"  aria-hidden="true" />
        {/* RIGHT edge + top + bottom vignette */}
        <div className="cb-video-vignette"   aria-hidden="true" />
      </div>

      {/* ══════════ CONTENT ══════════ */}
      <div className="cb-content">

        {/* ── Pill badge ── */}
        <div
          ref={pill}
          className={`cb-pill ${pillVisible ? "cb-reveal" : ""}`}
        >
          <span className="cb-pill-dot" aria-hidden="true" />
          India's #1 Travel Companion Platform&nbsp;·&nbsp;Est. 2026
        </div>

        {/* ── Headline ── */}
        <h1 ref={h1} className={`cb-h1 ${h1Visible ? "cb-reveal" : ""}`}>
  <span 
    className="cb-h1-white" 
    style={{ display: 'block', whiteSpace: 'nowrap' }}
  >
  Don't Travel
  </span>
  <em className="cb-h1-orange" style={{ display: 'block' }}>
    Alone
  </em>
</h1>

        {/* ── Sub ── */}
        <p
          ref={sub}
          className={`cb-sub ${subVisible ? "cb-reveal" : ""}`}
        >
          Connect with&nbsp;<strong>500+ verified local guides</strong>&nbsp;and
          fellow travelers for your next unforgettable Indian adventure.
        </p>

        {/* ── Buttons ── */}
        <div
          ref={btns}
          className={`cb-btns ${btnsVisible ? "cb-reveal" : ""}`}
        >
          <button className="cb-btn-outline">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            Explore More
          </button>

          <button className="cb-btn-orange">
            Find a Guide
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </div>

      {/* ══════════ STATS BAR ══════════ */}
      <div
        ref={stats}
        className={`cb-stats ${statsVisible ? "cb-reveal" : ""}`}
        role="list"
        aria-label="Platform statistics"
      >
        {STATS.map((s, i) => (
          <div key={s.num} className="cb-stat-wrap" role="listitem">
            <div className="cb-stat">
              <span className="cb-stat-num">{s.num}</span>
              <span className="cb-stat-label">
                {s.label.split("\n").map((l, j) => (
                  <span key={j} className="cb-stat-line">{l}</span>
                ))}
              </span>
            </div>
            {i < STATS.length - 1 && (
              <div className="cb-stat-sep" aria-hidden="true" />
            )}
          </div>
        ))}

        {/* scroll hint */}
        <div className="cb-scroll-hint" aria-hidden="true">
          <span className="cb-scroll-line" />
          <span className="cb-scroll-text">Scroll</span>
        </div>
      </div>

    </section>
  );
}
