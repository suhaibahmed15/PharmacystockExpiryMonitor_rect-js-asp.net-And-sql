import React, { useEffect, useState } from "react";
import {
  Users,
  Plus,
  Shield,
  Trash2,
  X,
  RefreshCw,
  AlertTriangle,
  Key,
  Mail,
  UserCheck
} from "lucide-react";
import {
  getUsers,
  createUser,
  assignUserRole,
  deleteUser,
  getRoles,
  createRole,
  errorMessage
} from "../api";
import Pagination from "../components/Pagination";

export default function UsersPage({ onSetToast, currentUser }) {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [createUserModal, setCreateUserModal] = useState(false);
  const [assignRoleModal, setAssignRoleModal] = useState(null); // target user
  const [createRoleModal, setCreateRoleModal] = useState(false);

  const [userForm, setUserForm] = useState({
    fullName: "",
    email: "",
    password: "",
    phoneNumber: "",
    role: "Pharmacist"
  });

  const [roleForm, setRoleForm] = useState({
    roleName: ""
  });

  const [selectedNewRole, setSelectedNewRole] = useState("StoreManager");
  const [saving, setSaving] = useState(false);

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const [userRes, roleRes] = await Promise.allSettled([
        getUsers(),
        getRoles()
      ]);

      if (userRes.status === "fulfilled") setUsers(userRes.value.data);
      if (roleRes.status === "fulfilled") setRoles(roleRes.value.data);

      if (userRes.status === "rejected") {
        if (userRes.reason?.response?.status === 403) {
          setError("User Management requires Administrator role permissions.");
        } else {
          setError(errorMessage(userRes.reason));
        }
      }
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleCreateUser(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await createUser({
        fullName: userForm.fullName.trim(),
        email: userForm.email.trim(),
        password: userForm.password,
        phoneNumber: userForm.phoneNumber.trim() || null,
        role: userForm.role
      });
      onSetToast(`User account for '${userForm.fullName}' created.`);
      setCreateUserModal(false);
      loadData();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleAssignRole(e) {
    e.preventDefault();
    if (!assignRoleModal) return;
    setSaving(true);
    try {
      await assignUserRole(assignRoleModal.id, selectedNewRole);
      onSetToast(`Role '${selectedNewRole}' assigned to ${assignRoleModal.fullName}.`);
      setAssignRoleModal(null);
      loadData();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleCreateRole(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await createRole(roleForm.roleName.trim());
      onSetToast(`Security role '${roleForm.roleName}' registered.`);
      setCreateRoleModal(false);
      setRoleForm({ roleName: "" });
      loadData();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteUser(userItem) {
    if (!window.confirm(`Delete user '${userItem.fullName || userItem.email}'?`)) return;
    try {
      await deleteUser(userItem.id);
      onSetToast("User account deleted.");
      loadData();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  return (
    <div className="page-content">
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            <span>IDENTITY & ACCESS GOVERNANCE</span>
            <span className="eyebrow-line" />
          </div>
          <h1>Users & Security Roles</h1>
          <p>
            Role-Based Access Control (RBAC) governing Pharmacists, Store Managers, and System Administrators.
          </p>
        </div>
        <div className="heading-actions">
          <button className="btn btn-light" onClick={loadData}>
            <RefreshCw size={15} /> Refresh
          </button>
          <button className="btn btn-light" onClick={() => setCreateRoleModal(true)}>
            <Shield size={15} /> New Role
          </button>
          <button className="btn btn-primary" onClick={() => setCreateUserModal(true)}>
            <Plus size={16} /> Add User
          </button>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <AlertTriangle size={18} />
          <span>{error}</span>
          <button onClick={loadData}>Retry</button>
        </div>
      )}

      {/* Users Table */}
      <section className="panel table-panel">
        <div className="panel-head">
          <div className="table-caption">
            Showing <b>{users.length}</b> registered pharmacy personnel accounts
          </div>
        </div>

        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>PERSONNEL NAME</th>
                <th>EMAIL ADDRESS</th>
                <th>ASSIGNED ROLE</th>
                <th>CONTACT PHONE</th>
                <th>ACCOUNT STATUS</th>
                <th className="text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {users
                .slice((page - 1) * pageSize, page * pageSize)
                .map((u) => (
                <tr key={u.id}>
                  <td>
                    <b>{u.fullName || "—"}</b>
                  </td>
                  <td>
                    <div className="contact-link">
                      <Mail size={13} className="text-muted" />
                      <span>{u.email}</span>
                    </div>
                  </td>
                  <td>
                    <span
                      className={`role-pill ${
                        u.role === "Admin"
                          ? "role-admin"
                          : u.role === "StoreManager"
                          ? "role-manager"
                          : "role-pharmacist"
                      }`}
                    >
                      <Shield size={12} /> {u.role || "Pharmacist"}
                    </span>
                  </td>
                  <td>{u.phoneNumber || "—"}</td>
                  <td>
                    <span className={`status-pill ${u.isActive ? "good" : "muted"}`}>
                      <i /> {u.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="text-right">
                    <div className="action-buttons-group">
                      <button
                        className="btn btn-xs btn-light"
                        onClick={() => {
                          setSelectedNewRole(u.role || "Pharmacist");
                          setAssignRoleModal(u);
                        }}
                      >
                        <UserCheck size={13} /> Change Role
                      </button>
                      <button
                        className="icon-btn delete-btn"
                        onClick={() => handleDeleteUser(u)}
                        title="Delete User"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="empty-table-cell">
                    <Users size={32} />
                    <p>No user accounts found or insufficient permissions.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          page={page}
          pageSize={pageSize}
          totalCount={users.length}
          onPageChange={setPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setPage(1);
          }}
        />
      </section>

      {/* Roles Summary */}
      <section className="panel" style={{ marginTop: "20px" }}>
        <div className="panel-head">
          <div>
            <h2>Configured System Roles</h2>
            <p>Access privileges defined in ASP.NET Core Identity</p>
          </div>
        </div>
        <div className="roles-tags-list">
          {roles.map((r) => (
            <div key={r.id} className="role-tag-card">
              <Shield size={16} />
              <b>{r.name}</b>
            </div>
          ))}
          {roles.length === 0 && (
            <span className="text-muted">Standard roles: Admin, StoreManager, Pharmacist</span>
          )}
        </div>
      </section>

      {/* Create User Modal */}
      {createUserModal && (
        <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && setCreateUserModal(false)}>
          <div className="record-modal">
            <div className="modal-head">
              <div>
                <span className="eyebrow">NEW PERSONNEL</span>
                <h2>Create Pharmacy User</h2>
              </div>
              <button className="icon-btn" onClick={() => setCreateUserModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateUser}>
              <div className="form-grid">
                <label className="form-field">
                  <span>Full Name *</span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Haris Naveed"
                    value={userForm.fullName}
                    onChange={(e) => setUserForm({ ...userForm, fullName: e.target.value })}
                  />
                </label>

                <label className="form-field">
                  <span>Official Email *</span>
                  <input
                    type="email"
                    required
                    placeholder="e.g. haris@pharmacy.com"
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  />
                </label>

                <label className="form-field">
                  <span>Initial Password * (min 6 chars)</span>
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="••••••••"
                    value={userForm.password}
                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  />
                </label>

                <label className="form-field">
                  <span>Contact Phone</span>
                  <input
                    type="text"
                    placeholder="e.g. +92 300 1234567"
                    value={userForm.phoneNumber}
                    onChange={(e) => setUserForm({ ...userForm, phoneNumber: e.target.value })}
                  />
                </label>

                <label className="form-field" style={{ gridColumn: "1 / -1" }}>
                  <span>System Role *</span>
                  <select
                    required
                    value={userForm.role}
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                  >
                    <option value="Admin">Administrator (Full Control)</option>
                    <option value="StoreManager">Store Manager (Inventory & Purchases)</option>
                    <option value="Pharmacist">Pharmacist (Dispensation & Alerts)</option>
                    {roles
                      .filter((r) => !["Admin", "StoreManager", "Pharmacist"].includes(r.name))
                      .map((r) => (
                        <option key={r.id} value={r.name}>
                          {r.name}
                        </option>
                      ))}
                  </select>
                </label>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-light"
                  onClick={() => setCreateUserModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? "Creating..." : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Role Modal */}
      {assignRoleModal && (
        <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && setAssignRoleModal(null)}>
          <div className="record-modal">
            <div className="modal-head">
              <div>
                <span className="eyebrow">ACCESS PRIVILEGES</span>
                <h2>Assign Role to {assignRoleModal.fullName || assignRoleModal.email}</h2>
              </div>
              <button className="icon-btn" onClick={() => setAssignRoleModal(null)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAssignRole}>
              <div className="form-grid">
                <label className="form-field" style={{ gridColumn: "1 / -1" }}>
                  <span>Select New Role *</span>
                  <select
                    required
                    value={selectedNewRole}
                    onChange={(e) => setSelectedNewRole(e.target.value)}
                  >
                    <option value="Admin">Administrator</option>
                    <option value="StoreManager">Store Manager</option>
                    <option value="Pharmacist">Pharmacist</option>
                    {roles
                      .filter((r) => !["Admin", "StoreManager", "Pharmacist"].includes(r.name))
                      .map((r) => (
                        <option key={r.id} value={r.name}>
                          {r.name}
                        </option>
                      ))}
                  </select>
                </label>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-light"
                  onClick={() => setAssignRoleModal(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? "Assigning..." : "Update Role"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Role Modal */}
      {createRoleModal && (
        <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && setCreateRoleModal(false)}>
          <div className="record-modal">
            <div className="modal-head">
              <div>
                <span className="eyebrow">SECURITY ROLE</span>
                <h2>Create Custom Role</h2>
              </div>
              <button className="icon-btn" onClick={() => setCreateRoleModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateRole}>
              <div className="form-grid">
                <label className="form-field" style={{ gridColumn: "1 / -1" }}>
                  <span>Role Name *</span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Auditor"
                    value={roleForm.roleName}
                    onChange={(e) => setRoleForm({ roleName: e.target.value })}
                  />
                </label>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-light"
                  onClick={() => setCreateRoleModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Create Role"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
