import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FOODS, showToast } from "../data";
import { bookingsAPI } from "../services/api";

/* ══════════════════════════════════════════
   FOOD TOUR MODAL — navigates to /checkout
══════════════════════════════════════════ */
function FoodTourModal({ food, onClose }) {
  const navigate = useNavigate();
  const [form,    setForm]    = useState({ name:"", email:"", phone:"", date:"", people:"2" });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const change = f => e => { setForm(p => ({ ...p, [f]: e.target.value })); setError(""); };

  const perPerson = food.price || 799;
  const people    = parseInt(form.people, 10) || 2;
  const subtotal  = perPerson * people;
  const gst       = Math.round(subtotal * 0.05);

  const submit = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.date) {
      setError("Please fill Name, Email and Date."); return;
    }
    setLoading(true); setError("");
    try {
      const res = await bookingsAPI.create({
        bookingType:  "food_tour",
        guestName:    form.name,
        guestEmail:   form.email,
        guestPhone:   form.phone,
        checkInDate:  form.date,
        nights:       people,          // reuse nights field for people count
        basePrice:    perPerson,
        itemName:     `${food.name} Food Tour — ${food.city}`,
        notes:        `${people} people · ${food.city}`,
        paymentMethod:"cod",
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
      <div className="modal-card" style={{ maxWidth:480 }}>
        <div className="modal-top">
          <div>
            <h2>Book {food.name} Tour</h2>
            <p style={{ color:"var(--stone)", fontSize:".875rem", marginTop:".25rem" }}>
              🍛 {food.city} · ₹{perPerson.toLocaleString("en-IN")}/person
            </p>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Food hero strip */}
        <div style={{ display:"flex", gap:".75rem", alignItems:"center",
          background:"var(--orange-light)", borderRadius:"var(--r)", padding:".85rem 1rem", marginBottom:"1.25rem" }}>
          <div style={{ fontSize:"2.5rem", flexShrink:0 }}>{food.emoji}</div>
          <div>
            <div style={{ fontWeight:700, color:"var(--charcoal)", fontSize:".95rem" }}>{food.name}</div>
            <div style={{ fontSize:".78rem", color:"var(--stone)" }}>📍 {food.city} · {food.cat}</div>
            <div style={{ fontSize:".78rem", color:"var(--orange-deep)", fontWeight:600 }}>
              ★ {food.rating || 4.7} · {food.time || "30 min"}
            </div>
          </div>
        </div>

        {error && (
          <div style={{ background:"#FEF2F2", border:"1px solid #FECACA", borderRadius:"var(--r)",
            padding:".75rem", marginBottom:"1rem", color:"#DC2626", fontSize:".84rem" }}>
            {error}
          </div>
        )}

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Your Name *</label>
            <input className="form-input" type="text" placeholder="Aarav Sharma" value={form.name} onChange={change("name")} />
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
            <label className="form-label">Preferred Date *</label>
            <input className="form-input" type="date" value={form.date} onChange={change("date")}
              min={new Date().toISOString().split("T")[0]} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Number of People</label>
          <select className="form-select" value={form.people} onChange={change("people")}>
            {["1","2","3","4","5","6","7","8"].map(n => <option key={n}>{n}</option>)}
          </select>
        </div>

        {/* Price summary */}
        <div style={{ background:"var(--orange-light)", borderRadius:"var(--r)", padding:"1rem", marginBottom:"1.25rem" }}>
          <div style={{ display:"flex", justifyContent:"space-between", fontSize:".85rem", color:"var(--stone)", marginBottom:".35rem" }}>
            <span>₹{perPerson.toLocaleString("en-IN")} × {form.people} person(s)</span>
            <span>₹{subtotal.toLocaleString("en-IN")}</span>
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", fontSize:".85rem", color:"var(--stone)", marginBottom:".35rem" }}>
            <span>GST (5%)</span><span>₹{gst.toLocaleString("en-IN")}</span>
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", fontWeight:700,
            color:"var(--charcoal)", borderTop:"1px solid rgba(0,0,0,.08)", paddingTop:".5rem" }}>
            <span>Total</span>
            <span style={{ color:"var(--orange-deep)" }}>₹{(subtotal+gst).toLocaleString("en-IN")}</span>
          </div>
        </div>

        <button className="btn btn-orange btn-full" onClick={submit} disabled={loading}>
          {loading ? "Creating booking…" : "🍛 Confirm Food Tour →"}
        </button>
        <p style={{ textAlign:"center", fontSize:".72rem", color:"var(--stone-light)", marginTop:".6rem" }}>
          COD — Pay on the day of the tour
        </p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════ */
