/**
 * BookingCheckout.jsx — v3.0 Hybrid Payment Logic
 *
 * PAYMENT RULES (matches backend bookingController.js):
 *   stay      → PREPAID ONLY   — Razorpay popup mandatory
 *   transport → COD ONLY       — instant confirm, no popup
 *   food_tour → COD ONLY       — instant confirm, no popup
 *   guide     → BOTH           — radio: "Pay Online" / "Pay at Venue"
 *
 * SUCCESS SCREEN RULE:
 *   setConfirmed() is called ONLY:
 *     1. Inside Razorpay handler() callback after /verify succeeds
 *     2. When backend returns requiresPayment:false (COD path)
 *   NEVER called speculatively or before backend confirms.
 *
 * EMAIL RULE:
 *   Backend sends email ONLY from webhookHandler (payment.captured)
 *   or /verify. For COD bookings backend sends from notifyAll().
 *   This page never triggers emails itself.
 */

import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate }    from "react-router-dom";
import { bookingsAPI, paymentAPI }     from "../services/api";

/* ── constants ───────────────────────────────────────────────── */
const SERVICE_FEE_RATE = 0.02;
const RZP_SCRIPT       = "https://checkout.razorpay.com/v1/checkout.js";

/* ── payment category config ─────────────────────────────────── */
const PAY_CONFIG = {
  stay:      { mode: "razorpay", label: "Stays",      icon: "🏠", forcedMode: true  },
  transport: { mode: "cod",      label: "Transport",  icon: "🚂", forcedMode: true  },
  food_tour: { mode: "cod",      label: "Food Tour",  icon: "🍛", forcedMode: true  },
  guide:     { mode: "both",     label: "Guide Tour", icon: "🧭", forcedMode: false },
};

/* ── helpers ─────────────────────────────────────────────────── */
const inr     = n => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const fmtDate = d => new Date(d).toLocaleDateString("en-IN", { day:"numeric", month:"long", year:"numeric" });
const fmtType = t => ({ stay:"Stay", guide:"Guide Tour", transport:"Transport", food_tour:"Food Tour" }[t] || t);

const loadRzpScript = () => new Promise(resolve => {
  if (window.Razorpay) { resolve(true); return; }
  const existing = document.querySelector(`script[src="${RZP_SCRIPT}"]`);
  if (existing) { existing.onload = () => resolve(true); existing.onerror = () => resolve(false); return; }
  const s = document.createElement("script");
  s.src = RZP_SCRIPT;
  s.onload  = () => resolve(true);
  s.onerror = () => resolve(false);
  document.body.appendChild(s);
});

