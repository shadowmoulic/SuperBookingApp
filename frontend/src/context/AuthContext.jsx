import { createContext, useState, useEffect } from "react";
import { supabase } from "../config/supabaseClient";

const AuthContext = createContext();

export default AuthContext;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const logoutWrapper = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const contextData = {
    user,
    session,
    loading,
    login: loginWrapper,
    logout: logoutWrapper,
  };

  return (
    <AuthContext.Provider value={contextData}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
