import React, { createContext, useState, useEffect, useCallback } from "react";
import authApi from "../api/authApi";
import {
  getToken,
  setToken as storeToken,
  getUser,
  setUser as storeUser,
  clearAuth,
  parseJwt
} from "../utils/tokenStorage";
import { ROLES } from "../utils/constants";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(() => getToken());
  const [user, setUserState] = useState(() => getUser());

  // Normalize role
  const extractRole = useCallback((tokenVal, userObj) => {
    if (userObj?.role) return userObj.role;
    if (!tokenVal) return "";
    const decoded = parseJwt(tokenVal);
    const roleClaim =
      decoded?.["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
      decoded?.role ||
      "";
    return Array.isArray(roleClaim) ? roleClaim[0] : roleClaim;
  }, []);

  const role = user?.role || extractRole(token, user) || "";
  const isAuthenticated = Boolean(token);
  const isAdmin = role.toLowerCase() === ROLES.ADMIN.toLowerCase();
  const isStoreManager = role.toLowerCase() === ROLES.STORE_MANAGER.toLowerCase();
  const isPharmacist = role.toLowerCase() === ROLES.PHARMACIST.toLowerCase();

  // Listen to 401 events dispatched by axiosClient
  useEffect(() => {
    const handleUnauthorized = () => {
      setTokenState("");
      setUserState(null);
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("auth:unauthorized", handleUnauthorized);
  }, []);

  const login = async (credentials) => {
    const response = await authApi.login(credentials);
    const data = response.data;
    const newToken = data?.token;

    if (!newToken) {
      throw new Error("No token returned by the server.");
    }

    const decoded = parseJwt(newToken);
    const roleClaim =
      decoded?.["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
      decoded?.role ||
      data?.role ||
      "User";

    const userObj = {
      userId: data?.userId || decoded?.nameid || decoded?.sub,
      email: data?.email || credentials.email,
      fullName: data?.fullName || decoded?.unique_name || credentials.email.split("@")[0],
      role: Array.isArray(roleClaim) ? roleClaim[0] : roleClaim
    };

    storeToken(newToken);
    storeUser(userObj);
    setTokenState(newToken);
    setUserState(userObj);

    return { token: newToken, user: userObj };
  };

  const logout = () => {
    clearAuth();
    setTokenState("");
    setUserState(null);
  };

  const value = {
    token,
    user,
    role,
    isAuthenticated,
    isAdmin,
    isStoreManager,
    isPharmacist,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
