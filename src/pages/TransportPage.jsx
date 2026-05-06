import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TRANSPORT_DATA, showToast } from "../data";
import { transportAPI, bookingsAPI } from "../services/api";

/* ══════════════════════════════════════════
   TICKET MODAL — no duplicate warnings
   Transport = COD, confirmed instantly
══════════════════════════════════════════ */
function TicketModal({ result, onClose }) {
  const navigate   = useNavigate();
  const [form,    setForm]    = useState({ name:"", email:"", phone:"", passengers:"1" });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const change = f => e => { setForm(p => ({ ...p, [f]: e.target.value })); setError(""); };

  const transportId = result._id || result.id;
  const isRealId    = transportId && String(transportId).length > 10;
  const total       = result.price * Number(form.passengers);
  const gst         = Math.round(total * 0.05);

  const submit = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      setError("Please fill Name and Email."); return;
    }
    // Demo data — orange box already shows the warning, just return silently
    if (!isRealId) return;

    setLoading(true); setError("");
    try {
      const res = await bookingsAPI.create({
        bookingType:   "transport",
        transportId,
        guestName:     form.name,
        guestEmail:    form.email,
        guestPhone:    form.phone,
        passengers:    parseInt(form.passengers, 10),
        checkInDate:   new Date().toISOString(),
        paymentMethod: "cod",
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
      <div className="modal-card" style={{ maxWidth:460 }}>
        <div className="modal-top">
          <div>
            <h2>Book {result.operator}</h2>
            <p style={{ color:"var(--stone)", fontSize:".875rem", marginTop:".25rem" }}>
              {result.from} → {result.to} · {result.dep}–{result.arr}
            </p>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* ONE warning — only if demo data */}
        {!isRealId && (
          <div style={{ background:"#FFF7ED", border:"1px solid #FED7AA", borderRadius:"var(--r)",
            padding:".75rem 1rem", marginBottom:"1rem", fontSize:".82rem", color:"#92400E" }}>
            ⚠️ Demo data. Run <code>npm run seed</code> to load real transport.
          </div>
        )}

        {/* API error only — not demo warning */}
        {error && (
          <div style={{ background:"#FEF2F2", border:"1px solid #FECACA", borderRadius:"var(--r)",
            padding:".75rem 1rem", marginBottom:"1rem", color:"#DC2626", fontSize:".84rem" }}>
            {error}
          </div>
        )}

        {/* Route card */}
        <div style={{ background:"var(--cream)", borderRadius:"var(--r)", padding:"1rem",
          marginBottom:"1rem", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontFamily:"var(--font-display)", fontSize:"1.1rem", fontWeight:700 }}>{result.dep}</div>
            <div style={{ fontSize:".72rem", color:"var(--stone-light)" }}>{result.fromCode}</div>
          </div>
          <div style={{ fontSize:".8rem", color:"var(--stone)", textAlign:"center" }}>
            <div>{result.duration}</div>
            <div style={{ fontSize:".65rem" }}>{result.stops}</div>
          </div>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontFamily:"var(--font-display)", fontSize:"1.1rem", fontWeight:700 }}>{result.arr}</div>
            <div style={{ fontSize:".72rem", color:"var(--stone-light)" }}>{result.toCode}</div>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Passenger Name *</label>
            <input className="form-input" type="text" placeholder="As per ID proof" value={form.name} onChange={change("name")} />
          </div>
          <div className="form-group">
            <label className="form-label">Email *</label>
            <input className="form-input" type="email" placeholder="you@email.com" value={form.email} onChange={change("email")} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Phone</label>
            <input className="form-input" type="tel" placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={change("phone")} />
          </div>
          <div className="form-group">
            <label className="form-label">Passengers</label>
            <select className="form-select" value={form.passengers} onChange={change("passengers")}>
              {["1","2","3","4","5"].map(n => <option key={n}>{n}</option>)}
            </select>
          </div>
        </div>

        {/* Price summary */}
        <div style={{ background:"var(--cream)", borderRadius:"var(--r)", padding:"1rem", marginBottom:"1.25rem" }}>
          <div style={{ display:"flex", justifyContent:"space-between", fontSize:".85rem", color:"var(--stone)", marginBottom:".35rem" }}>
            <span>₹{result.price.toLocaleString("en-IN")} × {form.passengers} passenger(s)</span>
            <span>₹{total.toLocaleString("en-IN")}</span>
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", fontSize:".85rem", color:"var(--stone)", marginBottom:".35rem" }}>
            <span>GST (5%)</span><span>₹{gst.toLocaleString("en-IN")}</span>
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", fontWeight:700,
            color:"var(--charcoal)", borderTop:"1px solid var(--border)", paddingTop:".5rem" }}>
            <span>Total</span>
            <span style={{ color:"var(--teal)" }}>₹{(total+gst).toLocaleString("en-IN")}</span>
          </div>
        </div>

        <button className="btn btn-orange btn-full" onClick={submit} disabled={loading}>
          {loading ? "Booking…" : "⚡ Confirm Booking →"}
        </button>
        <p style={{ textAlign:"center", fontSize:".72rem", color:"var(--stone-light)", marginTop:".6rem" }}>
          Transport tickets are COD — confirmed instantly
        </p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════ */
