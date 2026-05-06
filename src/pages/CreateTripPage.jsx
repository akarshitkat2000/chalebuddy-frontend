import { useState, useEffect } from "react";
import { tripsAPI, bookingsAPI } from "../services/api";
import { showToast } from "../data";

const ALL_TAGS = [
  "🛕 Ancient Temples","🍛 Local Cuisines","🎨 Artisan Crafts",
  "🌿 Rural Landscapes","🧘 Wellness & Yoga","📸 Photography",
  "🏔️ Trekking","🎵 Music & Dance",
];

/* ── Join Trip Modal ─────────────────────────────────────── */
function JoinModal({ trip, onClose }) {
  const [form,    setForm]    = useState({ name:"", message:"" });
  const [loading, setLoading] = useState(false);
  const [done,    setDone]    = useState(false);
  const [error,   setError]   = useState("");
  const change = f => e => setForm(p => ({ ...p, [f]: e.target.value }));

  const submit = async () => {
    if (!form.name.trim()) { setError("Please enter your name."); return; }
    setLoading(true); setError("");
    try {
      await tripsAPI.join(trip._id || trip.id, { name: form.name, message: form.message });
      setDone(true);
      showToast(`Join request sent to ${trip.creatorName || "organizer"}! 🤝`);
    } catch (err) {
      setError(err.message || "Failed to send request.");
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-card" style={{ maxWidth: 440 }}>
        <div className="modal-top">
          <div>
            <h2>{done ? "Request Sent! 🤝" : `Join: ${trip.title}`}</h2>
            <p style={{ color:"var(--stone)", fontSize:".875rem", marginTop:".25rem" }}>
              {done ? "The trip organizer will contact you soon." : `📍 ${trip.destination}`}
            </p>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        {done ? (
          <div style={{ textAlign:"center", padding:"1rem 0" }}>
            <div style={{ fontSize:"3rem", marginBottom:"1rem" }}>🎒</div>
            <p style={{ color:"var(--stone)", marginBottom:"1.5rem" }}>Your join request has been saved. The organizer will reach out to confirm!</p>
            <button className="btn btn-teal btn-full" onClick={onClose}>Done</button>
          </div>
        ) : (
          <>
            {error && <div style={{ background:"#FEF2F2", border:"1px solid #FECACA", borderRadius:"var(--r)", padding:".75rem", marginBottom:"1rem", color:"#DC2626", fontSize:".84rem" }}>{error}</div>}
            <div className="form-group">
              <label className="form-label">Your Name *</label>
              <input className="form-input" type="text" placeholder="Aarav Sharma" value={form.name} onChange={change("name")} />
            </div>
            <div className="form-group">
              <label className="form-label">Message to Organizer</label>
              <textarea className="form-textarea" style={{ minHeight:80 }} placeholder="Tell them about yourself and why you want to join…" value={form.message} onChange={change("message")} />
            </div>
            <button className="btn btn-teal btn-full" onClick={submit} disabled={loading}>
              {loading ? "Sending…" : "Send Join Request →"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* ── Main Page ───────────────────────────────────────────── */
export default function CreateTripPage() {
  const [trips,     setTrips]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [posting,   setPosting]   = useState(false);
  const [joinModal, setJoinModal] = useState(null);
  const [posted,    setPosted]    = useState(null); // created trip
  const [error,     setError]     = useState("");
  const [bTab,      setBTab]      = useState("All");

  const [form, setForm] = useState({
    creatorName:"", destination:"", travelDate:"", duration:"1–3 Days",
    budget:"Budget (Below ₹5k)", interests:["🛕 Ancient Temples"],
    description:"", maxBuddies:"3", gender:"Any",
  });

  const change = f => e => setForm(p => ({ ...p, [f]: e.target.value }));
  const toggleTag = t => setForm(p => ({
    ...p,
    interests: p.interests.includes(t) ? p.interests.filter(x => x !== t) : [...p.interests, t],
  }));

  // Fetch existing trips
  useEffect(() => {
    tripsAPI.getAll({ limit: 20, sort: "-createdAt" })
      .then(res => setTrips(res.trips || res.data?.trips || []))
      .catch(() => setTrips([]))
      .finally(() => setLoading(false));
  }, []);

  const handlePost = async () => {
    if (!form.creatorName.trim()) { setError("Please enter your name."); return; }
    if (!form.destination.trim()) { setError("Please enter a destination."); return; }
    if (!form.travelDate)         { setError("Please select a travel date."); return; }
    setPosting(true); setError("");
    try {
      const res = await tripsAPI.create({
        ...form,
        title: `${form.destination} Trip by ${form.creatorName}`,
        travelDate: new Date(form.travelDate).toISOString(),
        maxBuddies: parseInt(form.maxBuddies, 10),
      });
      const created = res.data?.trip || res.trip;
      setPosted(created);
      setTrips(prev => [created, ...prev]);
      showToast("Trip posted! Buddies will find you 🗺️");
    } catch (err) {
      setError(err.message || "Failed to post trip. Please try again.");
    } finally { setPosting(false); }
  };

  const filteredTrips = bTab === "All" ? trips
    : trips.filter(t => t.gender === bTab || t.gender === "Any");

  return (
    <>
      {/* Hero */}
      <div className="ct-hero-bar">
        <div>
          <h1>Map Your Soul's Journey</h1>
          <p>Post your trip and find verified travel buddies heading the same way.</p>
        </div>
      </div>

      <div className="ct-layout">
        {/* ── Post Trip Form ───────────────────────────────── */}
        <div className="ct-panel">
          <h2>Post Your Trip</h2>
          <p style={{ color:"var(--stone)", fontSize:".85rem", marginBottom:"1.5rem" }}>
            Fill in the details and let travel buddies find you.
          </p>

          {posted ? (
            <div style={{ textAlign:"center", padding:"2rem 0" }}>
              <div style={{ fontSize:"3rem", marginBottom:"1rem" }}>🗺️</div>
              <h3 style={{ fontFamily:"var(--font-display)", color:"var(--charcoal)", marginBottom:".5rem" }}>Trip Posted!</h3>
              <p style={{ color:"var(--stone)", marginBottom:".5rem" }}>
                Your trip to <strong>{posted.destination}</strong> is now live.
              </p>
              <p style={{ color:"var(--stone)", fontSize:".85rem", marginBottom:"1.5rem" }}>
                Ref ID: <code style={{ background:"var(--cream-dark)", padding:"2px 8px", borderRadius:4 }}>{posted._id?.slice(-8).toUpperCase()}</code>
              </p>
              <button className="btn btn-ghost-teal" onClick={() => { setPosted(null); setForm({ creatorName:"", destination:"", travelDate:"", duration:"1–3 Days", budget:"Budget (Below ₹5k)", interests:["🛕 Ancient Temples"], description:"", maxBuddies:"3", gender:"Any" }); }}>
                Post Another Trip
              </button>
            </div>
          ) : (
            <>
              {error && <div style={{ background:"#FEF2F2", border:"1px solid #FECACA", borderRadius:"var(--r)", padding:".75rem", marginBottom:"1rem", color:"#DC2626", fontSize:".84rem" }}>{error}</div>}

              <div style={{ marginBottom:"1.25rem" }}>
                <div className="step-lbl"><span className="step-badge">1</span> Your Name *</div>
                <input className="form-input" type="text" placeholder="Aarav Sharma" value={form.creatorName} onChange={change("creatorName")} />
              </div>
              <div style={{ marginBottom:"1.25rem" }}>
                <div className="step-lbl"><span className="step-badge">2</span> Destination *</div>
                <input className="form-input" type="text" placeholder="e.g. Varanasi, Manali, Hampi…" value={form.destination} onChange={change("destination")} />
              </div>
              <div className="form-row" style={{ marginBottom:"1.25rem" }}>
                <div>
                  <div className="step-lbl"><span className="step-badge">3</span> Travel Date *</div>
                  <input className="form-input" type="date" value={form.travelDate} onChange={change("travelDate")} min={new Date().toISOString().split("T")[0]} />
                </div>
                <div>
                  <div className="step-lbl"><span className="step-badge">4</span> Duration</div>
                  <select className="form-select" value={form.duration} onChange={change("duration")}>
                    <option>1–3 Days</option><option>4–7 Days</option><option>1–2 Weeks</option><option>2+ Weeks</option>
                  </select>
                </div>
              </div>
              <div className="form-row" style={{ marginBottom:"1.25rem" }}>
                <div>
                  <div className="step-lbl"><span className="step-badge">5</span> Budget</div>
                  <select className="form-select" value={form.budget} onChange={change("budget")}>
                    <option>Budget (Below ₹5k)</option><option>Mid-range (₹5k–₹15k)</option><option>Premium (₹15k–₹40k)</option><option>Luxury (₹40k+)</option>
                  </select>
                </div>
                <div>
                  <div className="step-lbl">Max Buddies</div>
                  <select className="form-select" value={form.maxBuddies} onChange={change("maxBuddies")}>
                    {["1","2","3","4","5"].map(n => <option key={n}>{n}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ marginBottom:"1.25rem" }}>
                <div className="step-lbl"><span className="step-badge">6</span> Buddy Gender Preference</div>
                <div style={{ display:"flex", gap:".5rem" }}>
                  {["Any","Male","Female"].map(g => (
                    <button key={g} className={`btab ${form.gender === g ? "active" : ""}`} onClick={() => setForm(p => ({ ...p, gender: g }))}>{g}</button>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom:"1.25rem" }}>
                <div className="step-lbl"><span className="step-badge">7</span> Interests</div>
                <div className="interest-wrap">{ALL_TAGS.map(t => (
                  <span key={t} className={`itag ${form.interests.includes(t) ? "sel" : ""}`} onClick={() => toggleTag(t)}>{t}</span>
                ))}</div>
              </div>
              <div style={{ marginBottom:"1.5rem" }}>
                <div className="step-lbl"><span className="step-badge">8</span> About Your Trip</div>
                <textarea className="form-textarea" placeholder="Tell potential buddies about this trip…" value={form.description} onChange={change("description")} />
              </div>
              <button className="btn btn-teal btn-full" onClick={handlePost} disabled={posting}>
                {posting ? "Posting…" : "💾 Post My Trip"}
              </button>
            </>
          )}
        </div>

        
       {/* ── Live Trips Feed ──────────────────────────────── */}
<div>
  <div className="ct-panel">
    <div className="buddy-header">
      <div style={{ fontFamily:"var(--font-display)", fontSize:"1.1rem", color:"var(--charcoal)" }}>
        {/* 'total' ki jagah 'trips.length' use karein */}
        Live Trips {trips.length > 0 && (
          <span style={{ fontSize:".8rem", color:"var(--stone)", fontFamily:"var(--font-body)" }}>
            ({trips.length} found)
          </span>
        )}
      </div>
      <div className="buddy-tabs">
        {["All","Male","Female"].map(t => (
          <button key={t} className={`btab ${bTab === t ? "active" : ""}`} onClick={() => setBTab(t)}>{t}</button>
        ))}
      </div>
    </div>
            {loading ? (
              <div style={{ textAlign:"center", padding:"2rem", color:"var(--stone)" }}>Loading trips…</div>
            ) : filteredTrips.length === 0 ? (
              <div style={{ textAlign:"center", padding:"2rem" }}>
                <div style={{ fontSize:"2.5rem", marginBottom:".75rem" }}>🗺️</div>
                <p style={{ color:"var(--stone)" }}>No trips yet. Be the first to post!</p>
              </div>
            ) : (
              filteredTrips.map(trip => (
                <div key={trip._id || trip.id} className="buddy-card" style={{ alignItems:"flex-start" }}>
                  {trip.img && <img src={trip.img} alt={trip.title} style={{ width:56, height:56, borderRadius:"var(--r)", objectFit:"cover", flexShrink:0 }} />}
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:".5rem" }}>
                      <div>
                        <div style={{ fontWeight:700, color:"var(--charcoal)", fontSize:".95rem" }}>{trip.title}</div>
                        <div style={{ fontSize:".75rem", color:"var(--stone-light)", marginTop:2 }}>📍 {trip.destination} · 📅 {new Date(trip.travelDate).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })}</div>
                      </div>
                      <span style={{ background:"var(--teal-light)", color:"var(--teal)", fontSize:".68rem", fontWeight:700, padding:"2px 8px", borderRadius:"var(--r-pill)", flexShrink:0 }}>{trip.budget?.split(" ")[0]}</span>
                    </div>
                    <div style={{ fontSize:".8rem", color:"var(--stone)", marginTop:".4rem", lineHeight:1.55 }}>{trip.description}</div>
                    <div style={{ display:"flex", gap:".35rem", flexWrap:"wrap", marginTop:".4rem" }}>
                      {trip.interests?.slice(0,3).map(i => (
                        <span key={i} style={{ fontSize:".68rem", background:"var(--orange-light)", color:"var(--orange-deep)", padding:"2px 7px", borderRadius:"var(--r-pill)" }}>{i}</span>
                      ))}
                      {trip.gender && trip.gender !== "Any" && (
                        <span style={{ fontSize:".68rem", background:"#EEF2FF", color:"#4338CA", padding:"2px 7px", borderRadius:"var(--r-pill)" }}>{trip.gender} Only</span>
                      )}
                    </div>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:".6rem" }}>
                      <span style={{ fontSize:".75rem", color:"var(--stone)" }}>by <strong>{trip.creatorName}</strong> · {trip.maxBuddies} buddy spots</span>
                      <button className="btn btn-ghost-teal btn-sm" onClick={() => setJoinModal(trip)}>Join →</button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {joinModal && <JoinModal trip={joinModal} onClose={() => setJoinModal(null)} />}
    </>
  );
}
