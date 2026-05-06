import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { STAYS_DATA, showToast } from "../data";
import { staysAPI, bookingsAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";

/* ══════════════════════════════════════════
   BOOKING MODAL — navigates to /checkout
══════════════════════════════════════════ */
function BookingModal({ stay, stayType, onClose }) {
  const navigate   = useNavigate();
  const price      = stayType === "quick" ? stay.quickPrice : stay.overnightPrice;
  const priceLabel = stayType === "quick" ? "for 2–4 hours" : "per night";

  const [form,    setForm]    = useState({ name:"", email:"", phone:"", date:"", nights:"1" });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const change = f => e => { setForm(p => ({ ...p, [f]: e.target.value })); setError(""); };

  const stayId   = stay._id || stay.id;
  const isRealId = stayId && String(stayId).length > 10;

  const submit = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.date) {
      setError("Please fill all required fields."); return;
    }
    if (!isRealId) {
      setError("Demo listing hai. Real stays ke liye seed data load karo: npm run seed"); return;
    }
    setLoading(true); setError("");
    try {
      const res = await bookingsAPI.create({
        bookingType: "stay",
        stayId,
        guestName:   form.name,
        guestEmail:  form.email,
        guestPhone:  form.phone,
        stayType,
        checkInDate: form.date,
        nights:      parseInt(form.nights, 10),
      });
      const booking = res.data?.booking;
      navigate("/checkout", { state: { booking } });
      onClose();
    } catch (err) {
      setError(err.message || "Booking failed. Please try again.");
    } finally { setLoading(false); }
  };

  const qty = stayType === "quick" ? 1 : Number(form.nights);
  const sub = price * qty;
  const gst = Math.round(sub * 0.05);

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-card" style={{ maxWidth:480 }}>
        <div className="modal-top">
          <div>
            <h2>Book {stay.name}</h2>
            <p style={{ color:"var(--stone)", fontSize:".875rem", marginTop:".25rem" }}>
              📍 {stay.city}{stay.area ? `, ${stay.area}` : ""} · ₹{price?.toLocaleString("en-IN")} {priceLabel}
            </p>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {!isRealId && (
          <div style={{ background:"#FFF7ED", border:"1px solid #FED7AA", borderRadius:"var(--r)",
            padding:".75rem 1rem", marginBottom:"1rem", fontSize:".82rem", color:"#92400E" }}>
            ⚠️ Demo listing. Run <code>npm run seed</code> to load real database stays.
          </div>
        )}
        {error && (
          <div style={{ background:"#FEF2F2", border:"1px solid #FECACA", borderRadius:"var(--r)",
            padding:".75rem 1rem", marginBottom:"1rem", color:"#DC2626", fontSize:".84rem" }}>
            {error}
          </div>
        )}

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input className="form-input" type="text" placeholder="Ravi Sharma" value={form.name} onChange={change("name")} />
          </div>
          <div className="form-group">
            <label className="form-label">Email *</label>
            <input className="form-input" type="email" placeholder="you@mail.com" value={form.email} onChange={change("email")} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Phone</label>
            <input className="form-input" type="tel" placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={change("phone")} />
          </div>
          <div className="form-group">
            <label className="form-label">Check-in Date *</label>
            <input className="form-input" type="date" value={form.date} onChange={change("date")}
              min={new Date().toISOString().split("T")[0]} />
          </div>
        </div>
        {stayType !== "quick" && (
          <div className="form-group">
            <label className="form-label">Nights</label>
            <select className="form-select" value={form.nights} onChange={change("nights")}>
              {["1","2","3","4","5","6","7"].map(n => <option key={n}>{n}</option>)}
            </select>
          </div>
        )}

        {/* Price summary */}
        <div style={{ background:"var(--cream)", borderRadius:"var(--r)", padding:"1rem", marginBottom:"1.25rem" }}>
          <div style={{ display:"flex", justifyContent:"space-between", fontSize:".85rem", color:"var(--stone)", marginBottom:".35rem" }}>
            <span>₹{price?.toLocaleString("en-IN")} × {stayType==="quick" ? "1 session" : `${form.nights} night(s)`}</span>
            <span>₹{sub.toLocaleString("en-IN")}</span>
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", fontSize:".85rem", color:"var(--stone)", marginBottom:".35rem" }}>
            <span>GST (5%)</span><span>₹{gst.toLocaleString("en-IN")}</span>
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", fontWeight:700,
            color:"var(--charcoal)", borderTop:"1px solid var(--border)", paddingTop:".5rem" }}>
            <span>Total</span>
            <span style={{ color:"var(--teal)" }}>₹{(sub+gst).toLocaleString("en-IN")}</span>
          </div>
        </div>

        <button className="btn btn-orange btn-full" onClick={submit} disabled={loading}>
          {loading ? "Creating booking…" : "Proceed to Payment →"}
        </button>
        <p style={{ textAlign:"center", fontSize:".72rem", color:"var(--stone-light)", marginTop:".6rem" }}>
          🔒 Secured by Razorpay
        </p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   LIST YOUR HOME MODAL
