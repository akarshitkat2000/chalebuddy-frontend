import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { showToast } from "../data";

export default function LoginModal({ onClose }) {
  const { login, register } = useAuth();
  const [tab,     setTab]     = useState("login");
  const [form,    setForm]    = useState({ name:"", email:"", password:"" });
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);

  const change = f => e => {
    setForm(p => ({ ...p, [f]: e.target.value }));
    setErrors(p => ({ ...p, [f]: undefined, general: undefined }));
  };

  const validate = () => {
    const e = {};
    if (tab==="signup" && !form.name.trim())   e.name     = "Name is required";
    if (!form.email.trim())                     e.email    = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email    = "Enter a valid email";
    if (!form.password.trim())                  e.password = "Password is required";
    else if (form.password.length < 6)          e.password = "Minimum 6 characters";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    try {
      if (tab === "login") {
        const u = await login(form.email, form.password);
        showToast(`Welcome back, ${u.name}! 🎉`);
      } else {
        const u = await register(form.name, form.email, form.password);
        showToast(`Welcome to ChaleBuddy, ${u.name}! 🎉`);
      }
      onClose();
    } catch (err) {
      setErrors({ general: err.message || "Something went wrong. Please try again." });
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="modal-card">
        <div className="modal-top">
          <div>
            <h2>{tab==="login" ? "Welcome Back" : "Join ChaleBuddy"}</h2>
            <p style={{ color:"var(--stone)", fontSize:".875rem", marginTop:".25rem" }}>
              {tab==="login" ? "Continue your journey 🗺️" : "Solo travelers welcome! 🎒"}
            </p>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-tabs">
          <button className={`btn btn-sm ${tab==="login"?"btn-teal":"btn-outline"}`} onClick={() => { setTab("login"); setErrors({}); }}>Sign In</button>
          <button className={`btn btn-sm ${tab==="signup"?"btn-teal":"btn-outline"}`} onClick={() => { setTab("signup"); setErrors({}); }}>Sign Up</button>
        </div>

        {errors.general && (
          <div style={{ background:"#FEF2F2", border:"1px solid #FECACA", borderRadius:"var(--r)", padding:".75rem 1rem", marginBottom:"1rem", fontSize:".84rem", color:"#DC2626" }}>
            {errors.general}
          </div>
        )}

        {tab==="signup" && (
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-input" type="text" placeholder="Ravi Sharma" value={form.name} onChange={change("name")} />
            {errors.name && <p style={{ color:"#DC2626", fontSize:".75rem", marginTop:".25rem" }}>{errors.name}</p>}
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Email</label>
          <input className="form-input" type="email" placeholder="you@example.com" value={form.email} onChange={change("email")} />
          {errors.email && <p style={{ color:"#DC2626", fontSize:".75rem", marginTop:".25rem" }}>{errors.email}</p>}
        </div>

        <div className="form-group">
          <label className="form-label">Password</label>
          <input className="form-input" type="password" placeholder="••••••••" value={form.password} onChange={change("password")}
            onKeyDown={e => e.key==="Enter" && handleSubmit()} />
          {errors.password && <p style={{ color:"#DC2626", fontSize:".75rem", marginTop:".25rem" }}>{errors.password}</p>}
        </div>

        <button className="btn btn-teal btn-full" style={{ marginBottom:".75rem" }} onClick={handleSubmit} disabled={loading}>
          {loading ? "Please wait…" : tab==="login" ? "Sign In →" : "Create Account →"}
        </button>

        <p style={{ textAlign:"center", fontSize:".78rem", color:"var(--stone)" }}>
          <em>By continuing, you agree to ChaleBuddy's Terms of Service.</em>
        </p>
      </div>
    </div>
  );
}