export default function TransportPage() {
  const [tab,         setTab]         = useState("train");
  const [loading,     setLoading]     = useState(false);
  const [results,     setResults]     = useState(TRANSPORT_DATA.train || []);
  const [searched,    setSearched]    = useState(false);
  const [ticketModal, setTicketModal] = useState(null);
  const [search,      setSearch]      = useState({ from:"", to:"", date:"" });

  const changeSearch = f => e => setSearch(p => ({ ...p, [f]: e.target.value }));

  const doSearch = async () => {
    setLoading(true); setSearched(true);
    try {
      const res = await transportAPI.getAll({ mode: tab, from: search.from, to: search.to });
      const data = res.transport || res.data?.transport;
      if (data?.length) setResults(data);
      else setResults(TRANSPORT_DATA[tab] || []);
    } catch {
      setResults(TRANSPORT_DATA[tab] || []);
    } finally { setLoading(false); }
  };

  const switchTab = t => {
    setTab(t);
    setResults(TRANSPORT_DATA[t] || []);
    setSearched(false);
  };

  const TABS = [
    { id:"train",  icon:"🚂", label:"Train" },
    { id:"bus",    icon:"🚌", label:"Bus" },
    { id:"flight", icon:"✈️", label:"Flight" },
  ];

  const availBadge = r => {
    if (r.avail === "limited")  return { bg:"#FFF7ED", color:"#C05621", text: r.availText || "Limited" };
    if (r.avail === "waitlist") return { bg:"#FEF2F2", color:"#C53030", text:"Waitlist" };
    return { bg:"#F0FFF4", color:"#276749", text: r.availText || "Available" };
  };

  return (
    <>
      {/* Hero */}
      <div style={{ background:"linear-gradient(135deg,#060d1a,#0D4C7A)", paddingTop:"var(--nav-h)" }}>
        <div className="tp-hero-wrap">
          <div className="tp-hero-text">
            <span className="eyebrow" style={{ color:"rgba(240,123,36,.85)" }}>Real-time Booking</span>
            <h1 style={{ fontFamily:"var(--font-display)", color:"white",
              fontSize:"clamp(2rem,4vw,3.2rem)", margin:".5rem 0 1rem", lineHeight:1.15 }}>
              Travel India<br /><em style={{ color:"var(--orange)" }}>Your Way.</em>
            </h1>
            <p style={{ color:"rgba(255,255,255,.65)", fontSize:".95rem",
              lineHeight:1.7, maxWidth:480, marginBottom:"1.5rem" }}>
              Trains, buses, flights — book your next journey in seconds.
            </p>
          </div>
        </div>

        {/* Search box */}
        <div style={{ maxWidth:960, margin:"0 auto", padding:"0 1.5rem 2rem" }}>
          <div style={{ background:"white", borderRadius:"var(--r-xl)", padding:"1.5rem", boxShadow:"var(--sh-lg)" }}>
            <div style={{ display:"flex", gap:".5rem", marginBottom:"1.25rem" }}>
              {TABS.map(t => (
                <button key={t.id} onClick={() => switchTab(t.id)} style={{
                  padding:"9px 20px", borderRadius:"var(--r-pill)", fontFamily:"var(--font-body)",
                  fontWeight:600, fontSize:".82rem", cursor:"pointer", transition:"all .2s",
                  background: tab===t.id ? "var(--teal)" : "var(--cream-dark)",
                  color:      tab===t.id ? "white" : "var(--stone)", border:"none",
                }}>
                  {t.icon} {t.label}
                </button>
              ))}
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 160px auto", gap:"1rem", alignItems:"end" }}>
              <div>
                <label className="form-label">From</label>
                <input className="form-input" type="text" placeholder="Delhi, Mumbai…"
                  value={search.from} onChange={changeSearch("from")} />
              </div>
              <div>
                <label className="form-label">To</label>
                <input className="form-input" type="text" placeholder="Jaipur, Goa…"
                  value={search.to} onChange={changeSearch("to")} />
              </div>
              <div>
                <label className="form-label">Date</label>
                <input className="form-input" type="date" value={search.date} onChange={changeSearch("date")}
                  min={new Date().toISOString().split("T")[0]} />
              </div>
              <button className="btn btn-orange" onClick={doSearch} disabled={loading}
                style={{ height:44, whiteSpace:"nowrap" }}>
                {loading ? "…" : "Search"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div style={{ maxWidth:960, margin:"0 auto", padding:"2rem 1.5rem" }}>
        <div style={{ fontSize:".875rem", color:"var(--stone)", marginBottom:"1rem" }}>
          {loading ? "Searching…" : `${results.length} ${tab} options found`}
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
          {loading ? (
            [1,2,3].map(i => (
              <div key={i} style={{ height:100, background:"linear-gradient(90deg,var(--cream-dark) 25%,var(--cream) 50%,var(--cream-dark) 75%)",
                backgroundSize:"200% 100%", animation:"shimmer 1.5s infinite", borderRadius:"var(--r-xl)" }} />
            ))
          ) : results.map((r, i) => {
            const badge = availBadge(r);
            const rid   = r._id || r.id || i;
            return (
              <div key={rid} style={{
                background:"white", border:"1px solid var(--border)", borderRadius:"var(--r-xl)",
                padding:"1.25rem 1.5rem", boxShadow:"var(--sh-sm)",
                display:"grid", gridTemplateColumns:"1fr auto", gap:"1rem", alignItems:"center",
              }}>
                <div>
                  <div style={{ display:"flex", alignItems:"center", gap:".75rem", marginBottom:".6rem", flexWrap:"wrap" }}>
                    <span style={{ fontSize:"1.1rem" }}>{r.opIcon}</span>
                    <span style={{ fontWeight:700, color:"var(--charcoal)" }}>{r.operator}</span>
                    <span style={{ fontSize:".75rem", color:"var(--stone-light)" }}>{r.number}</span>
                    {r.vehicleType && (
                      <span style={{ background:"var(--cream-dark)", color:"var(--stone)", fontSize:".7rem",
                        padding:"2px 8px", borderRadius:"var(--r-pill)", fontWeight:500 }}>
                        {r.vehicleType}
                      </span>
                    )}
                    <span style={{ background:badge.bg, color:badge.color, fontSize:".7rem",
                      padding:"2px 8px", borderRadius:"var(--r-pill)", fontWeight:700 }}>
                      {badge.text}
                    </span>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:"1.5rem" }}>
                    <div style={{ textAlign:"center" }}>
                      <div style={{ fontFamily:"var(--font-display)", fontSize:"1.2rem", fontWeight:800 }}>{r.dep}</div>
                      <div style={{ fontSize:".7rem", color:"var(--stone-light)" }}>{r.fromCode}</div>
                      <div style={{ fontSize:".72rem", color:"var(--stone)" }}>{r.from}</div>
                    </div>
                    <div style={{ textAlign:"center", flex:1 }}>
                      <div style={{ fontSize:".75rem", color:"var(--stone)" }}>{r.duration}</div>
                      <div style={{ height:2, background:"var(--border)", borderRadius:1, margin:"4px 0" }} />
                      <div style={{ fontSize:".65rem", color:"var(--stone-light)" }}>{r.stops}</div>
                    </div>
                    <div style={{ textAlign:"center" }}>
                      <div style={{ fontFamily:"var(--font-display)", fontSize:"1.2rem", fontWeight:800 }}>{r.arr}</div>
                      <div style={{ fontSize:".7rem", color:"var(--stone-light)" }}>{r.toCode}</div>
                      <div style={{ fontSize:".72rem", color:"var(--stone)" }}>{r.to}</div>
                    </div>
                  </div>
                </div>
                <div style={{ textAlign:"center", minWidth:120 }}>
                  <div style={{ fontFamily:"var(--font-display)", fontSize:"1.4rem", fontWeight:800, color:"var(--teal)" }}>
                    ₹{r.price?.toLocaleString("en-IN")}
                  </div>
                  <div style={{ fontSize:".7rem", color:"var(--stone-light)", marginBottom:".6rem" }}>per person</div>
                  <button className="btn btn-orange btn-sm btn-full"
                    style={{ justifyContent:"center" }}
                    onClick={() => setTicketModal(r)}>
                    Book →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {ticketModal && <TicketModal result={ticketModal} onClose={() => setTicketModal(null)} />}
    </>
  );
}
