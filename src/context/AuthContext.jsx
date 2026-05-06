import { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session
  useEffect(() => {
    const token = localStorage.getItem("cb_token");
    if (token) {
      authAPI.me()
        .then(res => setUser(res.data?.user || res.user))
        .catch(() => localStorage.removeItem("cb_token"))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    localStorage.setItem("cb_token", res.token);
    const u = res.data?.user || res.user;
    setUser(u);
    return u;
  };

  const register = async (name, email, password) => {
    const res = await authAPI.register({ name, email, password });
    localStorage.setItem("cb_token", res.token);
    const u = res.data?.user || res.user;
    setUser(u);
    return u;
  };

  const logout = async () => {
    await authAPI.logout().catch(() => {});
    localStorage.removeItem("cb_token");
    setUser(null);
  };

  const updateProfile = async data => {
    const res = await authAPI.updateProfile(data);
    const u = res.data?.user || res.user;
    setUser(u);
    return u;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