/* ════════════════════════════════════════════════════════════
   BOOKING SUMMARY CARD — left column
════════════════════════════════════════════════════════════ */
function BookingSummaryCard({ booking }) {
  const item   = booking.itemSnapshot || {};
  const imgSrc = item.img?.startsWith("/uploads")
    ? `http://localhost:5000${item.img}` : item.img || null;

  const Row = ({ icon, label, value }) => (
    <div style={{ display:"flex", alignItems:"flex-start", gap:".6rem", fontSize:".84rem" }}>
      <span style={{ flexShrink:0, marginTop:"1px" }}>{icon}</span>
      <span style={{ color:"var(--stone)", flexShrink:0, minWidth:80 }}>{label}</span>
      <span style={{ color:"var(--charcoal)", fontWeight:500, wordBreak:"break-word" }}>{value}</span>
    </div>
  );

  const cfg = PAY_CONFIG[booking.bookingType] || PAY_CONFIG.guide;

  return (
    <div style={{ background:"white", border:"1px solid var(--border)", borderRadius:"var(--r-xl)", overflow:"hidden", boxShadow:"var(--sh-sm)" }}>
      {imgSrc && (
        <div style={{ height:180, overflow:"hidden", position:"relative" }}>
          <img src={imgSrc} alt={item.name || "booking"} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
          <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top,rgba(11,22,40,.65),transparent)" }} />
          <div style={{ position:"absolute", bottom:12, left:16, color:"white", fontFamily:"var(--font-display)", fontWeight:700, fontSize:"1.1rem" }}>
            {item.name || item.operator || fmtType(booking.bookingType)}
          </div>
        </div>
      )}

      <div style={{ padding:"1.5rem" }}>
        <div style={{ display:"flex", alignItems:"center", gap:".5rem", marginBottom:"1rem", flexWrap:"wrap" }}>
          <span style={{ background:"var(--teal-light)", color:"var(--teal)", fontWeight:700, fontSize:".7rem", padding:"3px 10px", borderRadius:"var(--r-pill)", textTransform:"uppercase" }}>
            {cfg.icon} {cfg.label}
          </span>
          {booking.refId && <span style={{ fontSize:".72rem", color:"var(--stone-light)" }}>Ref: {booking.refId}</span>}
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:".55rem" }}>
          {item.city  && <Row icon="📍" label="Location" value={item.city} />}
          {item.from  && <Row icon="🚂" label="Route" value={`${item.from} → ${item.to} · ${item.dep}–${item.arr}`} />}
          {item.host  && <Row icon="🏠" label="Host" value={item.host} />}
          {item.type  && <Row icon="🧭" label="Expertise" value={item.type} />}
          <Row icon="📅" label="Date" value={fmtDate(booking.checkInDate)} />
          {booking.bookingType === "transport"
            ? <Row icon="🧳" label="Passengers" value={`${booking.passengers} passenger(s)`} />
            : <Row icon="🌙" label="Duration" value={`${booking.nights || 1} night(s)`} />
          }
          {booking.stayType && (
            <Row icon="⏱" label="Stay Type" value={booking.stayType === "quick" ? "Quick Fresh-up (2–4 hrs)" : "Overnight Stay"} />
          )}
        </div>

        <div style={{ marginTop:"1.25rem", paddingTop:"1.25rem", borderTop:"1px solid var(--border)" }}>
          <div style={{ fontSize:".7rem", fontWeight:700, letterSpacing:".1em", textTransform:"uppercase", color:"var(--stone-light)", marginBottom:".75rem" }}>
            Traveller Details
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:".45rem" }}>
            <Row icon="👤" label="Name"  value={booking.guestName} />
            <Row icon="📧" label="Email" value={booking.guestEmail} />
            {booking.guestPhone && <Row icon="📱" label="Phone" value={booking.guestPhone} />}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   PRICE PANEL — right column
