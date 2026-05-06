/**
 * ChaleBuddy API Service — Axios-based, fully connected
 */
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Axios instance
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token to every request
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem("cb_token");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// Unwrap response data; surface error messages
api.interceptors.response.use(
  res  => res.data,
  err  => Promise.reject(new Error(err.response?.data?.message || err.message || "Server error"))
);

// ── Auth ─────────────────────────────────────────────────────
export const authAPI = {
  register:       d => api.post("/auth/register", d),
  login:          d => api.post("/auth/login", d),
  logout:         ()=> api.post("/auth/logout"),
  me:             ()=> api.get("/auth/me"),
  updateProfile:  d => api.patch("/auth/update-profile", d),
  updatePassword: d => api.patch("/auth/update-password", d),
};

// ── Guides ───────────────────────────────────────────────────
export const guidesAPI = {
  getAll:      (p={}) => api.get("/guides",          { params: p }),
  getFeatured: ()     => api.get("/guides/featured"),
  getStats:    ()     => api.get("/guides/stats"),
  getOne:      id     => api.get(`/guides/${id}`),
  addReview:   (id,d) => api.post(`/guides/${id}/reviews`, d),
};

// ── Stays ────────────────────────────────────────────────────
export const staysAPI = {
  getAll:      (p={}) => api.get("/stays",           { params: p }),
  getFeatured: ()     => api.get("/stays/featured"),
  getCities:   ()     => api.get("/stays/cities"),
  getOne:      id     => api.get(`/stays/${id}`),
  addReview:   (id,d) => api.post(`/stays/${id}/reviews`, d),
  // POST /api/stays/list — authenticated host listing (multipart/form-data)
  listHome:    fd     => api.post("/stays/list", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  }),
};

// ── Transport ────────────────────────────────────────────────
export const transportAPI = {
  getAll:     (p={}) => api.get("/transport",         { params: p }),
  search:     p      => api.get("/transport/search",  { params: p }),
  getPopular: ()     => api.get("/transport/popular-routes"),
  getOne:     id     => api.get(`/transport/${id}`),
};

// ── Bookings ─────────────────────────────────────────────────
export const bookingsAPI = {
  create: d  => api.post("/bookings", d),
  getMy:  ()  => api.get("/bookings/my"),
  getOne: id  => api.get(`/bookings/${id}`),
  cancel: (id,reason) => api.patch(`/bookings/${id}/cancel`, { reason }),
};

// ── Contact ──────────────────────────────────────────────────
export const contactAPI = {
  submit:      d => api.post("/contact", d),
  subscribe:   d => api.post("/contact/newsletter/subscribe", d),
  unsubscribe: d => api.post("/contact/newsletter/unsubscribe", d),
};

// ── Trips ────────────────────────────────────────────────────
export const tripsAPI = {
  getAll:  (p={}) => api.get("/trips",           { params: p }),
  getOne:  id     => api.get(`/trips/${id}`),
  create:  d      => api.post("/trips", d),
  join:    (id,d) => api.post(`/trips/${id}/join`, d),
};

// ── Guide Applications ────────────────────────────────────────
export const guideApplicationsAPI = {
  // Uses FormData for file upload — pass FormData object directly
  submit: formData => api.post("/guide-applications", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  }),
};

// ── Admin ────────────────────────────────────────────────────
export const adminAPI = {
  // Dashboard
  getDashboard:   ()      => api.get("/admin/dashboard"),

  // Users
  getUsers:       (p={})  => api.get("/admin/users",       { params: p }),
  updateUser:     (id, d) => api.patch(`/admin/users/${id}`, d),
  deleteUser:     id      => api.delete(`/admin/users/${id}`),

  // Applications
  getApplications:  (p={})  => api.get("/admin/applications",           { params: p }),
  approveApp:       id      => api.patch(`/admin/applications/${id}/approve`),
  rejectApp:        (id, d) => api.patch(`/admin/applications/${id}/reject`, d),
  deleteApp:        id      => api.delete(`/admin/applications/${id}`),

  // Guides
  getGuides:      (p={})  => api.get("/admin/guides",      { params: p }),
  updateGuide:    (id, d) => api.patch(`/admin/guides/${id}`, d),
  deleteGuide:    id      => api.delete(`/admin/guides/${id}`),

  // Stays
  getStays:       (p={})  => api.get("/admin/stays",       { params: p }),
  createStay:     fd      => api.post("/admin/stays", fd, { headers: { "Content-Type": "multipart/form-data" } }),
  updateStay:     (id,fd) => api.patch(`/admin/stays/${id}`, fd, { headers: { "Content-Type": "multipart/form-data" } }),
  deleteStay:     id      => api.delete(`/admin/stays/${id}`),
  approveStay:    id      => api.patch(`/admin/stays/${id}/approve`),

  // Transport
  getTransport:   (p={})  => api.get("/admin/transport",   { params: p }),
  createTransport: d      => api.post("/admin/transport", d),
  updateTransport: (id,d) => api.patch(`/admin/transport/${id}`, d),
  deleteTransport: id     => api.delete(`/admin/transport/${id}`),

  // Trips
  getTrips:       (p={})  => api.get("/admin/trips",       { params: p }),
  deleteTrip:     id      => api.delete(`/admin/trips/${id}`),
  featureTrip:    (id,d)  => api.patch(`/admin/trips/${id}/feature`, d),

  // Bookings
  getBookings:    (p={})  => api.get("/admin/bookings",    { params: p }),
  updateBooking:  (id, d) => api.patch(`/admin/bookings/${id}`, d),
  deleteBooking:  id      => api.delete(`/admin/bookings/${id}`),

  // Contacts
  getContacts:    (p={})  => api.get("/admin/contacts",    { params: p }),
  replyContact:   (id, d) => api.post(`/admin/contacts/${id}/reply`, d),
  updateContact:  (id, d) => api.patch(`/admin/contacts/${id}`, d),
  deleteContact:  id      => api.delete(`/admin/contacts/${id}`),

  // Newsletter
  getNewsletters:    (p={}) => api.get("/admin/newsletters",      { params: p }),
  deleteNewsletter:  id     => api.delete(`/admin/newsletters/${id}`),
  broadcast:         d      => api.post("/admin/newsletters/broadcast", d),
};

// ── Payments ─────────────────────────────────────────────────
export const paymentAPI = {
  getConfig:     ()  => api.get("/payments/config"),
  createOrder:   d   => api.post("/payments/create-order", d),
  verifyPayment: d   => api.post("/payments/verify", d),
};

export default api;