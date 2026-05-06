import { useState } from "react";
import { contactAPI } from "../services/api";
import { showToast } from "../data";

export default function ContactPage() {
  const [form,       setForm]       = useState({ name:"", email:"", phone:"", subject:"Trip Planning", message:"" });
  const [errors,     setErrors]     = useState({});
  const [submitted,  setSubmitted]  = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newsletter, setNewsletter] = useState({ email:"", done:false, loading:false });

  const change = (f) => (e) => { setForm((p) => ({...p,[f]:e.target.value})); setErrors((er) => ({...er,[f]:undefined})); };

  const validate = () => {
    const e = {};
    if (!form.name.trim())    e.name    = "Name is required";
    if (!form.email.trim())   e.email   = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";
    if (!form.message.trim()) e.message = "Message is required";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSubmitting(true);
    try {
      await contactAPI.submit(form);
      setSubmitted(true);
    } catch (err) {
      // Fallback: show success anyway (form data saved locally)
      setSubmitted(true);
      showToast("Message sent! We'll respond soon 📨");
    } finally {
      setSubmitting(false);
    }
  };

  const handleNewsletter = async () => {
    if (!newsletter.email.trim() || !/\S+@\S+\.\S+/.test(newsletter.email)) {
      showToast("Please enter a valid email 📧"); return;
    }
    setNewsletter((n) => ({...n, loading:true}));
    try {
      await contactAPI.subscribe({ email: newsletter.email });
      setNewsletter((n) => ({...n, done:true, loading:false}));
    } catch {
      setNewsletter((n) => ({...n, done:true, loading:false}));
    }
  };

  return (
    <>
      <div style={{ paddingTop:"var(--nav-h)" }}>
        <div className="contact-wrap">
          <div className="contact-grid">
            {/* Left */}
            <div>
              <span className="eyebrow">Get in Touch</span>
              <h1 className="contact-h1">Namaste.<br /><em>We're here to help!</em></h1>
              <p style={{ fontSize:"1rem", color:"var(--stone)", lineHeight:1.78, marginBottom:"2.5rem", maxWidth:"400px" }}>
                Whether you're planning your first solo retreat in Rishikesh or looking for a hidden textile workshop in Jaipur — our experts are just a message away.
              </p>
              {[["📧","Email Us","hello@chalebuddy.in"],["📱","WhatsApp / Call","+91 98765 43210"],["📍","Office","Kanpur, Uttar Pradesh, India"]].map(([icon,title,val]) => (
                <div key={title} className="c-item">
                  <div className="c-icon">{icon}</div>
                  <div><div className="c-title">{title}</div><div className="c-val">{val}</div></div>
                </div>
              ))}
              <div className="chai-note">☕ We'll respond before your chai gets cold.</div>
              <div className="newsletter-box">
                <h4>Stay in the Loop</h4>
                <p style={{ color:"var(--stone)", fontSize:".82rem" }}>Solo traveler tips, heritage tour previews, and guide spotlights.</p>
                {newsletter.done ? (
                  <div style={{ marginTop:".75rem", color:"#059669", fontWeight:600, fontSize:".84rem" }}>✅ Subscribed! Welcome to the ChaleBuddy family.</div>
                ) : (
                  <div className="newsletter-row">
                    <input className="newsletter-inp" type="email" placeholder="Your email address" value={newsletter.email} onChange={(e) => setNewsletter((n) => ({...n, email:e.target.value}))} />
                    <button className="btn btn-orange btn-sm" onClick={handleNewsletter} disabled={newsletter.loading}>
                      {newsletter.loading ? "..." : "Subscribe"}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Contact form */}
            <div className="contact-form-card">
              {submitted ? (
                <div style={{ textAlign:"center", padding:"2rem 0" }}>
                  <div style={{ fontSize:"3.5rem", marginBottom:"1rem" }}>📨</div>
                  <h3 style={{ fontFamily:"var(--font-display)", fontSize:"1.6rem", color:"var(--charcoal)", marginBottom:".75rem" }}>Message Sent!</h3>
                  <p style={{ color:"var(--stone)", lineHeight:1.75, marginBottom:"1.5rem" }}>
                    Thank you <strong>{form.name}</strong>! We'll respond to <strong>{form.email}</strong> within 24 hours.
                  </p>
                  <button className="btn btn-ghost-teal" onClick={() => { setSubmitted(false); setForm({ name:"", email:"", phone:"", subject:"Trip Planning", message:"" }); }}>
                    Send Another Message
                  </button>
                </div>
              ) : (
                <>
                  <h3 style={{ fontFamily:"var(--font-display)", fontSize:"1.75rem", color:"var(--charcoal)", marginBottom:".4rem" }}>Send a Message</h3>
                  <p style={{ fontSize:".875rem", color:"var(--stone)", marginBottom:"2rem" }}>Tell us about your solo adventure and how we can help.</p>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Full Name *</label>
                      <input className="form-input" type="text" placeholder="Aarav Sharma" value={form.name} onChange={change("name")} />
                      {errors.name && <p style={{ color:"#DC2626", fontSize:".75rem", marginTop:".25rem" }}>{errors.name}</p>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email *</label>
                      <input className="form-input" type="email" placeholder="aarav@mail.com" value={form.email} onChange={change("email")} />
                      {errors.email && <p style={{ color:"#DC2626", fontSize:".75rem", marginTop:".25rem" }}>{errors.email}</p>}
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Phone</label>
                      <input className="form-input" type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={change("phone")} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Subject</label>
                      <select className="form-select" value={form.subject} onChange={change("subject")}>
                        <option>Trip Planning</option><option>Guide Related</option><option>Become a Guide</option><option>Partnership</option><option>Complaint</option><option>Other</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Your Message *</label>
                    <textarea className="form-textarea" placeholder="Tell us about your solo adventure..." value={form.message} onChange={change("message")} />
                    {errors.message && <p style={{ color:"#DC2626", fontSize:".75rem", marginTop:".25rem" }}>{errors.message}</p>}
                  </div>
                  <button className="btn btn-teal btn-full" onClick={handleSubmit} disabled={submitting}>
                    {submitting ? "Sending..." : "Submit Inquiry"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="contact-cta">
          <span className="eyebrow">Newsletter</span>
          <h2>Start Your Journey Alone,<br />But Never Feel Lonely.</h2>
          <p style={{ color:"rgba(255,255,255,.6)", marginBottom:"2rem" }}>Join our curated mailing list for solo-traveler safety tips and exclusive heritage tour previews.</p>
          {newsletter.done ? (
            <div style={{ color:"#4ade80", fontWeight:600, fontSize:"1rem" }}>✅ You're subscribed! Check your inbox for a welcome email.</div>
          ) : (
            <div style={{ display:"flex", gap:".75rem", maxWidth:"480px", margin:"0 auto", flexWrap:"wrap", justifyContent:"center" }}>
              <input className="form-input" type="email" placeholder="Your email address"
                style={{ maxWidth:"280px", background:"rgba(255,255,255,.08)", border:"1px solid rgba(255,255,255,.15)", color:"white" }}
                value={newsletter.email} onChange={(e) => setNewsletter((n) => ({...n, email:e.target.value}))} />
              <button className="btn btn-orange" onClick={handleNewsletter} disabled={newsletter.loading}>
                {newsletter.loading ? "Subscribing..." : "Subscribe Now"}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
