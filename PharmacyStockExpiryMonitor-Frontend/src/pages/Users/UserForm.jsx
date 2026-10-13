import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import userApi from "../../api/userApi";
import roleApi from "../../api/roleApi";
import { getErrorMessage } from "../../api/axiosClient";
import FormField from "../../components/common/FormField";
import Loader from "../../components/common/Loader";
import { ROLES } from "../../utils/constants";

export default function UserForm({ onSuccess, onCancel }) {
  const navigate = useNavigate();

  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingRoles, setFetchingRoles] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    phoneNumber: "",
    role: ROLES.PHARMACIST
  });

  useEffect(() => {
    const loadRoles = async () => {
      setFetchingRoles(true);
      try {
        const res = await roleApi.getAll();
        const list = res.data || [];
        setRoles(list);
        if (list.length > 0) {
          setFormData((prev) => ({ ...prev, role: list[0].name }));
        }
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setFetchingRoles(false);
      }
    };
    loadRoles();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.email.trim() || !formData.password) {
      setError("Please fill in Full Name, Email, and Password.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await userApi.create({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phoneNumber: formData.phoneNumber.trim() || null,
        role: formData.role
      });

      setSuccess("New user account created successfully.");
      if (onSuccess) {
        onSuccess();
      } else {
        setTimeout(() => navigate("/users"), 600);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleCancelClick = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate("/users");
    }
  };

  if (fetchingRoles) {
    return <Loader message="Loading system authorization roles..." />;
  }

  return (
    <div className="form-card-container">
      <div className="form-header">
        <h3>Create New System User</h3>
        <p className="form-description">
          Provision credential access and assign authorization roles for staff members.
        </p>
      </div>

      {error && <div className="message-error">{error}</div>}
      {success && <div className="message-success">{success}</div>}

      <form className="simple-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <FormField label="Full Name" required>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="e.g. Dr. Sarah Jenkins"
              required
              autoFocus
              className="form-control"
            />
          </FormField>

          <FormField label="Email Address" required>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="s.jenkins@pharmacy.com"
              required
              className="form-control"
            />
          </FormField>
        </div>

        <div className="form-row">
          <FormField label="Account Password (Min 6 chars)" required>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Secure password"
              required
              className="form-control"
            />
          </FormField>

          <FormField label="Contact Phone Number">
            <input
              type="text"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              placeholder="+92 300 1234567"
              className="form-control"
            />
          </FormField>
        </div>

        <FormField label="Assigned System Role" required hint="Determines access levels and permitted operations.">
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            required
            className="form-control"
          >
            {roles.map((r) => (
              <option key={r.id} value={r.name}>
                {r.name}
              </option>
            ))}
          </select>
        </FormField>

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Creating User..." : "Save User Account"}
          </button>
          <button type="button" className="btn-secondary" onClick={handleCancelClick} disabled={loading}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
