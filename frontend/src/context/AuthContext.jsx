import { createContext, useState, useEffect, useCallback } from "react";
import api from "../api/api";

const AuthContext = createContext();

export default AuthContext;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkUserStatus = useCallback(async () => {
    try {
      const response = await api.get("/auth/me/");
      // console.log(response.data);
      setUser(response.data);
      // console.log("User authenticated:", userData);
      setLoading(false);
    } catch (error) {
      console.log(error.response?.data?.detail);
      // console.log("User not authenticated:", error.response?.status);
      setUser(null);
      setLoading(false);
    }
    // .then((response) => {
    //   const userData = response.data;
    //   setUser(userData);
    //   setToken(userData.id); // Store something meaningful
    //   // console.log("User authenticated:", userData);
    //   setLoading(false);
    // })
    // .catch((error) => {
    //   // console.log("User not authenticated:", error.response?.status);
    //   setUser(null);
    //   setToken(null);
    //   setLoading(false);
    // });
  }, []);

  useEffect(() => {
    checkUserStatus();
  }, [checkUserStatus]);

  const login = async (username, password) => {
    try {
      // console.log("[Auth] Attempting login with:", username);
      const response = await api.post("/auth/login/", {
        username: username,
        password: password,
      });
      // console.log("[Auth] Login response status:", response.status);

      if (response.status === 200) {
        checkUserStatus();
      }
    } catch (error) {
      // console.error(
      //   "[Auth] Login error:",
      //   error.response?.status,
      //   error.message,
      // );
      console.log(error.response?.data?.detail);
    }
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
    login,
    loginWithFirebaseToken,
    logout,
  };

  return (
    <AuthContext.Provider value={contextData}>{children}</AuthContext.Provider>
  );
};
