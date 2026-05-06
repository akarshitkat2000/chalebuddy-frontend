/**
 * BecomeGuidePage — Guide Application form
 *
 * Frontend fixes:
 *  1. Now sends TWO file fields matching the backend:
 *       profilePic    → req.files.profilePic[0]
 *       identityProof → req.files.identityProof[0]
 *     (previously sent a single field called "img" which the backend ignored)
 *  2. Real-time character counter for "about" field.
 *  3. Error state shown inline, not as alert().
 *  4. Email confirmation logic on backend is untouched — only the
 *     FormData field names changed here.
 */
import { useState } from "react";
import { guideApplicationsAPI } from "../services/api";

/* ── file-input preview helper ──────────────────────────── */
const readPreview = (file, cb) => {
  const reader = new FileReader();
  reader.onload = e => cb(e.target.result);
  reader.readAsDataURL(file);
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

/* ── FileUploadField ─────────────────────────────────────── */
function FileUploadField({ label, hint, fieldName, accept = "image/*", onChange }) {
  const [preview, setPreview] = useState(null);
  const [fileName, setFileName] = useState("");
  const [err, setErr] = useState("");

  const handle = e => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) { setErr("File must be under 5 MB"); return; }
    setErr("");
    setFileName(file.name);
    readPreview(file, setPreview);
    onChange(file);
  };

  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      {hint && <p style={{ fontSize:".75rem", color:"var(--stone)", marginBottom:".4rem" }}>{hint}</p>}
      <div style={{ display:"flex", alignItems:"center", gap:"1rem", flexWrap:"wrap" }}>
        {preview ? (
          <img src={preview} alt="preview"
            style={{ width:64, height:64, borderRadius:"var(--r)", objectFit:"cover", border:"2px solid var(--teal)", flexShrink:0 }} />
        ) : (
          <div style={{ width:64, height:64, borderRadius:"var(--r)", background:"var(--cream-dark)",
            display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.6rem",
            border:"2px dashed var(--border)", flexShrink:0 }}>📄</div>
        )}
        <div>
          <label className="btn btn-outline btn-sm" style={{ cursor:"pointer", display:"inline-flex" }}>
            {preview ? "Change File" : "Upload File"}
            <input type="file" name={fieldName} accept={accept} style={{ display:"none" }} onChange={handle} />
          </label>
          {fileName && (
            <div style={{ fontSize:".73rem", color:"var(--stone)", marginTop:".3rem" }}>
              ✅ {fileName}
            </div>
          )}
          {err && <div style={{ fontSize:".73rem", color:"#DC2626", marginTop:".3rem" }}>{err}</div>}
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ───────────────────────────────────────────── */
export default function BecomeGuidePage() {
  const [form, setForm] = useState({
    fullName: "", email: "", phone: "", age: "",
    location: "", experience: "Local Expert (No License Needed!)",
    about: "", languages: "Hindi, English",
  });
  // Separate state for the two file uploads
  const [profilePic,    setProfilePic]    = useState(null);
  const [identityProof, setIdentityProof] = useState(null);

  const [errors,     setErrors]     = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted,  setSubmitted]  = useState(null);

  const change = f => e => {
    setForm(p => ({ ...p, [f]: e.target.value }));
    setErrors(p => ({ ...p, [f]: undefined, general: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.fullName.trim())          e.fullName = "Full name required";
    if (!form.email.trim())             e.email    = "Email required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";
    if (!form.phone.trim())             e.phone    = "Phone required";
    if (!form.age)                      e.age      = "Age required";
    else if (Number(form.age) < 15)     e.age      = "Must be at least 15 years old";
    if (!form.location.trim())          e.location = "Location required";
    if (!form.about.trim())             e.about    = "Required";
    else if (form.about.length < 30)    e.about    = "Write at least 30 characters";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }

    setSubmitting(true);
    try {
      // ── Build FormData ─────────────────────────────────────
      // Field names MUST match backend upload.fields() config:
      //   profilePic    → guideApplicationController req.files.profilePic[0]
      //   identityProof → guideApplicationController req.files.identityProof[0]
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (profilePic)    fd.append("profilePic",    profilePic);
      if (identityProof) fd.append("identityProof", identityProof);

      const res = await guideApplicationsAPI.submit(fd);
      setSubmitted({ id: res.data?.id, name: form.fullName });
    } catch (err) {
      setErrors({ general: err.message || "Submission failed. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubmitted(null);
    setForm({ fullName:"", email:"", phone:"", age:"", location:"",
              experience:"Local Expert (No License Needed!)", about:"", languages:"Hindi, English" });
    setProfilePic(null);
    setIdentityProof(null);
    setErrors({});
  };

  /* ── Success screen ──────────────────────────────────────── */
  if (submitted) {
    return (
      <div style={{ paddingTop:"var(--nav-h)", minHeight:"70vh", display:"flex",
        alignItems:"center", justifyContent:"center", textAlign:"center", padding:"6rem 1.5rem" }}>
        <div>
          <div style={{ fontSize:"4rem", marginBottom:"1rem" }}>🎉</div>
          <h2 style={{ fontFamily:"var(--font-display)", fontSize:"clamp(1.8rem,3vw,2.5rem)",
            color:"var(--charcoal)", marginBottom:".75rem" }}>Application Submitted!</h2>
          <p style={{ color:"var(--stone)", maxWidth:"480px", margin:"0 auto 1rem", lineHeight:1.8 }}>
            Thank you <strong>{submitted.name}</strong>! Our team will review your application and
            contact you at <strong>{form.phone}</strong> within <strong>48 hours</strong>.
          </p>
          {submitted.id && (
            <p style={{ fontSize:".8rem", color:"var(--stone-light)", marginBottom:"2rem" }}>
              Application ID:{" "}
              <code style={{ background:"var(--cream-dark)", padding:"2px 8px", borderRadius:4 }}>
                {submitted.id.toString().slice(-8).toUpperCase()}
              </code>
            </p>
          )}
          <div style={{ display:"flex", gap:"1rem", justifyContent:"center", flexWrap:"wrap" }}>
            <button className="btn btn-teal" onClick={resetForm}>Submit Another</button>
            <a href="/" className="btn btn-ghost-teal">Back to Home</a>
          </div>
        </div>
      </div>
    );
  }

  /* ── Main form ───────────────────────────────────────────── */
  return (
    <>
      {/* Hero */}
      <div style={{ background:"var(--cream)", paddingTop:"var(--nav-h)" }}>
        <div className="bg-hero-split">
          <div className="bg-hero-text">
            <div className="age-badge">✅ Sirf 15+ age chahiye — no degree needed!</div>
            <h1>Turn Your Local Knowledge<br /><em>Into a Legacy.</em></h1>
            <p>
              Join an exclusive community of Indian storytellers, historians, and explorers.
              Share the hidden gems of your city and earn a premium income doing what you love.
            </p>
            <div style={{ display:"flex", gap:"1rem", flexWrap:"wrap" }}>
              <a href="#guide-form" className="btn btn-orange">Start Your Journey</a>
            </div>
          </div>
          <div className="bg-hero-img-wrap">
            <img className="bg-hero-img"
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=70" alt="Guide" />
            <div className="bg-float-card">
              <div className="label">★ Top Rated Guide</div>
              <div className="name">Arjun, Heritage Explorer</div>
              <div className="sub">Old Delhi, 200+ trips this year</div>
              <div className="stars">★★★★★</div>
            </div>
            <div className="bg-earn-badge">
              <div className="earn-label">Avg Monthly Earnings</div>
              <div className="earn-amount">₹45,000</div>
              <div className="earn-sub">Active guides in metro cities</div>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits */}
      <section className="bg-benefits">
        <div style={{ textAlign:"center", marginBottom:"3rem" }}>
          <span className="eyebrow">The Opportunity</span>
          <h2 style={{ fontFamily:"var(--font-display)", fontSize:"clamp(1.8rem,3.5vw,3rem)",
            color:"var(--charcoal)", marginTop:".75rem" }}>
            Why lead with Chale Buddy?
          </h2>
        </div>
        <div className="bg-benefits-grid">
          {[
            { i:"💰", bg:"var(--orange-light)", t:"Earn Extra Income",
              d:"Set your own rates. Our guides earn an average of ₹45,000 per month." },
            { i:"📚", bg:"var(--teal-light)", t:"Share Your Culture",
              d:"Preserve and promote your local heritage. Be the bridge between communities." },
            { i:"🤝", bg:"#ECFDF5", t:"Global Network",
              d:"Connect with high-value solo travelers from across the globe." },
          ].map(b => (
            <div key={b.t} className="benefit-card">
              <div className="benefit-icon" style={{ background:b.bg }}>{b.i}</div>
              <div className="benefit-title">{b.t}</div>
              <p className="benefit-desc">{b.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Application Form ────────────────────────────────── */}
      <section style={{ padding:"4rem 1.5rem" }} id="guide-form">
        <div className="bg-form-card">
          <span className="eyebrow" style={{ display:"block", textAlign:"center", marginBottom:".75rem" }}>
            Ready to Start?
          </span>
          <h2>Submit Your Application</h2>
          <p style={{ color:"var(--stone)", marginBottom:"1.5rem", textAlign:"center" }}>
            Our team will get back to you within 48 hours.
          </p>

          {/* Perks strip */}
          <div className="perks-row">
            {[
              ["💰","Set Your Rate","₹500–₹3,000/day"],
              ["⏰","Flexible Hours","Any time"],
              ["💳","Direct Payment","To your bank"],
              ["🏆","Build Profile","Via verified reviews"],
            ].map(([i,t,s]) => (
              <div key={t} className="perk-box">
                <div className="perk-ico">{i}</div>
                <div><div className="perk-ttl">{t}</div><div className="perk-sub">{s}</div></div>
              </div>
            ))}
          </div>

          <div className="no-degree-note">
            🎓 Koi qualification zaroori nahi. 15+ age aur local knowledge kaafi hai!
          </div>

          {/* Global error */}
          {errors.general && (
            <div style={{ background:"#FEF2F2", border:"1px solid #FECACA", borderRadius:"var(--r)",
              padding:".75rem 1rem", marginBottom:"1rem", color:"#DC2626", fontSize:".84rem" }}>
              {errors.general}
            </div>
          )}

          {/* ── File Uploads ─────────────────────────────────── */}
          <div style={{ background:"var(--cream)", borderRadius:"var(--r-lg)", padding:"1.25rem",
            marginBottom:"1.5rem", border:"1px dashed var(--border)" }}>
            <div style={{ fontWeight:700, color:"var(--charcoal)", marginBottom:"1rem", fontSize:".9rem" }}>
              📎 Document Uploads
            </div>
            <div className="form-row">
              <FileUploadField
                label="Profile Photo"
                hint="Clear face photo (JPG/PNG, max 5 MB)"
                fieldName="profilePic"
                onChange={setProfilePic}
              />
              <FileUploadField
                label="Identity Proof"
                hint="Aadhaar, PAN, Voter ID or Passport (JPG/PNG, max 5 MB)"
                fieldName="identityProof"
                onChange={setIdentityProof}
              />
            </div>
          </div>

          {/* ── Text fields ──────────────────────────────────── */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input className="form-input" type="text" placeholder="Rahul Sharma"
                value={form.fullName} onChange={change("fullName")} />
              {errors.fullName && <p style={{ color:"#DC2626", fontSize:".75rem", marginTop:".25rem" }}>{errors.fullName}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input className="form-input" type="email" placeholder="rahul@mail.com"
                value={form.email} onChange={change("email")} />
              {errors.email && <p style={{ color:"#DC2626", fontSize:".75rem", marginTop:".25rem" }}>{errors.email}</p>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Phone *</label>
              <input className="form-input" type="tel" placeholder="+91 XXXXX XXXXX"
                value={form.phone} onChange={change("phone")} />
              {errors.phone && <p style={{ color:"#DC2626", fontSize:".75rem", marginTop:".25rem" }}>{errors.phone}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Age *</label>
              <input className="form-input" type="number" placeholder="15+" min="15"
                value={form.age} onChange={change("age")} />
              {errors.age && <p style={{ color:"#DC2626", fontSize:".75rem", marginTop:".25rem" }}>{errors.age}</p>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Location (City, State) *</label>
              <input className="form-input" type="text" placeholder="e.g. Jaipur, Rajasthan"
                value={form.location} onChange={change("location")} />
              {errors.location && <p style={{ color:"#DC2626", fontSize:".75rem", marginTop:".25rem" }}>{errors.location}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Languages You Speak</label>
              <input className="form-input" type="text" placeholder="Hindi, English, Bengali…"
                value={form.languages} onChange={change("languages")} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Experience Level</label>
            <select className="form-select" value={form.experience} onChange={change("experience")}>
              <option>Local Expert (No License Needed!)</option>
              <option>Professional Licensed Guide</option>
              <option>Food &amp; Cuisine Expert</option>
              <option>First Time (No Experience OK!)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              Tell us about your favourite local spot *
            </label>
            <textarea
              className="form-textarea"
              placeholder="Describe the story you want to tell — minimum 30 characters…"
              value={form.about}
              onChange={change("about")}
            />
            {/* Live character counter */}
            <div style={{ fontSize:".73rem", marginTop:".25rem",
              color: form.about.length === 0 ? "var(--stone-light)"
                   : form.about.length < 30  ? "#DC2626"
                   :                           "#059669" }}>
              {form.about.length} characters
              {form.about.length < 30 && form.about.length > 0 && ` — need ${30 - form.about.length} more`}
              {form.about.length >= 30 && " ✓"}
            </div>
            {errors.about && (
              <p style={{ color:"#DC2626", fontSize:".75rem", marginTop:".25rem" }}>{errors.about}</p>
            )}
          </div>

          <button
            className="btn btn-orange btn-full"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? "Submitting Application…" : "Submit Application →"}
          </button>
        </div>
      </section>
    </>
  );
}
