import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { adminAPI } from "../services/api";

/* ── Toast helper ─────────────────────────────────────────── */
const toast = (msg, isErr = false) => {
  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = msg;
  el.style.borderLeftColor = isErr ? "#DC2626" : "var(--orange)";
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3200);
};

/* ── Confirm dialog ───────────────────────────────────────── */
const confirmAction = msg => window.confirm(msg);

/* ── Stat Card ────────────────────────────────────────────── */
const StatCard = ({ icon, label, value, color = "var(--teal)" }) => (
  <div style={{ background:"white", border:"1px solid var(--border)", borderRadius:"var(--r-xl)", padding:"1.5rem", display:"flex", alignItems:"center", gap:"1rem", boxShadow:"var(--sh-sm)" }}>
    <div style={{ width:52, height:52, borderRadius:"var(--r-lg)", background:`${color}15`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.6rem", flexShrink:0 }}>{icon}</div>
    <div>
      <div style={{ fontFamily:"var(--font-display)", fontSize:"1.8rem", fontWeight:700, color:"var(--charcoal)", lineHeight:1 }}>{value?.toLocaleString("en-IN") ?? "—"}</div>
      <div style={{ fontSize:".75rem", color:"var(--stone)", marginTop:4 }}>{label}</div>
    </div>
  </div>
);

/* ── Badge ────────────────────────────────────────────────── */
const Badge = ({ val, map }) => {
  const conf = map[val] || { bg:"#F3F4F6", color:"#6B7280", label: val };
  return <span style={{ background:conf.bg, color:conf.color, fontSize:".68rem", fontWeight:700, padding:"2px 8px", borderRadius:"var(--r-pill)" }}>{conf.label ?? val}</span>;
};

const STATUS_MAP = {
  confirmed:  { bg:"#ECFDF5", color:"#059669", label:"Confirmed" },
  pending:    { bg:"#FFF7ED", color:"#D97706", label:"Pending" },
  cancelled:  { bg:"#FEF2F2", color:"#DC2626", label:"Cancelled" },
  completed:  { bg:"#EEF2FF", color:"#4338CA", label:"Completed" },
  approved:   { bg:"#ECFDF5", color:"#059669", label:"Approved" },
  rejected:   { bg:"#FEF2F2", color:"#DC2626", label:"Rejected" },
  new:        { bg:"#EFF6FF", color:"#1D4ED8", label:"New" },
  read:       { bg:"#F9FAFB", color:"#6B7280", label:"Read" },
  replied:    { bg:"#ECFDF5", color:"#059669", label:"Replied" },
};

/* ══════════════════════════════════════════════════════════════
   SECTIONS
══════════════════════════════════════════════════════════════ */

/* ── Dashboard Overview ──────────────────────────────────── */
function DashboardSection() {
  const [data, setData] = useState(null);
  useEffect(() => {
    adminAPI.getDashboard().then(res => setData(res.data)).catch(() => {});
  }, []);

  if (!data) return <div style={{ padding:"3rem", textAlign:"center", color:"var(--stone)" }}>Loading dashboard…</div>;
  const { stats, recentBookings, bookingsByType } = data;

  return (
    <div>
      <h2 style={{ fontFamily:"var(--font-display)", color:"var(--charcoal)", marginBottom:"1.5rem" }}>Dashboard Overview</h2>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:"1rem", marginBottom:"2rem" }}>
        <StatCard icon="👥" label="Total Users"           value={stats.users}               color="var(--teal)" />
        <StatCard icon="🧭" label="Guides"                value={stats.guides}              color="var(--orange)" />
        <StatCard icon="🏠" label="Stays"                 value={stats.stays}               color="#059669" />
        <StatCard icon="🎟️" label="Bookings"              value={stats.bookings}            color="#7C3AED" />
        <StatCard icon="🗺️" label="Trips"                 value={stats.trips}               color="#0891B2" />
        <StatCard icon="📩" label="New Inquiries"         value={stats.pendingContacts}     color="#DC2626" />
        <StatCard icon="📧" label="Newsletter Subscribers" value={stats.activeNewsletters}  color="#16A34A" />
        <StatCard icon="⏳" label="Pending Applications"  value={stats.pendingApplications} color="#D97706" />
      </div>
      <div style={{ background:"white", border:"1px solid var(--border)", borderRadius:"var(--r-xl)", padding:"1.5rem", boxShadow:"var(--sh-sm)" }}>
        <h3 style={{ fontFamily:"var(--font-display)", color:"var(--charcoal)", marginBottom:"1rem" }}>
          Total Revenue: <span style={{ color:"var(--teal)" }}>₹{stats.totalRevenue?.toLocaleString("en-IN")}</span>
        </h3>
        {bookingsByType?.length > 0 && (
          <div style={{ display:"flex", gap:"1rem", flexWrap:"wrap", marginBottom:"1.25rem" }}>
            {bookingsByType.map(b => (
              <div key={b._id} style={{ background:"var(--cream)", borderRadius:"var(--r-lg)", padding:".75rem 1.25rem", textAlign:"center" }}>
                <div style={{ fontWeight:700, color:"var(--charcoal)", textTransform:"capitalize" }}>{b._id}</div>
                <div style={{ fontSize:"1.2rem", fontWeight:700, color:"var(--teal)" }}>{b.count}</div>
                <div style={{ fontSize:".75rem", color:"var(--stone)" }}>₹{b.revenue?.toLocaleString("en-IN")}</div>
              </div>
            ))}
          </div>
        )}
        <h4 style={{ color:"var(--stone)", fontSize:".85rem", marginBottom:".75rem" }}>Recent Bookings</h4>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:".82rem" }}>
            <thead><tr style={{ borderBottom:"2px solid var(--border)", textAlign:"left" }}>
              {["Ref","Guest","Type","Item","Amount","Status"].map(h => <th key={h} style={{ padding:"8px 12px", color:"var(--stone)", fontWeight:600 }}>{h}</th>)}
            </tr></thead>
            <tbody>{recentBookings?.map(b => (
              <tr key={b._id} style={{ borderBottom:"1px solid var(--border)" }}>
                <td style={{ padding:"8px 12px", fontWeight:700, color:"var(--teal)" }}>{b.refId}</td>
                <td style={{ padding:"8px 12px" }}>{b.guestName}<br/><span style={{ color:"var(--stone-light)", fontSize:".72rem" }}>{b.guestEmail}</span></td>
                <td style={{ padding:"8px 12px", textTransform:"capitalize" }}>{b.bookingType}</td>
                <td style={{ padding:"8px 12px" }}>{b.stay?.name || b.transport?.operator || b.guide?.name || b.itemSnapshot?.name || "—"}</td>
                <td style={{ padding:"8px 12px", fontWeight:700 }}>₹{b.totalAmount?.toLocaleString("en-IN")}</td>
                <td style={{ padding:"8px 12px" }}><Badge val={b.status} map={STATUS_MAP} /></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ── Guide Applications ──────────────────────────────────── */
function ApplicationsSection() {
  const [apps,    setApps]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState("");

  const load = useCallback(() => {
    setLoading(true);
    adminAPI.getApplications({ status: filter, limit: 50 })
      .then(res => setApps(res.data?.applications || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const approve = async id => {
    if (!confirmAction("Approve this application and create Guide profile?")) return;
    try {
      await adminAPI.approveApp(id);
      toast("✅ Application approved! Guide profile created.");
      load();
    } catch (err) { toast(err.message, true); }
  };

  const reject = async id => {
    const reason = prompt("Reason for rejection (optional):");
    if (reason === null) return;
    try {
      await adminAPI.rejectApp(id, { reason });
      toast("Application rejected.");
      load();
    } catch (err) { toast(err.message, true); }
  };

  const del = async id => {
    if (!confirmAction("Delete this application permanently?")) return;
    try { await adminAPI.deleteApp(id); toast("Deleted."); load(); }
    catch (err) { toast(err.message, true); }
  };

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.5rem", flexWrap:"wrap", gap:"1rem" }}>
        <h2 style={{ fontFamily:"var(--font-display)", color:"var(--charcoal)" }}>Guide Applications</h2>
        <div style={{ display:"flex", gap:".5rem", flexWrap:"wrap" }}>
          {["","pending","under_review","approved","rejected"].map(s => (
            <button key={s} className={`chip ${filter === s ? "active" : ""}`} onClick={() => setFilter(s)}>
              {s || "All"}
            </button>
          ))}
        </div>
      </div>
      {loading ? <p style={{ color:"var(--stone)" }}>Loading…</p> : apps.length === 0 ? <p style={{ color:"var(--stone)" }}>No applications found.</p> : (
        <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
          {apps.map(a => (
            <div key={a._id} style={{ background:"white", border:"1px solid var(--border)", borderRadius:"var(--r-xl)", padding:"1.25rem", boxShadow:"var(--sh-sm)" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:"1rem" }}>
                <div style={{ display:"flex", gap:"1rem", alignItems:"center" }}>
                  {a.img && <img src={`http://localhost:5000${a.img}`} alt={a.fullName} style={{ width:56, height:56, borderRadius:"50%", objectFit:"cover" }} />}
                  <div>
                    <div style={{ fontWeight:700, color:"var(--charcoal)", fontSize:"1rem" }}>{a.fullName}</div>
                    <div style={{ fontSize:".78rem", color:"var(--stone)" }}>📧 {a.email} · 📱 {a.phone} · 📍 {a.location} · Age: {a.age}</div>
                    <div style={{ fontSize:".78rem", color:"var(--stone)", marginTop:2 }}>{a.experience}</div>
                  </div>
                </div>
                <div style={{ display:"flex", gap:".5rem", alignItems:"center", flexWrap:"wrap" }}>
                  <Badge val={a.status} map={STATUS_MAP} />
                  {a.status === "pending" && <>
                    <button className="btn btn-teal btn-sm" onClick={() => approve(a._id)}>✅ Approve</button>
                    <button className="btn btn-outline btn-sm" onClick={() => reject(a._id)}>❌ Reject</button>
                  </>}
                  <button className="btn btn-outline btn-sm" style={{ color:"#DC2626", borderColor:"#DC2626" }} onClick={() => del(a._id)}>🗑</button>
                </div>
              </div>
              <p style={{ fontSize:".82rem", color:"var(--stone)", marginTop:".75rem", lineHeight:1.65, borderTop:"1px solid var(--border)", paddingTop:".75rem" }}>{a.about}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Generic CRUD table ──────────────────────────────────── */
function CRUDTable({ title, columns, fetchFn, deleteFn, extraActions, searchPlaceholder = "Search…" }) {
  const [rows,    setRows]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [page,    setPage]    = useState(1);
  const [total,   setTotal]   = useState(0);
  const LIMIT = 15;

  const load = useCallback(() => {
    setLoading(true);
    fetchFn({ search, page, limit: LIMIT })
      .then(res => {
        const data = res.data;
        // find first array in data
        const arr = Object.values(data || {}).find(v => Array.isArray(v)) || [];
        setRows(arr);
        setTotal(res.total || arr.length);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [fetchFn, search, page]);

  useEffect(() => { load(); }, [load]);

  const del = async id => {
    if (!confirmAction("Delete this record permanently?")) return;
    try { await deleteFn(id); toast("Deleted."); load(); }
    catch (err) { toast(err.message, true); }
  };

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.5rem", flexWrap:"wrap", gap:"1rem" }}>
        <h2 style={{ fontFamily:"var(--font-display)", color:"var(--charcoal)" }}>{title} <span style={{ fontSize:".85rem", color:"var(--stone)", fontFamily:"var(--font-body)" }}>({total})</span></h2>
        <input className="form-input" style={{ maxWidth:260 }} placeholder={searchPlaceholder} value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
      </div>
      {loading ? <p style={{ color:"var(--stone)" }}>Loading…</p> : (
        <>
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:".82rem" }}>
              <thead><tr style={{ borderBottom:"2px solid var(--border)", textAlign:"left" }}>
                {columns.map(c => <th key={c.key} style={{ padding:"10px 12px", color:"var(--stone)", fontWeight:600 }}>{c.label}</th>)}
                <th style={{ padding:"10px 12px", color:"var(--stone)", fontWeight:600 }}>Actions</th>
              </tr></thead>
              <tbody>{rows.map(row => (
                <tr key={row._id} style={{ borderBottom:"1px solid var(--border)" }} onMouseEnter={e => e.currentTarget.style.background="#F9FAFB"} onMouseLeave={e => e.currentTarget.style.background=""}>
                  {columns.map(c => (
                    <td key={c.key} style={{ padding:"10px 12px", maxWidth:240, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                      {c.render ? c.render(row) : (row[c.key] ?? "—")}
                    </td>
                  ))}
                  <td style={{ padding:"10px 12px" }}>
                    <div style={{ display:"flex", gap:".35rem", flexWrap:"wrap" }}>
                      {extraActions?.(row, load)}
                      <button className="btn btn-outline btn-sm" style={{ color:"#DC2626", borderColor:"#FECACA", padding:"4px 10px" }} onClick={() => del(row._id)}>🗑 Delete</button>
                    </div>
                  </td>
                </tr>
              ))}</tbody>
            </table>
          </div>
          {total > LIMIT && (
            <div style={{ display:"flex", justifyContent:"center", gap:".5rem", marginTop:"1rem" }}>
              <button className="btn btn-outline btn-sm" disabled={page === 1} onClick={() => setPage(p => p-1)}>← Prev</button>
              <span style={{ padding:"8px 14px", fontSize:".85rem", color:"var(--stone)" }}>Page {page} / {Math.ceil(total/LIMIT)}</span>
              <button className="btn btn-outline btn-sm" disabled={rows.length < LIMIT} onClick={() => setPage(p => p+1)}>Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ── Bookings Hub ────────────────────────────────────────── */
function BookingsSection() {
  const [bookings, setBookings] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState({ status:"", bookingType:"" });
  const [page,     setPage]     = useState(1);
  const [total,    setTotal]    = useState(0);
  const LIMIT = 15;

  const load = useCallback(() => {
    setLoading(true);
    adminAPI.getBookings({ ...filter, page, limit: LIMIT })
      .then(res => { setBookings(res.data?.bookings || []); setTotal(res.total || 0); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filter, page]);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id, status) => {
    try { await adminAPI.updateBooking(id, { status }); toast("Status updated."); load(); }
    catch (err) { toast(err.message, true); }
  };

  const del = async id => {
    if (!confirmAction("Delete this booking?")) return;
    try { await adminAPI.deleteBooking(id); toast("Deleted."); load(); }
    catch (err) { toast(err.message, true); }
  };

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.25rem", flexWrap:"wrap", gap:"1rem" }}>
        <h2 style={{ fontFamily:"var(--font-display)", color:"var(--charcoal)" }}>Bookings Hub <span style={{ fontSize:".85rem", color:"var(--stone)", fontFamily:"var(--font-body)" }}>({total})</span></h2>
        <div style={{ display:"flex", gap:".5rem", flexWrap:"wrap" }}>
          <select className="sort-sel" value={filter.status} onChange={e => setFilter(f => ({...f, status: e.target.value}))}>
            <option value="">All Status</option>
            {["pending","confirmed","cancelled","completed"].map(s => <option key={s}>{s}</option>)}
          </select>
          <select className="sort-sel" value={filter.bookingType} onChange={e => setFilter(f => ({...f, bookingType: e.target.value}))}>
            <option value="">All Types</option>
            {["stay","transport","guide"].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>
      {loading ? <p style={{ color:"var(--stone)" }}>Loading…</p> : bookings.length === 0 ? <p style={{ color:"var(--stone)" }}>No bookings found.</p> : (
        <>
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:".8rem" }}>
              <thead><tr style={{ borderBottom:"2px solid var(--border)", textAlign:"left" }}>
                {["Ref","Guest","Type","Item","Check-in","Nights/Pax","Total","Status","Actions"].map(h =>
                  <th key={h} style={{ padding:"10px 12px", color:"var(--stone)", fontWeight:600, whiteSpace:"nowrap" }}>{h}</th>
                )}
              </tr></thead>
              <tbody>{bookings.map(b => (
                <tr key={b._id} style={{ borderBottom:"1px solid var(--border)" }}>
                  <td style={{ padding:"10px 12px", fontWeight:700, color:"var(--teal)", whiteSpace:"nowrap" }}>{b.refId}</td>
                  <td style={{ padding:"10px 12px" }}><div style={{ fontWeight:600 }}>{b.guestName}</div><div style={{ color:"var(--stone-light)", fontSize:".72rem" }}>{b.guestEmail}</div></td>
                  <td style={{ padding:"10px 12px", textTransform:"capitalize" }}>{b.bookingType}</td>
                  <td style={{ padding:"10px 12px", maxWidth:160, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                    {b.stay?.name || b.transport?.operator || b.guide?.name || b.itemSnapshot?.name || "—"}
                  </td>
                  <td style={{ padding:"10px 12px", whiteSpace:"nowrap" }}>{new Date(b.checkInDate).toLocaleDateString("en-IN")}</td>
                  <td style={{ padding:"10px 12px" }}>{b.bookingType === "transport" ? `${b.passengers} pax` : `${b.nights} nights`}</td>
                  <td style={{ padding:"10px 12px", fontWeight:700 }}>₹{b.totalAmount?.toLocaleString("en-IN")}</td>
                  <td style={{ padding:"10px 12px" }}><Badge val={b.status} map={STATUS_MAP} /></td>
                  <td style={{ padding:"10px 12px" }}>
                    <div style={{ display:"flex", gap:".35rem" }}>
                      {b.status === "pending" && <button className="btn btn-teal btn-sm" style={{ padding:"3px 8px" }} onClick={() => updateStatus(b._id,"confirmed")}>Confirm</button>}
                      {b.status !== "cancelled" && <button className="btn btn-outline btn-sm" style={{ padding:"3px 8px" }} onClick={() => updateStatus(b._id,"cancelled")}>Cancel</button>}
                      <button className="btn btn-outline btn-sm" style={{ color:"#DC2626", borderColor:"#FECACA", padding:"3px 8px" }} onClick={() => del(b._id)}>🗑</button>
                    </div>
                  </td>
                </tr>
              ))}</tbody>
            </table>
          </div>
          {total > LIMIT && (
            <div style={{ display:"flex", justifyContent:"center", gap:".5rem", marginTop:"1rem" }}>
              <button className="btn btn-outline btn-sm" disabled={page===1} onClick={() => setPage(p=>p-1)}>← Prev</button>
              <span style={{ padding:"8px 14px", fontSize:".85rem", color:"var(--stone)" }}>Page {page}</span>
              <button className="btn btn-outline btn-sm" disabled={bookings.length < LIMIT} onClick={() => setPage(p=>p+1)}>Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ── Contacts Section ────────────────────────────────────── */
function ContactsSection() {
  const [contacts, setContacts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState("");
  const [replyId,  setReplyId]  = useState(null);
  const [replyMsg, setReplyMsg] = useState("");

  const load = () => {
    setLoading(true);
    adminAPI.getContacts({ status: filter, limit: 50 })
      .then(res => setContacts(res.data?.contacts || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, [filter]);

  const sendReply = async () => {
    if (!replyMsg.trim()) return;
    try {
      await adminAPI.replyContact(replyId, { message: replyMsg });
      toast("Reply sent! ✉️");
      setReplyId(null); setReplyMsg("");
      load();
    } catch (err) { toast(err.message, true); }
  };

  const markStatus = async (id, status) => {
    try { await adminAPI.updateContact(id, { status }); load(); }
    catch (err) { toast(err.message, true); }
  };

  const del = async id => {
    if (!confirmAction("Delete this inquiry?")) return;
    try { await adminAPI.deleteContact(id); load(); }
    catch (err) { toast(err.message, true); }
  };

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.5rem", flexWrap:"wrap", gap:"1rem" }}>
        <h2 style={{ fontFamily:"var(--font-display)", color:"var(--charcoal)" }}>Contact Inquiries</h2>
        <div style={{ display:"flex", gap:".5rem" }}>
          {["","new","read","replied","archived"].map(s => (
            <button key={s} className={`chip ${filter===s?"active":""}`} onClick={() => setFilter(s)}>{s||"All"}</button>
          ))}
        </div>
      </div>

      {/* Reply modal */}
      {replyId && (
        <div className="modal-overlay" onClick={e => e.target===e.currentTarget && setReplyId(null)}>
          <div className="modal-card" style={{ maxWidth:480 }}>
            <div className="modal-top"><h2>Send Reply</h2><button className="modal-close" onClick={() => setReplyId(null)}>✕</button></div>
            <textarea className="form-textarea" style={{ minHeight:120 }} placeholder="Your reply message…" value={replyMsg} onChange={e => setReplyMsg(e.target.value)} />
            <button className="btn btn-teal btn-full" style={{ marginTop:"1rem" }} onClick={sendReply}>Send Reply ✉️</button>
          </div>
        </div>
      )}

      {loading ? <p style={{ color:"var(--stone)" }}>Loading…</p> : contacts.length === 0 ? <p style={{ color:"var(--stone)" }}>No inquiries found.</p> : (
        <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
          {contacts.map(c => (
            <div key={c._id} style={{ background:"white", border:"1px solid var(--border)", borderRadius:"var(--r-xl)", padding:"1.25rem", boxShadow:"var(--sh-sm)" }}>
              <div style={{ display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:".75rem" }}>
                <div>
                  <div style={{ fontWeight:700, color:"var(--charcoal)" }}>{c.name} <span style={{ fontWeight:400, color:"var(--stone)", fontSize:".82rem" }}>— {c.subject}</span></div>
                  <div style={{ fontSize:".78rem", color:"var(--stone-light)" }}>📧 {c.email} · {c.phone && `📱 ${c.phone} ·`} {new Date(c.createdAt).toLocaleString("en-IN")}</div>
                </div>
                <div style={{ display:"flex", gap:".5rem", alignItems:"center", flexWrap:"wrap" }}>
                  <Badge val={c.status} map={STATUS_MAP} />
                  <button className="btn btn-teal btn-sm" onClick={() => { setReplyId(c._id); setReplyMsg(""); markStatus(c._id,"read"); }}>Reply</button>
                  <button className="btn btn-outline btn-sm" onClick={() => markStatus(c._id, c.status==="archived" ? "new" : "archived")}>
                    {c.status==="archived" ? "Unarchive" : "Archive"}
                  </button>
                  <button className="btn btn-outline btn-sm" style={{ color:"#DC2626", borderColor:"#FECACA" }} onClick={() => del(c._id)}>🗑</button>
                </div>
              </div>
              <p style={{ fontSize:".84rem", color:"var(--stone)", marginTop:".75rem", lineHeight:1.65, borderTop:"1px solid var(--border)", paddingTop:".75rem" }}>{c.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Newsletter Section ──────────────────────────────────── */
function NewsletterSection() {
  const [subs,    setSubs]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [total,   setTotal]   = useState(0);
  const [broadcast, setBroadcast] = useState({ open:false, subject:"", html:"" });

  const load = () => {
    setLoading(true);
    adminAPI.getNewsletters({ limit: 100 })
      .then(res => { setSubs(res.data?.subscribers || []); setTotal(res.total || 0); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const del = async id => {
    if (!confirmAction("Remove this subscriber?")) return;
    try { await adminAPI.deleteNewsletter(id); load(); }
    catch (err) { toast(err.message, true); }
  };

  const sendBroadcast = async () => {
    if (!broadcast.subject || !broadcast.html) { toast("Subject and message required.", true); return; }
    try {
      const res = await adminAPI.broadcast({ subject: broadcast.subject, html: broadcast.html });
      toast(res.message || "Broadcast sent!");
      setBroadcast({ open:false, subject:"", html:"" });
    } catch (err) { toast(err.message, true); }
  };

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.5rem", flexWrap:"wrap", gap:"1rem" }}>
        <h2 style={{ fontFamily:"var(--font-display)", color:"var(--charcoal)" }}>Newsletter Subscribers ({total})</h2>
        <button className="btn btn-orange btn-sm" onClick={() => setBroadcast(b => ({...b, open:true}))}>📣 Send Broadcast</button>
      </div>

      {broadcast.open && (
        <div className="modal-overlay" onClick={e => e.target===e.currentTarget && setBroadcast(b=>({...b,open:false}))}>
          <div className="modal-card" style={{ maxWidth:560 }}>
            <div className="modal-top"><h2>Send Newsletter</h2><button className="modal-close" onClick={() => setBroadcast(b=>({...b,open:false}))}>✕</button></div>
            <div className="form-group"><label className="form-label">Subject *</label><input className="form-input" placeholder="e.g. Upcoming Manali Trip Special!" value={broadcast.subject} onChange={e => setBroadcast(b=>({...b,subject:e.target.value}))} /></div>
            <div className="form-group"><label className="form-label">Message (HTML supported, use {"{{name}}"} for personalisation)</label><textarea className="form-textarea" style={{ minHeight:140 }} placeholder="<p>Namaste {{name}},...</p>" value={broadcast.html} onChange={e => setBroadcast(b=>({...b,html:e.target.value}))} /></div>
            <div style={{ fontSize:".8rem", color:"var(--stone)", marginBottom:"1rem" }}>📧 Will be sent to {subs.filter(s=>s.active).length} active subscribers.</div>
            <button className="btn btn-orange btn-full" onClick={sendBroadcast}>📣 Send Now</button>
          </div>
        </div>
      )}

      {loading ? <p style={{ color:"var(--stone)" }}>Loading…</p> : (
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:".82rem" }}>
            <thead><tr style={{ borderBottom:"2px solid var(--border)", textAlign:"left" }}>
              {["Email","Name","Source","Subscribed On","Active","Action"].map(h =>
                <th key={h} style={{ padding:"10px 12px", color:"var(--stone)", fontWeight:600 }}>{h}</th>
              )}
            </tr></thead>
            <tbody>{subs.map(s => (
              <tr key={s._id} style={{ borderBottom:"1px solid var(--border)" }}>
                <td style={{ padding:"10px 12px" }}>{s.email}</td>
                <td style={{ padding:"10px 12px" }}>{s.name || "—"}</td>
                <td style={{ padding:"10px 12px" }}>{s.source}</td>
                <td style={{ padding:"10px 12px" }}>{new Date(s.createdAt).toLocaleDateString("en-IN")}</td>
                <td style={{ padding:"10px 12px" }}>{s.active ? <span style={{ color:"#059669" }}>✅</span> : <span style={{ color:"#DC2626" }}>❌</span>}</td>
                <td style={{ padding:"10px 12px" }}>
                  <button className="btn btn-outline btn-sm" style={{ color:"#DC2626", borderColor:"#FECACA", padding:"3px 10px" }} onClick={() => del(s._id)}>Remove</button>
                </td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   MAIN ADMIN DASHBOARD
════════════════════════════════════════════════════════════ */
const TABS = [
  { id:"dashboard",    label:"📊 Dashboard",     icon:"📊" },
  { id:"applications", label:"📋 Applications",  icon:"📋" },
  { id:"guides",       label:"🧭 Guides",        icon:"🧭" },
  { id:"stays",        label:"🏠 Stays",         icon:"🏠" },
  { id:"transport",    label:"🚂 Transport",      icon:"🚂" },
  { id:"trips",        label:"🗺️ Trips",          icon:"🗺️" },
  { id:"bookings",     label:"🎟️ Bookings",       icon:"🎟️" },
  { id:"contacts",     label:"📩 Inquiries",      icon:"📩" },
  { id:"newsletter",   label:"📧 Newsletter",     icon:"📧" },
  { id:"users",        label:"👥 Users",          icon:"👥" },
];

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("dashboard");

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) navigate("/");
  }, [user, loading, navigate]);

  if (loading) return <div style={{ paddingTop:"calc(var(--nav-h) + 2rem)", textAlign:"center", color:"var(--stone)" }}>Checking access…</div>;
  if (!user || user.role !== "admin") return null;

  const renderTab = () => {
    switch (tab) {
      case "dashboard":    return <DashboardSection />;
      case "applications": return <ApplicationsSection />;
      case "bookings":     return <BookingsSection />;
      case "contacts":     return <ContactsSection />;
      case "newsletter":   return <NewsletterSection />;

      case "guides": return <CRUDTable title="Guides" fetchFn={adminAPI.getGuides} deleteFn={adminAPI.deleteGuide}
        searchPlaceholder="Search name or city…"
        columns={[
          { key:"img", label:"Photo", render: r => <img src={r.img?.startsWith("/uploads") ? `http://localhost:5000${r.img}` : r.img} alt="" style={{ width:40, height:40, borderRadius:"50%", objectFit:"cover" }} /> },
          { key:"name",  label:"Name" },
          { key:"city",  label:"City" },
          { key:"type",  label:"Type" },
          { key:"rate",  label:"Rate", render: r => `₹${r.rate?.toLocaleString("en-IN")}` },
          { key:"rating",label:"Rating", render: r => `⭐ ${r.rating}` },
          { key:"verified", label:"Status", render: r => r.verified ? "✅ Verified" : "⏳ Pending" },
        ]}
        extraActions={(row, reload) => (
          <button className="btn btn-teal btn-sm" style={{ padding:"3px 10px" }}
            onClick={async () => { await adminAPI.updateGuide(row._id, { verified: !row.verified }); toast("Updated!"); reload(); }}>
            {row.verified ? "Unverify" : "Verify"}
          </button>
        )}
      />;

      case "stays": return <CRUDTable title="Stays" fetchFn={adminAPI.getStays} deleteFn={adminAPI.deleteStay}
        searchPlaceholder="Search name or city…"
        columns={[
          { key:"img", label:"Photo", render: r => <img src={r.img?.startsWith("/uploads") ? `http://localhost:5000${r.img}` : r.img} alt="" style={{ width:40, height:40, borderRadius:"var(--r)", objectFit:"cover" }} /> },
          { key:"name",          label:"Name" },
          { key:"city",          label:"City" },
          { key:"type",          label:"Type" },
          { key:"overnightPrice",label:"₹/Night", render: r => `₹${r.overnightPrice?.toLocaleString("en-IN")}` },
          { key:"host",          label:"Host" },
          { key:"verified",      label:"Status", render: r => r.verified
              ? <span style={{color:"#059669",fontWeight:700}}>✅ Live</span>
              : <span style={{color:"#D97706",fontWeight:700}}>⏳ Pending Review</span> },
          { key:"available", label:"Visible", render: r => r.available
              ? <span style={{color:"#059669"}}>👁 Yes</span>
              : <span style={{color:"#9CA3AF"}}>🚫 No</span> },
          { key:"bookingsCount", label:"Bookings" },
        ]}
        extraActions={(row, reload) => (
          <>
            {!row.verified && (
              <button className="btn btn-teal btn-sm" style={{ padding:"3px 10px", background:"#059669", border:"none" }}
                onClick={async () => {
                  if (!confirmAction(`Approve "${row.name}" and make it visible to travelers?`)) return;
                  try { await adminAPI.approveStay(row._id); toast("✅ Stay approved and published!"); reload(); }
                  catch(e){ toast(e.message, true); }
                }}>
                ✅ Approve &amp; Publish
              </button>
            )}
            {row.verified && (
              <button className="btn btn-outline btn-sm" style={{ padding:"3px 10px" }}
                onClick={async () => {
                  await adminAPI.updateStay(row._id, { available: !row.available });
                  toast(row.available ? "Stay hidden." : "Stay visible again."); reload();
                }}>
                {row.available ? "🚫 Hide" : "👁 Show"}
              </button>
            )}
          </>
        )}
      />;

      case "transport": return <CRUDTable title="Transport" fetchFn={adminAPI.getTransport} deleteFn={adminAPI.deleteTransport}
        searchPlaceholder="Search operator or route…"
        columns={[
          { key:"mode",     label:"Mode",     render: r => r.opIcon + " " + r.mode },
          { key:"operator", label:"Operator" },
          { key:"number",   label:"Number" },
          { key:"from",     label:"From" },
          { key:"to",       label:"To" },
          { key:"dep",      label:"Dep" },
          { key:"price",    label:"Price", render: r => `₹${r.price?.toLocaleString("en-IN")}` },
          { key:"avail",    label:"Avail", render: r => <Badge val={r.avail} map={{ avail:{bg:"#ECFDF5",color:"#059669",label:"Available"}, limited:{bg:"#FFF7ED",color:"#D97706",label:"Limited"}, waitlist:{bg:"#FEF2F2",color:"#DC2626",label:"Waitlist"} }} /> },
        ]}
      />;

      case "trips": return <CRUDTable title="Community Trips" fetchFn={adminAPI.getTrips} deleteFn={adminAPI.deleteTrip}
        columns={[
          { key:"title",       label:"Title" },
          { key:"creatorName", label:"Posted By" },
          { key:"destination", label:"Destination" },
          { key:"travelDate",  label:"Date",    render: r => new Date(r.travelDate).toLocaleDateString("en-IN") },
          { key:"budget",      label:"Budget",  render: r => r.budget?.split("(")[0] },
          { key:"maxBuddies",  label:"Max Buddies" },
          { key:"gender",      label:"Gender" },
          { key:"featured",    label:"Featured", render: r => r.featured ? "⭐" : "—" },
        ]}
        extraActions={(row, reload) => (
          <button className="btn btn-teal btn-sm" style={{ padding:"3px 10px" }}
            onClick={async () => { await adminAPI.featureTrip(row._id, { featured: !row.featured }); toast("Updated!"); reload(); }}>
            {row.featured ? "Unfeature" : "Feature"}
          </button>
        )}
      />;

      case "users": return <CRUDTable title="Users" fetchFn={adminAPI.getUsers} deleteFn={adminAPI.deleteUser}
        searchPlaceholder="Search name or email…"
        columns={[
          { key:"name",  label:"Name" },
          { key:"email", label:"Email" },
          { key:"role",  label:"Role", render: r => <Badge val={r.role} map={{ admin:{bg:"#FEF3C7",color:"#D97706",label:"Admin"}, guide:{bg:"#EEF2FF",color:"#4338CA",label:"Guide"}, user:{bg:"#F3F4F6",color:"#374151",label:"User"} }} /> },
          { key:"city",       label:"City" },
          { key:"createdAt",  label:"Joined", render: r => new Date(r.createdAt).toLocaleDateString("en-IN") },
        ]}
        extraActions={(row, reload) => (
          <select className="sort-sel" style={{ padding:"3px 8px", fontSize:".75rem" }} value={row.role}
            onChange={async e => { await adminAPI.updateUser(row._id, { role: e.target.value }); toast("Role updated!"); reload(); }}>
            <option value="user">User</option>
            <option value="guide">Guide</option>
            <option value="admin">Admin</option>
          </select>
        )}
      />;

      default: return null;
    }
  };

  return (
    <div style={{ paddingTop:"var(--nav-h)", minHeight:"100vh", background:"var(--cream)" }}>
      <div style={{ maxWidth:1400, margin:"0 auto", display:"grid", gridTemplateColumns:"220px 1fr", gap:0, minHeight:"calc(100vh - var(--nav-h))" }}>

        {/* Sidebar */}
        <aside style={{ background:"#080f1c", padding:"1.5rem 0" }}>
          <div style={{ padding:"0 1.25rem 1.5rem", borderBottom:"1px solid rgba(255,255,255,.06)" }}>
            <div style={{ fontSize:".65rem", fontWeight:700, letterSpacing:".15em", textTransform:"uppercase", color:"rgba(255,255,255,.3)", marginBottom:".5rem" }}>Admin Panel</div>
            <div style={{ color:"white", fontWeight:700, fontSize:".95rem" }}>{user.name}</div>
            <div style={{ fontSize:".72rem", color:"rgba(255,255,255,.4)" }}>{user.email}</div>
          </div>
          <nav style={{ padding:".75rem 0" }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                style={{ display:"block", width:"100%", textAlign:"left", padding:".65rem 1.25rem", background: tab===t.id ? "rgba(27,108,168,.25)" : "none", color: tab===t.id ? "var(--teal-light)" : "rgba(255,255,255,.6)", borderLeft: tab===t.id ? "3px solid var(--teal)" : "3px solid transparent", border:"none", fontFamily:"var(--font-body)", fontSize:".84rem", fontWeight: tab===t.id ? 700 : 400, cursor:"pointer", transition:"all .15s" }}>
                {t.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main style={{ padding:"2rem", overflowX:"hidden" }}>
          {renderTab()}
        </main>
      </div>
    </div>
  );
}