export default function LocalFoodPage() {
  const [cat,       setCat]       = useState("All");
  const [featured,  setFeatured]  = useState(0);
  const [tourModal, setTourModal] = useState(null);

  const cats   = ["All","Street Food","Rice","Thali","Drinks","South Indian"];
  const dishes = cat === "All" ? FOODS : FOODS.filter(f => f.cat === cat);

  useEffect(() => {
    const t = setInterval(() => setFeatured(f => (f + 1) % FOODS.length), 3000);
    return () => clearInterval(t);
  }, []);

  const hero = FOODS[featured];

  return (
    <>
      {/* Hero */}
      <div style={{ background:"linear-gradient(135deg,#1a0800,#2d1400)", paddingTop:"var(--nav-h)" }}>
        <div className="lf-hero">
          <div className="lf-hero-text">
            <span className="eyebrow" style={{ color:"rgba(240,123,36,.8)" }}>India Ka Asli Zaika</span>
            <h1>Eat Where the<br /><em>Locals Eat.</em></h1>
            <p>Hidden dhabas, rooftop kitchens, secret chai stalls — our food guides know every authentic spot.</p>
            <div style={{ display:"flex", gap:"1rem", flexWrap:"wrap" }}>
              <button className="btn btn-orange"
                onClick={() => document.getElementById("food-listings")?.scrollIntoView({ behavior:"smooth" })}>
                🍛 Explore Food
              </button>
            </div>
          </div>
          <div className="lf-hero-dish">
            <div style={{ textAlign:"center", animation:"fadeIn .5s ease" }} key={featured}>
              <div style={{ fontSize:"6rem", marginBottom:"1rem", filter:"drop-shadow(0 4px 12px rgba(0,0,0,.3))" }}>
                {hero.emoji}
              </div>
              <div style={{ fontFamily:"var(--font-display)", fontSize:"1.6rem", color:"white", fontWeight:700, marginBottom:".4rem" }}>
                {hero.name}
              </div>
              <div style={{ color:"rgba(255,255,255,.6)", fontSize:".85rem" }}>
                {hero.city} · ★ {hero.rating}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ background:"white", borderBottom:"1px solid var(--border)", padding:".75rem 1.5rem" }}>
        <div style={{ maxWidth:1200, margin:"0 auto", display:"flex", gap:".5rem", flexWrap:"wrap" }}>
          {cats.map(c => (
            <button key={c}
              className={`chip ${cat === c ? "active" : ""}`}
              onClick={() => setCat(c)}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Food grid */}
      <div style={{ maxWidth:1200, margin:"0 auto", padding:"2rem 1.5rem" }} id="food-listings">
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:"1.5rem" }}>
          {dishes.map((food, i) => (
            <div key={i} className="card" style={{ cursor:"pointer" }}
              onClick={() => setTourModal(food)}>
              <div style={{ height:180, background:`linear-gradient(135deg,#1a0800,#4a1500)`,
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:"5rem",
                position:"relative" }}>
                {food.emoji}
                <div style={{ position:"absolute", top:"12px", right:"12px",
                  background:"rgba(0,0,0,.5)", color:"white", borderRadius:"var(--r-pill)",
                  padding:"3px 10px", fontSize:".72rem", fontWeight:600 }}>
                  ★ {food.rating || 4.7}
                </div>
                {food.price && (
                  <div style={{ position:"absolute", bottom:"12px", left:"12px",
                    background:"var(--orange)", color:"white", borderRadius:"var(--r-pill)",
                    padding:"3px 10px", fontSize:".72rem", fontWeight:700 }}>
                    ₹{food.price}/person
                  </div>
                )}
              </div>
              <div style={{ padding:"1.1rem" }}>
                <div style={{ fontWeight:700, color:"var(--charcoal)", fontSize:"1rem", marginBottom:".3rem" }}>
                  {food.name}
                </div>
                <div style={{ fontSize:".8rem", color:"var(--stone)", marginBottom:".5rem" }}>
                  📍 {food.city} · {food.cat} · {food.time || "30 min"}
                </div>
                <div style={{ fontSize:".78rem", color:"var(--stone)", lineHeight:1.6, marginBottom:".75rem" }}>
                  {food.desc}
                </div>
                <button className="btn btn-orange btn-sm btn-full" style={{ justifyContent:"center" }}>
                  Book Food Tour →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {tourModal && <FoodTourModal food={tourModal} onClose={() => setTourModal(null)} />}
    </>
  );
}
