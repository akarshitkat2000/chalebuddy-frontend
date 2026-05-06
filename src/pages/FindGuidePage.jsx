import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { GUIDES, showToast } from "../data";
import { guidesAPI, bookingsAPI } from "../services/api";

/* ── Book Guide Modal ─────────────────────────────────────── */
function BookGuideModal({ guide, onClose }) {
  const navigate  = useNavigate();
  const [form,    setForm]    = useState({ guestName:"", guestEmail:"", guestPhone:"", checkInDate:"", nights:"1", notes:"" });
  const [payMethod, setPayMethod] = useState("razorpay"); // "razorpay" | "cod"
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const change = f => e => setForm(p => ({ ...p, [f]: e.target.value }));

  const total = guide.rate * parseInt(form.nights || 1, 10);
  const gst   = Math.round(total * 0.05);

  const submit = async () => {
    if (!form.guestName.trim() || !form.guestEmail.trim() || !form.checkInDate) {
      setError("Please fill all required fields."); return;
    }
    setLoading(true); setError("");
    try {
      const res = await bookingsAPI.create({
        bookingType: "guide",
        guideId:     guide._id || guide.id,
        guestName:   form.guestName,
        guestEmail:  form.guestEmail,
        guestPhone:  form.guestPhone,
        checkInDate: form.checkInDate,
        nights:      parseInt(form.nights, 10),
        notes:        form.notes,
        paymentMethod: payMethod,
      });
      const booking = res.data?.booking;
      navigate("/checkout", { state: { booking } });
      onClose();
    } catch (err) {
      setError(err.message || "Booking failed. Please try again.");
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-card" style={{ maxWidth: 480 }}>
        <div className="modal-top">
          <div>
            <h2>Book {guide.name}</h2>
            <p style={{ color:"var(--stone)", fontSize:".875rem", marginTop:".25rem" }}>
              📍 {guide.city} · ₹{guide.rate?.toLocaleString("en-IN")}/day
            </p>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <>
            {/* Guide info strip */}
            <div style={{ display:"flex", gap:"1rem", alignItems:"center", background:"var(--cream)", borderRadius:"var(--r)", padding:".85rem 1rem", marginBottom:"1.25rem" }}>
              <img src={guide.img} alt={guide.name} style={{ width:52, height:52, borderRadius:"50%", objectFit:"cover", flexShrink:0 }} />
              <div>
                <div style={{ fontWeight:700, color:"var(--charcoal)", fontSize:".95rem" }}>{guide.name}</div>
                <div style={{ fontSize:".78rem", color:"var(--stone)" }}>⭐ {guide.rating} · {guide.type} · {guide.city}</div>
                <div style={{ fontSize:".78rem", color:"var(--teal)", fontWeight:600 }}>₹{guide.rate?.toLocaleString("en-IN")}/day</div>
              </div>
            </div>

            {error && <div style={{ background:"#FEF2F2", border:"1px solid #FECACA", borderRadius:"var(--r)", padding:".75rem", marginBottom:"1rem", color:"#DC2626", fontSize:".84rem" }}>{error}</div>}

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Your Name *</label>
                <input className="form-input" type="text" placeholder="Rahul Sharma" value={form.guestName} onChange={change("guestName")} />
              </div>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input className="form-input" type="email" placeholder="you@mail.com" value={form.guestEmail} onChange={change("guestEmail")} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-input" type="tel" placeholder="+91 XXXXX XXXXX" value={form.guestPhone} onChange={change("guestPhone")} />
              </div>
              <div className="form-group">
                <label className="form-label">Start Date *</label>
                <input className="form-input" type="date" value={form.checkInDate} onChange={change("checkInDate")} min={new Date().toISOString().split("T")[0]} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Number of Days</label>
              <select className="form-select" value={form.nights} onChange={change("nights")}>
                {["1","2","3","4","5","6","7"].map(n => <option key={n}>{n}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Special Requests</label>
              <textarea className="form-textarea" style={{ minHeight:70 }} placeholder="Any special requirements..." value={form.notes} onChange={change("notes")} />
            </div>

            {/* Payment method selector */}
            <div style={{ marginBottom:"1.25rem" }}>
              <label className="form-label">Payment Method</label>
              <div style={{ display:"flex", flexDirection:"column", gap:".5rem" }}>
                {[
                  { val:"razorpay", icon:"💳", title:"Pay Online", sub:"UPI · Cards · Net Banking" },
                  { val:"cod",      icon:"🤝", title:"Pay at Venue (Cash)", sub:"Pay the guide directly" },
                ].map(opt => (
                  <label key={opt.val} style={{
                    display:"flex", alignItems:"center", gap:".75rem",
                    padding:".75rem 1rem",
                    border:`2px solid ${payMethod===opt.val ? "var(--teal)" : "var(--border)"}`,
                    borderRadius:"var(--r-lg)", cursor:"pointer",
                    background: payMethod===opt.val ? "var(--teal-light)" : "white",
                    transition:"all .2s",
                  }}>
                    <input type="radio" name="gPayMethod" value={opt.val}
                      checked={payMethod === opt.val}
                      onChange={() => setPayMethod(opt.val)}
                      style={{ accentColor:"var(--teal)", width:16, height:16, flexShrink:0 }} />
                    <span style={{ fontSize:"1rem" }}>{opt.icon}</span>
                    <div>
                      <div style={{ fontWeight:700, color:"var(--charcoal)", fontSize:".85rem" }}>{opt.title}</div>
                      <div style={{ fontSize:".72rem", color:"var(--stone)" }}>{opt.sub}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Price summary */}
            <div style={{ background:"var(--cream)", borderRadius:"var(--r)", padding:"1rem", marginBottom:"1.25rem" }}>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:".85rem", color:"var(--stone)", marginBottom:".35rem" }}>
                <span>₹{guide.rate?.toLocaleString("en-IN")} × {form.nights} day(s)</span>
                <span>₹{total.toLocaleString("en-IN")}</span>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:".85rem", color:"var(--stone)", marginBottom:".35rem" }}>
                <span>GST (5%)</span><span>₹{gst.toLocaleString("en-IN")}</span>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", fontWeight:700, color:"var(--charcoal)", borderTop:"1px solid var(--border)", paddingTop:".5rem" }}>
                <span>Total</span><span style={{ color:"var(--teal)" }}>₹{(total + gst).toLocaleString("en-IN")}</span>
              </div>
            </div>

            <button className="btn btn-teal btn-full" onClick={submit} disabled={loading}>
              {loading
                ? "Please wait…"
                : payMethod === "cod"
                  ? "✅ Confirm Booking (Pay at Venue) →"
                  : "🔒 Proceed to Online Payment →"}
            </button>
        </>
      </div>
    </div>
  );
}

/* ── Main Page ───────────────────────────────────────────────── */
export default function FindGuidePage() {
  const [guides,    setGuides]    = useState(GUIDES);
  const [loading,   setLoading]   = useState(true);
  const [bookModal, setBookModal] = useState(null);
  const [filters,   setFilters]   = useState({ type:"All", sort:"-rating", minRate:"", maxRate:"", language:"", search:"" });
  const [page,      setPage]      = useState(1);
  const [total,     setTotal]     = useState(0);
  const LIMIT = 9;

  const fetchGuides = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: LIMIT };
      if (filters.type !== "All") params.type = filters.type;
      if (filters.sort)     params.sort    = filters.sort;
      if (filters.search)   params.search  = filters.search;
      if (filters.minRate)  params["rate[gte]"] = filters.minRate;
      if (filters.maxRate)  params["rate[lte]"] = filters.maxRate;

      const res = await guidesAPI.getAll(params);
      const data = res.guides || res.data?.guides;
      if (data?.length) { setGuides(data); setTotal(res.total || data.length); }
      else { setGuides(GUIDES); setTotal(GUIDES.length); }
    } catch {
      setGuides(GUIDES); setTotal(GUIDES.length);
    } finally { setLoading(false); }
  }, [filters, page]);

  useEffect(() => { fetchGuides(); }, [fetchGuides]);

  const applyFilters = () => { setPage(1); fetchGuides(); };

  const TYPES = ["All","Heritage","Spiritual","Trekking","Food","Nature","Adventure","Culture","Photography"];
  const LANGS = ["Any","Hindi","English","Bengali","Tamil","Malayalam","Marathi"];

  return (
    <>
      {/* Hero */}
      <div className="fg-hero">
        <span className="eyebrow" style={{ color:"rgba(255,255,255,.6)" }}>500+ Verified Guides</span>
        <h1>Find Your Perfect Local Guide</h1>
        <p>Historians, food lovers, trekkers — real India through real eyes.</p>
        <div className="search-box">
          <span style={{ color:"var(--stone-light)" }}>🔍</span>
          <input type="text" placeholder="Search name or city..." value={filters.search}
            onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
            onKeyDown={e => e.key === "Enter" && applyFilters()} />
          <select onChange={e => setFilters(f => ({ ...f, type: e.target.value === "All Expertise" ? "All" : e.target.value }))}>
            <option>All Expertise</option>
            {TYPES.slice(1).map(t => <option key={t}>{t}</option>)}
          </select>
          <button className="btn btn-orange btn-sm" onClick={applyFilters}>Search</button>
        </div>
      </div>

      <div className="fg-body">
        {/* Sidebar */}
        <aside>
          <div className="filter-card">
            <div className="filter-title">🔍 Filters</div>

            <div className="filter-sec">
              <span className="filter-lbl">Expertise</span>
              <div>{TYPES.map(t => (
                <span key={t} className={`chip ${filters.type === t ? "active" : ""}`}
                  onClick={() => setFilters(f => ({ ...f, type: t }))} style={{ margin:"2px" }}>{t}</span>
              ))}</div>
            </div>

            <div className="filter-sec">
              <span className="filter-lbl">Daily Rate (₹)</span>
              <div className="price-row">
                <input className="price-inp" type="number" placeholder="Min" value={filters.minRate}
                  onChange={e => setFilters(f => ({ ...f, minRate: e.target.value }))} />
                <span style={{ color:"var(--stone)" }}>—</span>
                <input className="price-inp" type="number" placeholder="Max" value={filters.maxRate}
                  onChange={e => setFilters(f => ({ ...f, maxRate: e.target.value }))} />
              </div>
            </div>

            <div className="filter-sec">
              <span className="filter-lbl">Language</span>
              <div>{LANGS.map(l => (
                <span key={l} className={`chip ${filters.language === l ? "active" : ""}`}
                  onClick={() => setFilters(f => ({ ...f, language: l }))} style={{ margin:"2px" }}>{l}</span>
              ))}</div>
            </div>

            <div className="filter-sec">
              <span className="filter-lbl">Sort By</span>
              <select className="sort-sel" style={{ width:"100%" }} value={filters.sort}
                onChange={e => setFilters(f => ({ ...f, sort: e.target.value }))}>
                <option value="-rating">Top Rated</option>
                <option value="rate">Price: Low → High</option>
                <option value="-rate">Price: High → Low</option>
                <option value="-trips">Most Trips</option>
              </select>
            </div>

            <button className="btn btn-teal btn-full" style={{ justifyContent:"center" }} onClick={applyFilters}>
              Apply Filters
            </button>
            <button className="btn btn-outline btn-full" style={{ justifyContent:"center", marginTop:".5rem" }}
              onClick={() => { setFilters({ type:"All", sort:"-rating", minRate:"", maxRate:"", language:"", search:"" }); setPage(1); }}>
              Reset
            </button>
          </div>
        </aside>

        {/* Grid */}
        <div>
          <div className="fg-sort">
            <span style={{ fontSize:".875rem", color:"var(--stone)" }}>
              {loading ? "Fetching guides…" : <>{guides.length} of {total} guides</>}
            </span>
            <select className="sort-sel" value={filters.sort} onChange={e => setFilters(f => ({ ...f, sort: e.target.value }))}>
              <option value="-rating">Top Rated</option>
              <option value="rate">Price ↑</option>
              <option value="-rate">Price ↓</option>
              <option value="-trips">Most Trips</option>
            </select>
          </div>

          {loading ? (
            <div className="guides-grid">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} style={{ background:"white", border:"1px solid var(--border)", borderRadius:"var(--r-xl)", overflow:"hidden" }}>
                  <div style={{ height:200, background:"linear-gradient(90deg,var(--cream-dark) 25%,var(--cream) 50%,var(--cream-dark) 75%)", backgroundSize:"200% 100%", animation:"shimmer 1.5s infinite" }} />
                  <div style={{ padding:"1rem" }}>
                    {[80,60,40].map(w => <div key={w} style={{ height:13, width:`${w}%`, background:"linear-gradient(90deg,var(--cream-dark) 25%,var(--cream) 50%,var(--cream-dark) 75%)", backgroundSize:"200% 100%", animation:"shimmer 1.5s infinite", borderRadius:4, marginBottom:10 }} />)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="guides-grid">
              {guides.map(g => (
                <div key={g._id || g.id} className="guide-card">
                  <div className="guide-img">
                    <img src={g.img?.startsWith("/uploads") ? `http://localhost:5000${g.img}` : g.img} alt={g.name} />
                    <div className="guide-badge">{g.type}</div>
                  </div>
                  <div className="guide-body">
                    <div className="guide-name">{g.name}</div>
                    <div className="guide-loc">📍 {g.city}</div>
                    <div className="guide-stars">{"★".repeat(Math.floor(g.rating || 4))} {g.rating} ({g.trips || 0} trips)</div>
                    {g.tags?.length > 0 && <div className="guide-tags">{g.tags.slice(0,3).map(t => <span key={t} className="gtag">{t}</span>)}</div>}
                    {g.bio && <p style={{ fontSize:".75rem", color:"var(--stone)", margin:".4rem 0 .6rem", lineHeight:1.5, overflow:"hidden", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" }}>{g.bio}</p>}
                    <div className="guide-footer">
                      <div className="guide-rate">₹{g.rate?.toLocaleString("en-IN")} <span>/day</span></div>
                      <button className="btn btn-teal btn-sm" onClick={() => setBookModal(g)}>Book →</button>
                    </div>
                    {g.verified && <div className="verified-badge">✅ Verified Guide</div>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {total > LIMIT && (
            <div style={{ display:"flex", justifyContent:"center", gap:".5rem", marginTop:"2rem" }}>
              <button className="btn btn-outline btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
              <span style={{ padding:"8px 14px", fontSize:".85rem", color:"var(--stone)" }}>Page {page}</span>
              <button className="btn btn-outline btn-sm" disabled={guides.length < LIMIT} onClick={() => setPage(p => p + 1)}>Next →</button>
            </div>
          )}
        </div>
      </div>

      {bookModal && <BookGuideModal guide={bookModal} onClose={() => setBookModal(null)} />}
    </>
  );
}
