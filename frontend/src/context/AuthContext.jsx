import { createContext, useState, useEffect, useCallback } from "react";
import api from "../api/api";

const AuthContext = createContext();

export default AuthContext;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [memberships, setMemberships] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const checkUserStatus = useCallback(async () => {
    try {
      const response = await api.get("/auth/me/");
      setUser(response.data.user || null);
      setMemberships(response.data.memberships || null);
      setPermissions(response.data.permissions || []);
      setLoading(false);
    } catch (error) {
      console.log(error.response?.data?.detail);
      setUser(null);
      setMemberships(null);
      setPermissions([]);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkUserStatus();
  }, [checkUserStatus]);

  // For compatibility with any old references, we expose logout and login wrappers
  const loginWrapper = async (email, password) => {
    try {
      const response = await api.post("/auth/login/", {
        username: email,
        password: password,
      });
      if (response.status === 200 || response.status === 201) {
        await checkUserStatus();
      }
    } catch (error) {
      console.error(
        "[Auth] Login failed:",
        error.response?.data || error.message,
      );
      throw error;
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

  const updateProfile = async (profileData) => {
    try {
      const response = await api.patch("/auth/me/", profileData);
      setUser(response.data.user || null);
      setMemberships(response.data.memberships || null);
      setPermissions(response.data.permissions || []);
      return response.data.user;
    } catch (error) {
      console.error("[Auth] Profile update failed:", error);
      throw error;
    }
  };

  const logout = async () => {
    await api.post("/auth/logout/");
    setUser(null);
    setMemberships(null);
    setPermissions([]);
  };

  const hasPermission = useCallback((permission) => {
    return permissions.includes(permission);
  }, [permissions]);

  const hasAnyPermission = useCallback((permissionList) => {
    if (!Array.isArray(permissionList)) return false;
    return permissionList.some(p => permissions.includes(p));
  }, [permissions]);

  const hasAllPermissions = useCallback((permissionList) => {
    if (!Array.isArray(permissionList)) return false;
    return permissionList.every(p => permissions.includes(p));
  }, [permissions]);

  const contextData = {
    user,
    memberships,
    permissions,
    isAuthenticated: !!user,
    loading,
    login: loginWrapper,
    loginWithFirebaseToken,
    logout,
    updateProfile,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };

  return (
    <AuthContext.Provider value={contextData}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
