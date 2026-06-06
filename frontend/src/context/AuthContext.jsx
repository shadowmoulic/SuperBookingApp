import { createContext, useState, useEffect, useCallback } from "react";
import { supabase } from "../config/supabaseClient";
import api from "../api/api";

const AuthContext = createContext();

export default AuthContext;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkUserStatus = useCallback(async () => {
    try {
      const response = await api.get("/auth/me/");
      setUser(response.data);
      setLoading(false);
    } catch (error) {
      console.log(error.response?.data?.detail);
      setUser(null);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // For compatibility with any old references, we expose logout and login wrappers
  // However, UI components should ideally use AuthServices directly for detailed error handling.
  
  const loginWrapper = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const loginWithFirebaseToken = async (firebaseToken) => {
    try {
      const response = await api.post("/auth/login/", {
        firebase_token: firebaseToken,
      });
      // Handle both 200 (Login) and 201 (Social Signup/Created)
      if (response.status === 200 || response.status === 201) {
        await checkUserStatus();
      }
    } catch (error) {
      console.error(
        "[Auth] Firebase token login failed:",
        error.response?.data || error.message,
      );
      throw error;
    }
  };

  const logout = async () => {
    await api.post("/auth/logout/");
    setUser(null);
  };

  const contextData = {
    user,
    isAuthenticated: !!user,
    loading,
    login: loginWrapper,
    loginWithFirebaseToken,
    logout,
  };

  return (
    <AuthContext.Provider value={contextData}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
