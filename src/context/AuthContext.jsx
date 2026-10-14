import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { tokenStore } from "../api/client";
import { getMe, login as loginRequest } from "../api/services";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(tokenStore.getAccess()));

  useEffect(() => {
    if (!tokenStore.getAccess()) return;
    getMe()
      .then(setUser)
      .catch((err) => {
        if (err.response?.status === 401) tokenStore.clear();
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const onLogout = () => setUser(null);
    window.addEventListener("spendly:logout", onLogout);
    return () => window.removeEventListener("spendly:logout", onLogout);
  }, []);

  const login = useCallback(async (username, password) => {
    await loginRequest(username, password);
    setUser(await getMe());
  }, []);

  const logout = useCallback(() => {
    tokenStore.clear();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);