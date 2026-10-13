import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import roleApi from "../../api/roleApi";
import { getErrorMessage } from "../../api/axiosClient";
import useAuth from "../../hooks/useAuth";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import Modal from "../../components/common/Modal";
import FormField from "../../components/common/FormField";
import Loader from "../../components/common/Loader";

export default function RoleListPage() {
  const { isAdmin } = useAuth();

  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [creating, setCreating] = useState(false);

  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadRoles = async () => {
    if (!isAdmin) return;
    setLoading(true);
    setError("");
    try {
      const res = await roleApi.getAll();
      setRoles(res.data || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoles();
  }, [isAdmin]);

  const handleCreateRole = async (e) => {
    e.preventDefault();
    if (!newRoleName.trim()) {
      setError("Role Name cannot be empty.");
      return;
    }

    setCreating(true);
    setError("");
    setSuccess("");
    try {
      await roleApi.create({ name: newRoleName.trim() });
      setSuccess(`Role "${newRoleName.trim()}" created successfully.`);
      setNewRoleName("");
      setIsModalOpen(false);
      loadRoles();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;
    setDeleting(true);
    setError("");
    try {
      await roleApi.delete(deleteTargetId);
      setSuccess("Role deleted successfully.");
      setDeleteTargetId(null);
      loadRoles();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="container">
      <div className="back-link-bar">
        <Link to="/users" className="btn-secondary btn-small">
          &larr; Back to Users Management
        </Link>
      </div>

      <div className="page-header">
        <div>
          <h1>Role &amp; Permissions Management</h1>
          <p className="page-subtitle">
            Configure authorization roles used to partition system feature permissions.
          </p>
        </div>
        <button
          type="button"
          className="btn-primary"
          onClick={() => setIsModalOpen(true)}
        >
          + Add New Role
        </button>
      </div>

      {error && <div className="message-error">{error}</div>}
      {success && <div className="message-success">{success}</div>}

      {loading ? (
        <Loader message="Loading system roles..." />
      ) : (
        <div className="simple-box">
          <h3>Registered System Roles ({roles.length})</h3>
          <p style={{ margin: "4px 0 16px 0", fontSize: "13px", color: "#64748b" }}>
            The primary built-in roles are <strong>Admin</strong>, <strong>StoreManager</strong>, and <strong>Pharmacist</strong>.
          </p>

          <div className="roles-grid">
            {roles.map((r) => {
              const isCoreAdmin = r.name.toLowerCase() === "admin";
              return (
                <div key={r.id} className="role-card">
                  <div className="role-card-info">
                    <span className="role-title">{r.name}</span>
                    <span className="role-id">ID: #{r.id}</span>
                  </div>
                  <div className="role-card-actions">
                    {isCoreAdmin ? (
                      <span className="protected-role-tag">Core Protected</span>
                    ) : (
                      <button
                        type="button"
                        className="btn-danger btn-small"
                        onClick={() => setDeleteTargetId(r.id)}
                      >
                        Delete Role
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Role Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New System Role"
        maxWidth="460px"
      >
        <form className="simple-form" onSubmit={handleCreateRole}>
          <FormField label="Role Name" required hint="e.g. ClinicalAuditor, InventoryClerk">
            <input
              type="text"
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              placeholder="Enter role identifier"
              required
              autoFocus
              className="form-control"
            />
          </FormField>

          <div className="form-actions" style={{ marginTop: "16px" }}>
            <button type="submit" className="btn-primary" disabled={creating}>
              {creating ? "Creating..." : "Save New Role"}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setIsModalOpen(false)}
              disabled={creating}
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Role Confirm Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteTargetId)}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Authorization Role"
        message="Are you sure you want to delete this role? Any staff user currently mapped to this role may need reassignment."
        confirmText="Yes, Delete Role"
        loading={deleting}
      />
    </div>
  );
}
