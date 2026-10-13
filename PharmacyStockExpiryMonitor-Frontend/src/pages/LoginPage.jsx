import React, { useState } from "react";
import { loginApi, parseJwt, getErrorMessage } from "../services/api";
import "../styles/Login.css";

export default function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await loginApi({ email: email.trim(), password });
      const data = response.data;
      const token = data?.token;

      if (!token) {
        throw new Error("No token returned by the server.");
      }

      // Decode user role and information dynamically from JWT token
      const decoded = parseJwt(token);
      const roleClaim =
        decoded?.["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
        decoded?.role ||
        data?.role ||
        "User";

      const userObj = {
        userId: data?.userId || decoded?.nameid || decoded?.sub,
        email: data?.email || email.trim(),
        fullName: data?.fullName || decoded?.unique_name || email.trim().split("@")[0],
        role: Array.isArray(roleClaim) ? roleClaim[0] : roleClaim
      };

      onLoginSuccess(token, userObj);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Pharmacy Stock & Expiry Monitor</h1>
        <p className="subtitle">Sign in to your account</p>

        {error && <div className="message-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ width: "100%", marginTop: "14px" }}
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
