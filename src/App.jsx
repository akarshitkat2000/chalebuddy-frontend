import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import Navbar          from "./components/Navbar";
import Footer          from "./components/Footer";
import BuddyBot        from "./components/BuddyBot";
import LoginModal      from "./components/LoginModal";

import HomePage           from "./pages/HomePage";
import FindGuidePage      from "./pages/FindGuidePage";
import CreateTripPage     from "./pages/CreateTripPage";
import BecomeGuidePage    from "./pages/BecomeGuidePage";
import LocalFoodPage      from "./pages/LocalFoodPage";
import StaysPage          from "./pages/StaysPage";
import TransportPage      from "./pages/TransportPage";
import AboutPage          from "./pages/AboutPage";
import ContactPage        from "./pages/ContactPage";
import AdminDashboard     from "./pages/AdminDashboard";
import BookingCheckout    from "./pages/BookingCheckout";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function Layout() {
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <div style={{ fontFamily: "var(--font-body)" }}>
      <ScrollToTop />
      <Navbar openLogin={() => setLoginOpen(true)} />
      <main>
        <Routes>
          <Route path="/"             element={<HomePage      openLogin={() => setLoginOpen(true)} />} />
          <Route path="/find-guide"   element={<FindGuidePage />} />
          <Route path="/create-trip"  element={<CreateTripPage />} />
          <Route path="/become-guide" element={<BecomeGuidePage />} />
          <Route path="/local-food"   element={<LocalFoodPage />} />
          <Route path="/stays"        element={<StaysPage />} />
          <Route path="/transport"    element={<TransportPage />} />
          <Route path="/about"        element={<AboutPage />} />
          <Route path="/contact"      element={<ContactPage />} />
          <Route path="/admin"        element={<AdminDashboard />} />
          <Route path="/checkout"     element={<BookingCheckout />} />
          <Route path="*"             element={<HomePage openLogin={() => setLoginOpen(true)} />} />
        </Routes>
      </main>
      <Footer />
      <BuddyBot />
      {loginOpen && <LoginModal onClose={() => setLoginOpen(false)} />}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout />
      </AuthProvider>
    </BrowserRouter>
  );
}