══════════════════════════════════════════ */
function ListHomeModal({ onClose }) {
  const { user } = useAuth();
  const INITIAL = {
    name:"", city:"", area:"", state:"", host:"",
    description:"", type:"homestay",
    quickPrice:"", overnightPrice:"",
    maxGuests:"2", rooms:"1", amenities:"",
  };
  const [form,       setForm]       = useState(INITIAL);
  const [imgFile,    setImgFile]    = useState(null);
  const [imgPreview, setImgPreview] = useState(null);
  const [gallery,    setGallery]    = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [done,       setDone]       = useState(null);
  const [error,      setError]      = useState("");
  const change = f => e => { setForm(p => ({ ...p, [f]: e.target.value })); setError(""); };

  const handleCover = e => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5*1024*1024) { setError("Cover image must be under 5 MB"); return; }
    setImgFile(file);
    const reader = new FileReader();
    reader.onload = ev => setImgPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const validate = () => {
    if (!form.name.trim())         return "Property name required.";
    if (!form.city.trim())         return "City required.";
    if (!form.host.trim())         return "Host name required.";
    if (!form.quickPrice)          return "Quick stay price required.";
    if (!form.overnightPrice)      return "Overnight price required.";
    if (!imgFile)                  return "Cover photo required.";
    return null;
  };

  const submit = async () => {
    const err = validate();
    if (err) { setError(err); return; }
    if (!user) { setError("Please sign in to list your home."); return; }
    setLoading(true); setError("");
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k,v]) => fd.append(k,v));
      fd.append("img", imgFile);
      gallery.forEach(f => fd.append("gallery", f));
      const res = await staysAPI.listHome(fd);
      setDone(res.data?.stay || res.stay);
      showToast("Home listed! 🏠 Pending admin review.");
    } catch (err) {
      setError(err.message || "Failed to list. Try again.");
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-card" style={{ maxWidth:560, maxHeight:"90vh", overflowY:"auto" }}>
        <div className="modal-top" style={{ position:"sticky", top:0, background:"white", zIndex:1,
          paddingBottom:".75rem", borderBottom:"1px solid var(--border)" }}>
          <div>
            <h2>{done ? "Home Listed! 🏠" : "List Your Home"}</h2>
            <p style={{ color:"var(--stone)", fontSize:".875rem", marginTop:".25rem" }}>
              {done ? "Pending admin review — live within 24hrs." : "Start earning from your property"}
            </p>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {done ? (
          <div style={{ textAlign:"center", padding:"2rem 0" }}>
            <div style={{ fontSize:"3rem", marginBottom:"1rem" }}>✅</div>
            <p style={{ color:"var(--stone)", marginBottom:".75rem" }}>
              <strong>{done.name}</strong> in {done.city} submitted for review.
            </p>
            <p style={{ fontSize:".8rem", color:"var(--stone-light)", marginBottom:"1.5rem" }}>
              ID: <code style={{ background:"var(--cream-dark)", padding:"2px 8px", borderRadius:4 }}>
                {done._id?.toString().slice(-8).toUpperCase()}
              </code>
            </p>
            <button className="btn btn-teal btn-full" onClick={onClose}>Done</button>
          </div>
        ) : (
          <div style={{ paddingTop:"1.25rem" }}>
            {!user && (
              <div style={{ background:"#FFF7ED", border:"1px solid #FED7AA", borderRadius:"var(--r)",
                padding:".75rem 1rem", marginBottom:"1rem", fontSize:".82rem", color:"#92400E" }}>
                ⚠️ Please <strong>Sign In</strong> first to list your home.
              </div>
            )}
            {error && (
              <div style={{ background:"#FEF2F2", border:"1px solid #FECACA", borderRadius:"var(--r)",
                padding:".75rem 1rem", marginBottom:"1rem", color:"#DC2626", fontSize:".84rem" }}>
                {error}
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Cover Photo *</label>
              <div style={{ display:"flex", alignItems:"center", gap:"1rem" }}>
                {imgPreview
                  ? <img src={imgPreview} alt="cover" style={{ width:80, height:60, borderRadius:"var(--r)", objectFit:"cover", border:"2px solid var(--teal)", flexShrink:0 }} />
                  : <div style={{ width:80, height:60, borderRadius:"var(--r)", background:"var(--cream-dark)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.5rem", border:"2px dashed var(--border)", flexShrink:0 }}>🏠</div>
                }
                <label className="btn btn-outline btn-sm" style={{ cursor:"pointer" }}>
                  {imgPreview ? "Change" : "Upload Cover"}
                  <input type="file" accept="image/*" style={{ display:"none" }} onChange={handleCover} />
                </label>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Property Name *</label>
                <input className="form-input" type="text" placeholder="Haveli Wadi…" value={form.name} onChange={change("name")} />
              </div>
              <div className="form-group">
                <label className="form-label">Host Name *</label>
                <input className="form-input" type="text" placeholder="Your name" value={form.host} onChange={change("host")} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">City *</label>
                <input className="form-input" type="text" placeholder="Jaipur" value={form.city} onChange={change("city")} />
              </div>
              <div className="form-group">
                <label className="form-label">Area</label>
                <input className="form-input" type="text" placeholder="Bani Park" value={form.area} onChange={change("area")} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Type *</label>
                <select className="form-select" value={form.type} onChange={change("type")}>
                  <option value="homestay">Homestay</option>
                  <option value="quick">Quick Fresh-up</option>
                  <option value="overnight">Overnight Stay</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">State</label>
                <input className="form-input" type="text" placeholder="Rajasthan" value={form.state} onChange={change("state")} />
              </div>
            </div>
            <div style={{ background:"var(--teal-light)", borderRadius:"var(--r-lg)", padding:"1rem 1.25rem", marginBottom:"1rem" }}>
              <div style={{ fontWeight:700, color:"var(--charcoal)", marginBottom:".75rem", fontSize:".88rem" }}>💰 Pricing (₹)</div>
              <div className="form-row">
                <div className="form-group" style={{ marginBottom:0 }}>
                  <label className="form-label">Quick Stay * (2–4 hrs)</label>
                  <input className="form-input" type="number" placeholder="e.g. 400" min="0" value={form.quickPrice} onChange={change("quickPrice")} />
                </div>
                <div className="form-group" style={{ marginBottom:0 }}>
                  <label className="form-label">Overnight * (per night)</label>
                  <input className="form-input" type="number" placeholder="e.g. 1500" min="0" value={form.overnightPrice} onChange={change("overnightPrice")} />
                </div>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Amenities (comma-separated)</label>
              <input className="form-input" type="text" placeholder="📶 WiFi, ❄️ AC, 🍛 Home Food" value={form.amenities} onChange={change("amenities")} />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-textarea" placeholder="What makes your place special…" value={form.description} onChange={change("description")} />
            </div>
            <button className="btn btn-orange btn-full" onClick={submit} disabled={loading}>
              {loading ? "Listing…" : "🏠 Submit Listing →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════ */
export default function StaysPage() {
  const [stays,     setStays]     = useState(STAYS_DATA);
  const [loading,   setLoading]   = useState(true);
  const [cities,    setCities]    = useState([]);
  const [type,      setType]      = useState("all");
  const [maxP,      setMaxP]      = useState(10000);
  const [heartSet,  setHeartSet]  = useState({});
  const [selected,  setSelected]  = useState({});
  const [bookModal, setBookModal] = useState(null);
  const [listModal, setListModal] = useState(false);

  const fetchStays = useCallback(() => {
    setLoading(true);
    const params = {};
    if (type !== "all") params.type = type;
    params["overnightPrice[lte]"] = maxP;
    staysAPI.getAll(params)
      .then(res => {
        const data = res.stays || res.data?.stays;
        if (data?.length) setStays(data); else setStays(STAYS_DATA);
      })
      .catch(() => setStays(STAYS_DATA))
      .finally(() => setLoading(false));
  }, [type, maxP]);

  useEffect(() => { fetchStays(); }, [fetchStays]);
  useEffect(() => {
    staysAPI.getCities()
      .then(res => setCities(res.data?.cities || []))
      .catch(() => {});
  }, []);

  const id    = s => s._id || s.id;
  const getPrice    = s => selected[id(s)] === "quick" ? s.quickPrice     : s.overnightPrice;
  const getLabel    = s => selected[id(s)] === "quick" ? "for 2–4 hours"  : "per night";
  const getStayType = s => selected[id(s)] === "quick" ? "quick"          : "overnight";
  const imgSrc = src => src?.startsWith("/uploads") ? `http://localhost:5000${src}` : src;

  const Skeleton = () => (
    <div style={{ background:"white", border:"1px solid var(--border)", borderRadius:"var(--r-xl)", overflow:"hidden" }}>
      <div style={{ height:200, background:"linear-gradient(90deg,var(--cream-dark) 25%,var(--cream) 50%,var(--cream-dark) 75%)", backgroundSize:"200% 100%", animation:"shimmer 1.5s infinite" }} />
      <div style={{ padding:"1.1rem" }}>
        {[70,50,90,60].map((w,i) => (
          <div key={i} style={{ height:12, width:`${w}%`, background:"linear-gradient(90deg,var(--cream-dark) 25%,var(--cream) 50%,var(--cream-dark) 75%)", backgroundSize:"200% 100%", animation:"shimmer 1.5s infinite", borderRadius:4, marginBottom:10 }} />
        ))}
      </div>
    </div>
  );

  return (
    <>
      {/* Hero */}
      <div style={{ background:"linear-gradient(135deg,#060d1a,#0a1e30)", paddingTop:"var(--nav-h)" }}>
        <div className="stay-hero-full">
          <div>
            <div className="stay-hero-badge">
              <span className="stay-hero-badge-dot" />Verified Home-Stays Across India
            </div>
            <h1 className="stay-hero-h1">Ghar Jaisa<br /><em>Sukoon.</em></h1>
            <p className="stay-hero-sub">Hotels se thak gaye? Real Indian hospitality experience karo — local hosts ke saath.</p>
            <div className="stay-hero-stats">
              {[["2,400+","Verified Stays"],["150+","Cities"],["4.8★","Avg Rating"]].map(([n,l]) => (
                <div key={l}><div className="stay-stat-num">{n}</div><div className="stay-stat-label">{l}</div></div>
              ))}
            </div>
            <div style={{ display:"flex", gap:"1rem", flexWrap:"wrap" }}>
              <a href="#stay-listings" className="btn btn-orange">🏠 Browse Stays</a>
              <button className="btn btn-ghost-white" onClick={() => setListModal(true)}>List Your Home</button>
            </div>
          </div>
          <div className="stay-hero-imgs">
            {[
              ["https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=500&q=80","📍 Varanasi"],
              ["https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=500&q=80","📍 Jaipur"],
              ["https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=500&q=80","📍 Manali"],
              ["https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=500&q=80","📍 Kerala"],
            ].map(([img,tag]) => (
              <div key={tag} className="stay-hero-img">
                <img src={img} alt={tag} />
                <span className="stay-img-tag">{tag}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Search strip */}
      <div className="stay-search-strip">
        <div className="stay-search-inner">
          <div className="stay-search-field" style={{ flex:2 }}>
            <span>📍</span><input type="text" placeholder="City ya destination…" />
          </div>
          <div className="stay-search-field"><span>📅</span><input type="date" /></div>
          <div className="stay-search-field" style={{ maxWidth:200 }}>
            <span>⏰</span>
            <select onChange={e => setType(e.target.value)}>
              <option value="all">Sab Types</option>
              <option value="quick">Quick Fresh-up (2–4 hrs)</option>
              <option value="overnight">Overnight Stay</option>
              <option value="homestay">Full Homestay</option>
            </select>
          </div>
          <button className="btn btn-teal" onClick={fetchStays}>Search Stays</button>
        </div>
      </div>

      {/* Body */}
      <div className="stay-body-pg" id="stay-listings">
        <aside>
          <div className="stay-filter-card">
            <div className="stay-filter-title">🔍 Filters</div>
            <div className="stay-filter-section">
              <span className="stay-filter-label">Stay Type</span>
              {[["all","🏠 Sab Types"],["quick","⚡ Quick Fresh-up"],["overnight","🌙 Overnight"],["homestay","🍛 Full Homestay"]].map(([v,l]) => (
                <button key={v} className={`stay-type-chip ${type===v?"on":""}`} onClick={() => setType(v)}>{l}</button>
              ))}
            </div>
            <div className="stay-filter-section">
              <span className="stay-filter-label">Max Price</span>
              <div style={{ fontSize:".8rem", color:"var(--stone)", marginBottom:".3rem" }}>₹{maxP.toLocaleString("en-IN")}</div>
              <input type="range" className="stay-range" min="500" max="10000" step="250" value={maxP} onChange={e => setMaxP(Number(e.target.value))} />
            </div>
            <div className="stay-filter-section">
              <span className="stay-filter-label">City</span>
              <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
                {(cities.length ? ["All",...cities.slice(0,6)] : ["All","Jaipur","Varanasi","Manali","Delhi","Darjeeling","Goa"]).map(c => (
                  <span key={c} className="chip" style={{ fontSize:".72rem", margin:2 }}>{c}</span>
                ))}
              </div>
            </div>
            <button className="btn btn-teal btn-full" style={{ justifyContent:"center" }} onClick={fetchStays}>Apply Filters</button>
          </div>
        </aside>

        <div>
          <div className="fg-sort">
            <span style={{ fontSize:".875rem", color:"var(--stone)" }}>{loading ? "Loading…" : <>{stays.length} stays found</>}</span>
            <select className="sort-sel"><option>Most Popular</option><option>Price: Low → High</option><option>Top Rated</option></select>
          </div>

          <div className="stays-grid">
            {loading ? [1,2,3,4,5,6].map(i => <Skeleton key={i} />)
            : stays.map(s => {
              const sid = id(s);
              return (
                <div key={sid} className="stay-card-full">
                  <div className="stay-card-img-full">
                    <img src={imgSrc(s.img)} alt={s.name} />
                    <div className="stay-verified-badge">{s.verified ? "✓ Verified" : "Pending"}</div>
                    <div className="stay-rating-badge">★ {s.rating} ({s.ratingCount || 0})</div>
                    <button className="stay-heart-btn" onClick={() => { setHeartSet(h => ({...h,[sid]:!h[sid]})); showToast(heartSet[sid]?"Removed ❤️":"Added to wishlist! ❤️"); }}>
                      {heartSet[sid] ? "❤️" : "🤍"}
                    </button>
                  </div>
                  <div className="stay-card-body-full">
                    <div className="stay-card-location">📍 {s.city}{s.area ? ` · ${s.area}` : ""}</div>
                    <div className="stay-card-name">{s.name}</div>
                    <div className="stay-host-row">
                      <div className="stay-host-av">{s.hostInitials || s.host?.slice(0,2).toUpperCase()}</div>
                      Hosted by <strong style={{ color:"var(--charcoal)", marginLeft:3 }}>{s.host}</strong>
                    </div>
                    <div className="stay-amenity-list">
                      {s.amenities?.map(a => <span key={a} className="stay-amenity-tag">{a}</span>)}
                    </div>
                    <div className="stay-type-selector">
                      <button className={`stay-type-btn ${selected[sid]==="quick"?"active":""}`} onClick={() => setSelected(sel => ({...sel,[sid]:"quick"}))}>
                        <span>⚡</span>Quick<span className="type-price">₹{s.quickPrice}/2–4hrs</span>
                      </button>
                      <button className={`stay-type-btn ${selected[sid]!=="quick"?"active":""}`} onClick={() => setSelected(sel => ({...sel,[sid]:"overnight"}))}>
                        <span>🌙</span>Overnight<span className="type-price">₹{s.overnightPrice}/night</span>
                      </button>
                    </div>
                    <div className="stay-card-footer-full">
                      <div>
                        <div className="stay-price-main">₹{getPrice(s)?.toLocaleString("en-IN")}</div>
                        <div className="stay-price-label">{getLabel(s)}</div>
                      </div>
                      <button className="btn btn-orange btn-sm" onClick={() => setBookModal({ stay:s, stayType:getStayType(s) })}>
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {bookModal && <BookingModal stay={bookModal.stay} stayType={bookModal.stayType} onClose={() => setBookModal(null)} />}
      {listModal && <ListHomeModal onClose={() => setListModal(false)} />}
    </>
  );
}