════════════════════════════════════════════════════════════ */
function PricePanel({ booking, payMethod, onPayMethodChange, onPay, payLoading, payError, scriptReady }) {
  const base    = booking.basePrice || 0;
  const taxes   = booking.taxes     || 0;
  const service = Math.round(base * SERVICE_FEE_RATE);
  const total   = base + taxes + service;

  const qty     = booking.bookingType === "transport" ? (booking.passengers||1) : (booking.nights||1);
  const qtyUnit = booking.bookingType === "transport" ? "passenger" : "night";

  const cfg         = PAY_CONFIG[booking.bookingType] || PAY_CONFIG.guide;
  const isRazorpay  = payMethod === "razorpay";
  const isCOD       = payMethod === "cod";

  // Dynamic button label
  const btnLabel = () => {
    if (payLoading) return "⏳ Please wait…";
    if (isCOD)      return `✅ Confirm Booking (Pay at Venue)`;
    if (!scriptReady) return "Loading…";
    return `🔒 Pay ${inr(total)} Online`;
  };

  const btnDisabled = payLoading || (!scriptReady && isRazorpay);

  return (
    <div style={{ background:"white", border:"1px solid var(--border)", borderRadius:"var(--r-xl)", boxShadow:"var(--sh-sm)", position:"sticky", top:"calc(var(--nav-h) + 1.5rem)" }}>
      {/* Header */}
      <div style={{ background:"linear-gradient(135deg,var(--teal-deep),var(--teal))", borderRadius:"var(--r-xl) var(--r-xl) 0 0", padding:"1.25rem 1.5rem" }}>
        <div style={{ color:"rgba(255,255,255,.6)", fontSize:".72rem", textTransform:"uppercase", letterSpacing:".1em", marginBottom:".3rem" }}>
          Price Summary
        </div>
        <div style={{ color:"white", fontFamily:"var(--font-display)", fontSize:"1.75rem", fontWeight:700 }}>{inr(total)}</div>
        <div style={{ color:"rgba(255,255,255,.5)", fontSize:".78rem" }}>All taxes & fees included</div>
      </div>

      <div style={{ padding:"1.5rem" }}>
        {/* Line items */}
        <div style={{ display:"flex", flexDirection:"column", gap:".65rem", marginBottom:"1.25rem" }}>
          <PriceLine label={`Base (${inr(base/qty)} × ${qty} ${qtyUnit})`} value={inr(base)} />
          <PriceLine label="GST (5%)" value={inr(taxes)} />
          <PriceLine label="Platform Fee (2%)" value={inr(service)} hint="Keeps guides verified & stays safe" />
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", borderTop:"2px solid var(--border)", paddingTop:".75rem" }}>
            <span style={{ fontWeight:700, color:"var(--charcoal)", fontSize:".95rem" }}>Total Payable</span>
            <span style={{ fontWeight:800, color:"var(--teal)", fontSize:"1.15rem", fontFamily:"var(--font-display)" }}>{inr(total)}</span>
          </div>
        </div>

        {/* ── Payment method selector (ONLY for guide) ─────── */}
        {cfg.mode === "both" && (
          <div style={{ marginBottom:"1.25rem" }}>
            <div style={{ fontSize:".75rem", fontWeight:700, color:"var(--stone)", letterSpacing:".06em", textTransform:"uppercase", marginBottom:".6rem" }}>
              Payment Method
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:".5rem" }}>
              {[
                { val:"razorpay", icon:"💳", title:"Pay Online", sub:"UPI · Cards · Net Banking (Recommended)" },
                { val:"cod",      icon:"🤝", title:"Pay at Venue (Cash)", sub:"Pay the guide directly on the day" },
              ].map(opt => (
                <label key={opt.val} style={{
                  display:"flex", alignItems:"center", gap:".75rem",
                  padding:".85rem 1rem", border:`2px solid ${payMethod===opt.val ? "var(--teal)" : "var(--border)"}`,
                  borderRadius:"var(--r-lg)", cursor:"pointer",
                  background: payMethod===opt.val ? "var(--teal-light)" : "white",
                  transition:"all .2s",
                }}>
                  <input
                    type="radio"
                    name="payMethod"
                    value={opt.val}
                    checked={payMethod === opt.val}
                    onChange={() => onPayMethodChange(opt.val)}
                    style={{ accentColor:"var(--teal)", width:18, height:18, flexShrink:0 }}
                  />
                  <span style={{ fontSize:"1.1rem" }}>{opt.icon}</span>
                  <div>
                    <div style={{ fontWeight:700, color:"var(--charcoal)", fontSize:".88rem" }}>{opt.title}</div>
                    <div style={{ fontSize:".72rem", color:"var(--stone)" }}>{opt.sub}</div>
                  </div>
                  {opt.val === "razorpay" && (
                    <span style={{ marginLeft:"auto", background:"#E8F5E9", color:"#2E7D32", fontSize:".65rem", fontWeight:700, padding:"2px 8px", borderRadius:"var(--r-pill)" }}>
                      Secure
                    </span>
                  )}
                </label>
              ))}
            </div>
          </div>
        )}

        {/* ── COD info banner ──────────────────────────────── */}
        {isCOD && (
          <div style={{ background:"#F0FFF4", border:"1px solid #86EFAC", borderRadius:"var(--r)", padding:".75rem 1rem", marginBottom:"1rem", fontSize:".82rem", color:"#166534", display:"flex", gap:".5rem" }}>
            <span>✅</span>
            <span>
              {booking.bookingType === "food_tour"
                ? "Pay directly on the day of your food tour."
                : booking.bookingType === "transport"
                  ? "Ticket reference confirmed. Pay at boarding."
                  : "Pay the guide directly when you meet them."}
            </span>
          </div>
        )}

        {/* ── Prepaid-only info (stay) ──────────────────────── */}
        {cfg.mode === "razorpay" && (
          <div style={{ background:"var(--teal-light)", border:"1px solid #BAD8FB", borderRadius:"var(--r)", padding:".75rem 1rem", marginBottom:"1rem", fontSize:".82rem", color:"var(--teal)", display:"flex", gap:".5rem" }}>
            <span>🔒</span>
            <span>Stays require advance payment to confirm your booking and block your dates.</span>
          </div>
        )}

        {/* Error */}
        {payError && (
          <div style={{ background:"#FEF2F2", border:"1px solid #FECACA", borderRadius:"var(--r)", padding:".75rem 1rem", marginBottom:"1rem", color:"#DC2626", fontSize:".83rem", lineHeight:1.5 }}>
            ⚠️ {payError}
          </div>
        )}

        {/* Action button */}
        <button
          onClick={onPay}
          disabled={btnDisabled}
          style={{
            width:"100%", padding:"15px 24px",
            background: btnDisabled
              ? "#9CA3AF"
              : isCOD
                ? "linear-gradient(135deg,#059669,#10b981)"
                : "linear-gradient(135deg,var(--orange),#e55a00)",
            color:"white", border:"none", borderRadius:"var(--r-pill)",
            fontFamily:"var(--font-body)", fontSize:"1rem", fontWeight:700,
            cursor: btnDisabled ? "not-allowed" : "pointer",
            boxShadow: btnDisabled ? "none" : isCOD
              ? "0 8px 24px rgba(5,150,105,.35)"
              : "0 8px 24px rgba(240,123,36,.4)",
            transition:"all .25s", letterSpacing:".02em",
          }}
        >
          {btnLabel()}
        </button>

        {/* Trust row */}
        <div style={{ display:"flex", justifyContent:"center", gap:".4rem", flexWrap:"wrap", marginTop:".85rem" }}>
          {isRazorpay
            ? ["🔒 SSL","✅ Razorpay","🏦 UPI/Cards","⚡ Instant"].map(b => (
                <span key={b} style={{ fontSize:".62rem", color:"var(--stone-light)", background:"var(--cream-dark)", borderRadius:"var(--r-pill)", padding:"2px 8px" }}>{b}</span>
              ))
            : ["✅ Free to cancel","🤝 Pay directly","📧 Email confirmation"].map(b => (
                <span key={b} style={{ fontSize:".62rem", color:"var(--stone-light)", background:"var(--cream-dark)", borderRadius:"var(--r-pill)", padding:"2px 8px" }}>{b}</span>
              ))
          }
        </div>
      </div>
    </div>
  );
}

