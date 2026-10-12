import React, { useState } from "react";
import {
  Pill,
  Shield,
  ShieldCheck,
  Lock,
  Mail,
  User,
  Package,
  ArrowRight,
  AlertTriangle
} from "lucide-react";
import { login, errorMessage, parseJwt } from "../api";

export default function LoginPage({ onLogin }) {
  const [selectedRole, setSelectedRole] = useState("Admin");
  const [email, setEmail] = useState("admin@pharmacy.com");
  const [password, setPassword] = useState("Admin@123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const sampleRoles = [
    {
      id: "Admin",
      label: "Admin",
      email: "admin@pharmacy.com",
      pass: "Admin@123",
      icon: Shield,
      desc: "Full system administration"
    },
    {
      id: "StoreManager",
      label: "Store Manager",
      email: "manager@pharmacy.com",
      pass: "Manager@123",
      icon: Package,
      desc: "Inventory and procurement"
    },
    {
      id: "Pharmacist",
      label: "Pharmacist",
      email: "pharmacist@pharmacy.com",
      pass: "Pharmacist@123",
      icon: Pill,
      desc: "Dispensing and batch monitoring"
    }
  ];

  function handleSelectRole(roleItem) {
    setSelectedRole(roleItem.id);
    setEmail(roleItem.email);
    setPassword(roleItem.pass);
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await login({
        email: email.trim(),
        password: password
      });
      const token = data.token || data.accessToken || data.jwt;

      if (!token) {
        throw new Error(
          "The API response did not contain a valid JWT authorization token."
        );
      }

      // Decode JWT payload for roles
      const decoded = parseJwt(token);
      const roleClaim =
        decoded?.["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
        decoded?.role ||
        selectedRole;

      const userObj = {
        id: data.userId || data.id,
        fullName:
          data.fullName ||
          (selectedRole === "StoreManager"
            ? "Store Manager"
            : selectedRole === "Pharmacist"
            ? "Lead Pharmacist"
            : "System Administrator"),
        email: data.email || email,
        role: Array.isArray(roleClaim) ? roleClaim[0] : roleClaim
      };

      onLogin(token, userObj);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page-container">
      <div className="login-card-wrapper">
        {/* Brand Header */}
        <div className="login-header">
          <div className="brand-badge">
            <Pill size={22} strokeWidth={2.5} />
          </div>
          <h1>PharmaCare</h1>
          <p className="subtitle">Stock & Expiry Management System</p>
        </div>

        {/* Card Body */}
        <div className="login-card">
          <div className="login-card-title">
            <h2>Sign In</h2>
            <p>Select a quick-fill role or enter your credentials</p>
          </div>

          {/* Quick Role Fill Selector */}
          <div className="role-selector-group">
            <span className="role-selector-label">Role Quick-Fill:</span>
            <div className="role-buttons">
              {sampleRoles.map((r) => {
                const Icon = r.icon;
                const isSelected = selectedRole === r.id && email === r.email;
                return (
                  <button
                    key={r.id}
                    type="button"
                    className={`role-chip ${isSelected ? "active" : ""}`}
                    onClick={() => handleSelectRole(r)}
                    title={r.desc}
                  >
                    <Icon size={14} />
                    <span>{r.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <div className="error-banner">
              <AlertTriangle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <label className="form-field">
              <span>Email Address</span>
              <div className="input-with-icon">
                <Mail size={16} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@pharmacy.com"
                  autoComplete="username"
                />
              </div>
            </label>

            <label className="form-field">
              <span>Password</span>
              <div className="input-with-icon">
                <Lock size={16} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  autoComplete="current-password"
                />
              </div>
            </label>

            <button
              type="submit"
              className="btn btn-primary login-btn"
              disabled={loading}
            >
              {loading ? "Authenticating..." : "Sign In"}
              <ArrowRight size={16} />
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="login-copyright">
          <span>© {new Date().getFullYear()} PharmaCare. All rights reserved.</span>
        </div>
      </div>
    </div>
  );
}