function PriceLine({ label, value, hint }) {
  return (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
      <div>
        <span style={{ fontSize:".84rem", color:"var(--stone)" }}>{label}</span>
        {hint && <div style={{ fontSize:".7rem", color:"var(--stone-light)", marginTop:"1px" }}>{hint}</div>}
      </div>
      <span style={{ fontSize:".84rem", color:"var(--charcoal)", fontWeight:600 }}>{value}</span>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   SUCCESS SCREEN
   setConfirmed() that triggers this is called ONLY from:
     1. Razorpay handler() after /verify returns 200
     2. COD confirm after backend returns requiresPayment:false
════════════════════════════════════════════════════════════ */
function SuccessScreen({ booking, confirmedData, onDone }) {
  const [countdown, setCountdown] = useState(8);

  useEffect(() => {
    const t = setInterval(() => setCountdown(c => {
      if (c <= 1) { clearInterval(t); onDone(); }
      return c - 1;
    }), 1000);
    return () => clearInterval(t);
  }, [onDone]);

  const item    = booking.itemSnapshot || {};
  const service = Math.round((booking.basePrice || 0) * SERVICE_FEE_RATE);
  const total   = (booking.basePrice || 0) + (booking.taxes || 0) + service;
  const isCOD   = confirmedData?.isCOD || booking.paymentMethod === "cod";

  return (
    <div style={{ minHeight:"100vh", paddingTop:"var(--nav-h)", background:"linear-gradient(135deg,#060d1a,#0a1e30)", display:"flex", alignItems:"center", justifyContent:"center", padding:"2rem 1rem" }}>
      <div style={{ background:"white", borderRadius:"var(--r-xl)", maxWidth:520, width:"100%", overflow:"hidden", boxShadow:"0 40px 120px rgba(0,0,0,.5)", animation:"fadeUp .5s ease" }}>

        {/* Header */}
        <div style={{ background: isCOD ? "linear-gradient(135deg,#1B6CA8,#0D4C7A)" : "linear-gradient(135deg,#059669,#10b981)", padding:"2.5rem 2rem", textAlign:"center" }}>
          <div style={{ fontSize:"3.5rem", marginBottom:".75rem" }}>🎉</div>
          <h2 style={{ color:"white", fontFamily:"var(--font-display)", fontSize:"1.8rem", margin:"0 0 .4rem" }}>
            {isCOD ? "Booking Confirmed!" : "Payment Successful!"}
          </h2>
          <p style={{ color:"rgba(255,255,255,.75)", fontSize:".88rem" }}>
            {isCOD
              ? "Your booking is saved. See you there!"
              : "Payment verified. Invoice sent to your email."}
          </p>
        </div>

        <div style={{ padding:"2rem" }}>
          {/* Booking tile */}
          <div style={{ background:"var(--cream)", borderRadius:"var(--r-lg)", padding:"1.25rem", marginBottom:"1.5rem" }}>
            <div style={{ fontFamily:"var(--font-display)", fontWeight:700, color:"var(--charcoal)", fontSize:"1.05rem", marginBottom:".75rem" }}>
              {item.name || item.operator || fmtType(booking.bookingType)}
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:".4rem" }}>
              {[
                ["Booking Ref",  <code style={{ background:"var(--teal-light)", color:"var(--teal)", padding:"1px 8px", borderRadius:4, fontSize:".82rem", fontWeight:700 }}>{booking.refId}</code>],
                ["Date",         fmtDate(booking.checkInDate)],
                ["Guest",        booking.guestName],
                item.city && ["Location", `📍 ${item.city}`],
                ["Amount",       <strong style={{ color: isCOD ? "var(--teal)" : "#059669" }}>{inr(total)}</strong>],
                !isCOD && (confirmedData?.paymentId || booking.paymentId) && [
                  "Payment ID", <code style={{ fontSize:".72rem" }}>{confirmedData?.paymentId || booking.paymentId}</code>
                ],
              ].filter(Boolean).map(([label, value]) => (
                <div key={label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", fontSize:".84rem", gap:".5rem" }}>
                  <span style={{ color:"var(--stone)", flexShrink:0 }}>{label}</span>
                  <span style={{ fontWeight:500, textAlign:"right" }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* What happens next */}
          <div style={{ marginBottom:"1.5rem" }}>
            <div style={{ fontSize:".7rem", fontWeight:700, letterSpacing:".1em", textTransform:"uppercase", color:"var(--stone-light)", marginBottom:".75rem" }}>
              What happens next
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:".55rem" }}>
              {(isCOD ? [
                ["📧", `Confirmation email sent to ${booking.guestEmail}`],
                ["🔔", "Guide / Host notified about your booking"],
                ["📱", "SMS alert sent (if phone provided)"],
                ["🤝", "Pay directly when you arrive — no online payment needed"],
              ] : [
                ["📧", `Invoice emailed to ${booking.guestEmail}`],
                ["🔔", "Guide / Host notified about your arrival"],
                ["📱", "SMS alert sent (if phone provided)"],
                ["🔒", "Your dates are now blocked — double-booking impossible"],
              ]).map(([icon, text]) => (
                <div key={text} style={{ display:"flex", gap:".6rem", fontSize:".82rem", color:"var(--stone)" }}>
                  <span>{icon}</span><span>{text}</span>
                </div>
              ))}
            </div>
          </div>

          <button onClick={onDone} className="btn btn-teal btn-full">
            Back to Home ({countdown}s)
          </button>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   PROGRESS BAR
════════════════════════════════════════════════════════════ */
function ProgressBar() {
  const steps = [
    { n:1, label:"Search",   done:true },
    { n:2, label:"Details",  done:true },
    { n:3, label:"Payment",  active:true },
    { n:4, label:"Confirmed",done:false },
  ];
  return (
    <div style={{ background:"white", borderBottom:"1px solid var(--border)", padding:"1rem 1.5rem" }}>
      <div style={{ maxWidth:960, margin:"0 auto", display:"flex", alignItems:"center", gap:".75rem" }}>
        {steps.map((step, i) => (
          <div key={step.n} style={{ display:"flex", alignItems:"center", gap:".5rem" }}>
            <div style={{
              width:28, height:28, borderRadius:"50%",
              background: step.done ? "var(--teal)" : step.active ? "var(--orange)" : "var(--border)",
              color: (step.done || step.active) ? "white" : "var(--stone)",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:".75rem", fontWeight:700, flexShrink:0,
            }}>
              {step.done ? "✓" : step.n}
            </div>
            <span style={{
              fontSize:".78rem", fontWeight: step.active ? 700 : 400,
              color: step.active ? "var(--orange)" : step.done ? "var(--teal)" : "var(--stone-light)",
            }}>
              {step.label}
            </span>
            {i < steps.length - 1 && (
              <div style={{ width:28, height:2, background: step.done ? "var(--teal)" : "var(--border)", borderRadius:1, flexShrink:0 }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   MAIN PAGE COMPONENT
════════════════════════════════════════════════════════════ */
export default function BookingCheckout() {
  const location = useLocation();
  const navigate = useNavigate();

  const params      = new URLSearchParams(location.search);
  const bookingIdQS = params.get("bookingId");

  const [booking,     setBooking]    = useState(location.state?.booking || null);
  const [loading,     setLoading]    = useState(!location.state?.booking);
  const [fetchError,  setFetchError] = useState("");
  const [payMethod,   setPayMethod]  = useState("razorpay");  // overridden on mount
  const [payLoading,  setPayLoading] = useState(false);
  const [payError,    setPayError]   = useState("");
  const [scriptReady, setScriptReady]= useState(false);
  const [confirmed,   setConfirmed]  = useState(null);        // triggers SuccessScreen
  const rzpRef = useRef(null);

  /* ── Set correct default payment method for booking type ──── */
  useEffect(() => {
    if (!booking) return;
    const cfg = PAY_CONFIG[booking.bookingType] || PAY_CONFIG.guide;
    if (cfg.mode !== "both") {
      setPayMethod(cfg.mode);  // forced — no choice
    } else {
      setPayMethod("razorpay"); // guide default: online
    }
  }, [booking?._id]);

  /* ── Load Razorpay script ─────────────────────────────────── */
  useEffect(() => {
    loadRzpScript().then(ok => {
      setScriptReady(ok);
      if (!ok) setPayError("Payment SDK failed to load. Check your internet connection.");
    });
  }, []);

  /* ── Fetch booking if not passed via state ────────────────── */
  useEffect(() => {
    if (booking) return;
    const id = bookingIdQS;
    if (!id) { setFetchError("No booking ID found."); setLoading(false); return; }
    bookingsAPI.getOne(id)
      .then(res => setBooking(res.data?.booking))
      .catch(err => setFetchError(err.message || "Failed to load booking."))
      .finally(() => setLoading(false));
  }, [bookingIdQS]);

  /* ── Already confirmed guard ────────────────────────────────
     If user reopens the page after paying, show success immediately.
     setConfirmed is NOT called here — we pass isCOD flag to SuccessScreen.
  ─────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (booking && (booking.paymentStatus === "paid" || booking.status === "confirmed")) {
      setConfirmed({ paymentId: booking.paymentId, isCOD: booking.paymentMethod === "cod" });
    }
  }, [booking?.status]);

  /* ════════════════════════════════════════════════════════════
     MAIN PAYMENT HANDLER
     Two paths based on payMethod state:
       razorpay → create order → window.Razorpay().open() →
                  handler callback → /verify → setConfirmed()
       cod      → nothing extra needed, booking already confirmed
                  by backend, setConfirmed() called immediately
  ════════════════════════════════════════════════════════════ */
  const handlePay = async () => {
    if (!booking || payLoading) return;
    setPayLoading(true);
    setPayError("");

    /* ── COD PATH ────────────────────────────────────────────
       booking.status is already "confirmed" (backend did it).
       Just show success screen immediately.
    ─────────────────────────────────────────────────────── */
    if (payMethod === "cod") {
      // Small delay for UX (shows "please wait" briefly)
      setTimeout(() => {
        setConfirmed({ isCOD: true });   // ← ONLY trigger of setConfirmed for COD
        setPayLoading(false);
      }, 600);
      return;
    }

    /* ── RAZORPAY PATH ───────────────────────────────────────
       Step 1 → create order
       Step 2 → open Razorpay popup
       Step 3 → handler() → /verify → setConfirmed()
              setConfirmed() is called ONLY inside handler callback
    ─────────────────────────────────────────────────────── */
    if (!scriptReady) {
      setPayError("Payment SDK not loaded. Please refresh the page.");
      setPayLoading(false);
      return;
    }

    try {
      /* Step 1 — Create Razorpay order */
      const orderRes = await paymentAPI.createOrder({ bookingId: booking._id });
      const { orderId, amount, currency, keyId, booking: bMeta } = orderRes.data;

      /* Step 2 — Open popup, wait for user action */
      await new Promise((resolve, reject) => {
        const options = {
          key:         keyId,
          amount,                          // paise
          currency,
          order_id:    orderId,
          name:        "ChaleBuddy",
          description: `${fmtType(booking.bookingType)} · ${bMeta.refId}`,
          image:       "/logo3.png",
          prefill: {
            name:    bMeta.guestName,
            email:   bMeta.guestEmail,
            contact: bMeta.guestPhone || "",
          },
          notes: { bookingId: booking._id, bookingType: booking.bookingType },
          theme: { color: "#1B6CA8" },

          /* ── SUCCESS — called by Razorpay after payment captured ── */
          handler: async (response) => {
            try {
              /* Step 3 — Verify HMAC signature on backend */
              const verifyRes = await paymentAPI.verifyPayment({
                razorpay_order_id:   response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature:  response.razorpay_signature,
              });

              /* setConfirmed() ONLY called here after backend confirms */
              setConfirmed({
                ...verifyRes.data,
                isCOD: false,
              });
              setBooking(b => ({
                ...b,
                paymentId: response.razorpay_payment_id,
                status:    "confirmed",
              }));
              resolve(verifyRes.data);

            } catch (verifyErr) {
              /*
               * Payment was taken but /verify had an issue.
               * Webhook (payment.captured) will auto-confirm within seconds.
               * We show an error but the booking WILL be confirmed.
               */
              setPayError(
                `Payment captured (ID: ${response.razorpay_payment_id}). ` +
                `Verification pending — your booking will auto-confirm within 2 minutes. ` +
                `Check your email.`
              );
              reject(new Error(verifyErr.message));
            }
          },

          /* ── USER DISMISSED POPUP ── */
          modal: {
            ondismiss: () => {
              setPayError("Payment cancelled. Click 'Pay Online' to try again.");
              reject(new Error("cancelled"));
            },
          },
        };

        rzpRef.current = new window.Razorpay(options);

        /* ── PAYMENT FAILED (card declined etc.) ── */
        rzpRef.current.on("payment.failed", resp => {
          const msg = resp.error?.description || "Payment failed. Please try a different method.";
          setPayError(msg);
          reject(new Error(msg));
        });

        rzpRef.current.open();   // ← POPUP OPENS HERE
      });

    } catch (err) {
      if (err.message !== "cancelled") {
        setPayError(err.message || "Something went wrong. Please try again.");
      }
    } finally {
      setPayLoading(false);
    }
  };

  /* ── Loading ────────────────────────────────────────────── */
  if (loading) {
    return (
      <div style={{ paddingTop:"var(--nav-h)", minHeight:"70vh", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <div style={{ textAlign:"center" }}>
          <div style={{ width:44, height:44, border:"4px solid var(--border)", borderTopColor:"var(--teal)", borderRadius:"50%", animation:"spin 1s linear infinite", margin:"0 auto 1rem" }} />
          <p style={{ color:"var(--stone)" }}>Loading booking details…</p>
        </div>
      </div>
    );
  }

  /* ── Error ──────────────────────────────────────────────── */
  if (fetchError || !booking) {
    return (
      <div style={{ paddingTop:"var(--nav-h)", minHeight:"70vh", display:"flex", alignItems:"center", justifyContent:"center", textAlign:"center", padding:"2rem" }}>
        <div>
          <div style={{ fontSize:"3rem", marginBottom:"1rem" }}>😕</div>
          <h2 style={{ fontFamily:"var(--font-display)", color:"var(--charcoal)", marginBottom:".5rem" }}>Booking Not Found</h2>
          <p style={{ color:"var(--stone)", marginBottom:"1.5rem" }}>{fetchError || "We couldn't load your booking details."}</p>
          <button className="btn btn-teal" onClick={() => navigate(-1)}>← Go Back</button>
        </div>
      </div>
    );
  }

  /* ── SUCCESS SCREEN ─────────────────────────────────────── */
  if (confirmed) {
    return (
      <SuccessScreen
        booking={booking}
        confirmedData={confirmed}
        onDone={() => navigate("/")}
      />
    );
  }

  /* ── MAIN CHECKOUT PAGE ─────────────────────────────────── */
  return (
    <div style={{ paddingTop:"var(--nav-h)", minHeight:"100vh", background:"var(--cream)" }}>
      <ProgressBar />

      {/* Header */}
      <div style={{ background:"linear-gradient(135deg,#060d1a,#0a1e30)", padding:"1.75rem 1.5rem" }}>
        <div style={{ maxWidth:960, margin:"0 auto", display:"flex", alignItems:"center", gap:"1rem" }}>
          <button onClick={() => navigate(-1)} style={{ background:"rgba(255,255,255,.08)", border:"1px solid rgba(255,255,255,.12)", color:"rgba(255,255,255,.6)", borderRadius:"var(--r)", padding:"8px 14px", cursor:"pointer", fontFamily:"var(--font-body)", fontSize:".82rem" }}>
            ← Back
          </button>
          <div>
            <div style={{ fontSize:".65rem", fontWeight:700, letterSpacing:".18em", textTransform:"uppercase", color:"var(--orange)", marginBottom:".25rem" }}>
              Secure Checkout
            </div>
            <h1 style={{ fontFamily:"var(--font-display)", color:"white", fontSize:"clamp(1.3rem,3vw,1.8rem)", margin:0 }}>
              Complete Your Booking
            </h1>
          </div>
        </div>
      </div>

      {/* Two-column layout */}
      <div style={{ maxWidth:960, margin:"0 auto", padding:"2rem 1.5rem", display:"grid", gridTemplateColumns:"1fr 380px", gap:"2rem", alignItems:"start" }} className="checkout-grid">

        {/* Left */}
        <div>
          <BookingSummaryCard booking={booking} />

          {/* Cancellation policy */}
          <div style={{ marginTop:"1.25rem", background:"white", border:"1px solid var(--border)", borderRadius:"var(--r-xl)", padding:"1.25rem", boxShadow:"var(--sh-sm)" }}>
            <div style={{ fontWeight:700, color:"var(--charcoal)", fontSize:".88rem", marginBottom:".75rem" }}>📋 Cancellation Policy</div>
            <div style={{ display:"flex", flexDirection:"column", gap:".45rem" }}>
              {[
                ["✅","Free cancellation up to 24 hours before check-in"],
                ["⚠️","50% charge if cancelled within 24 hours"],
                ["❌","No refund for no-shows"],
              ].map(([i,t]) => (
                <div key={t} style={{ display:"flex", gap:".5rem", fontSize:".82rem", color:"var(--stone)" }}>
                  <span>{i}</span><span>{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right */}
        <PricePanel
          booking={booking}
          payMethod={payMethod}
          onPayMethodChange={setPayMethod}
          onPay={handlePay}
          payLoading={payLoading}
          payError={payError}
          scriptReady={scriptReady}
        />
      </div>

      <style>{`@media(max-width:700px){.checkout-grid{grid-template-columns:1fr !important;}}`}</style>
    </div>
  );
}
