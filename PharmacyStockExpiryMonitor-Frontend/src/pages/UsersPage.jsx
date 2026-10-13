import React, { useEffect, useState } from "react";
import {
  getUsersApi,
  createUserApi,
  assignUserRoleApi,
  deleteUserApi,
  getRolesApi,
  createRoleApi,
  deleteRoleApi,
  getErrorMessage
} from "../services/api";
import Pagination from "../components/Pagination";
import "../styles/Users.css";

export default function UsersPage({ currentUser }) {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  // Filters
  const [statusFilter, setStatusFilter] = useState(""); // "" | "true" | "false"
  const [roleFilter, setRoleFilter] = useState("");

  // Modals / Form toggles
  const [showAddUser, setShowAddUser] = useState(false);
  const [showAddRole, setShowAddRole] = useState(false);
  const [assignRoleUserId, setAssignRoleUserId] = useState(null);
  const [newRoleForUser, setNewRoleForUser] = useState("StoreManager");

  const [newUser, setNewUser] = useState({
    fullName: "",
    email: "",
    password: "",
    phoneNumber: "",
    role: "Pharmacist"
  });

  const [newRoleName, setNewRoleName] = useState("");

  const isAdmin = currentUser?.role?.toLowerCase() === "admin";

  const loadData = async () => {
    if (!isAdmin) return;
    setLoading(true);
    setError("");
    try {
      const [userRes, roleRes] = await Promise.all([
        getUsersApi(),
        getRolesApi()
      ]);
      setUsers(userRes.data || []);
      setRoles(roleRes.data || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="container">
        <h1>Access Restricted</h1>
        <div className="message-error">
          You do not have permission to view User Management. Only Administrators can access this page.
        </div>
      </div>
    );
  }

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUser.fullName || !newUser.email || !newUser.password) {
      setError("Please fill in Full Name, Email, and Password.");
      return;
    }

    try {
      await createUserApi(newUser);
      setSuccess("User created successfully.");
      setShowAddUser(false);
      setNewUser({
        fullName: "",
        email: "",
        password: "",
        phoneNumber: "",
        role: "Pharmacist"
      });
      loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleAssignRole = async (userId) => {
    try {
      await assignUserRoleApi(userId, { role: newRoleForUser });
      setSuccess("Role assigned successfully.");
      setAssignRoleUserId(null);
      loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await deleteUserApi(id);
      setSuccess("User deleted successfully.");
      loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleCreateRole = async (e) => {
    e.preventDefault();
    if (!newRoleName) return;
    try {
      await createRoleApi({ name: newRoleName });
      setSuccess("Role created successfully.");
      setShowAddRole(false);
      setNewRoleName("");
      loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleDeleteRole = async (roleId) => {
    if (!window.confirm("Are you sure you want to delete this role?")) return;
    try {
      await deleteRoleApi(roleId);
      setSuccess("Role deleted successfully.");
      loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  // Filter users by Active/Inactive status and role
  const filteredUsers = users.filter((u) => {
    if (statusFilter === "true" && !u.isActive) return false;
    if (statusFilter === "false" && u.isActive) return false;
    if (roleFilter && u.role?.toLowerCase() !== roleFilter.toLowerCase()) return false;
    return true;
  });

  return (
    <div className="container">
      <h1>User & Security Management (Admin)</h1>

      {error && <div className="message-error">{error}</div>}
      {success && <div className="message-success">{success}</div>}

      <div className="users-top-bar">
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {/* Active / Inactive Dropdown Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: "6px 8px", border: "1px solid #ccc", borderRadius: "3px" }}
          >
            <option value="">All Statuses (Active & Inactive)</option>
            <option value="true">Active Users Only</option>
            <option value="false">Inactive Users Only</option>
          </select>

          {/* Role Dropdown Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{ padding: "6px 8px", border: "1px solid #ccc", borderRadius: "3px" }}
          >
            <option value="">All Roles</option>
            {roles.map((r) => (
              <option key={r.id} value={r.name}>
                {r.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <button
            className="btn-primary"
            style={{ marginRight: "10px" }}
            onClick={() => setShowAddUser(!showAddUser)}
          >
            {showAddUser ? "Close User Form" : "+ Add User"}
          </button>
          <button
            className="btn-secondary"
            onClick={() => setShowAddRole(!showAddRole)}
          >
            {showAddRole ? "Close Role Form" : "+ Add Role"}
          </button>
        </div>
      </div>

      {/* Add User Form */}
      {showAddUser && (
        <form className="simple-form" onSubmit={handleCreateUser}>
          <h3>Add New System User</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                value={newUser.fullName}
                onChange={(e) =>
                  setNewUser({ ...newUser, fullName: e.target.value })
                }
                required
              />
            </div>
            <div className="form-group">
              <label>Email Address *</label>
              <input
                type="email"
                value={newUser.email}
                onChange={(e) =>
                  setNewUser({ ...newUser, email: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Password (Min 6 chars) *</label>
              <input
                type="password"
                value={newUser.password}
                onChange={(e) =>
                  setNewUser({ ...newUser, password: e.target.value })
                }
                required
              />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="text"
                value={newUser.phoneNumber}
                onChange={(e) =>
                  setNewUser({ ...newUser, phoneNumber: e.target.value })
                }
              />
            </div>
          </div>

          <div className="form-group">
            <label>Assigned Role *</label>
            <select
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              required
            >
              {roles.map((r) => (
                <option key={r.id} value={r.name}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <button type="submit" className="btn-primary" style={{ marginRight: "10px" }}>
              Save User
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setShowAddUser(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Add Role Form */}
      {showAddRole && (
        <form className="simple-form" onSubmit={handleCreateRole}>
          <h3>Add New Role</h3>
          <div className="form-group">
            <label>Role Name *</label>
            <input
              type="text"
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              placeholder="e.g. Auditor"
              required
            />
          </div>
          <div>
            <button type="submit" className="btn-primary" style={{ marginRight: "10px" }}>
              Create Role
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setShowAddRole(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Roles List */}
      <h3>System Roles</h3>
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "20px" }}>
        {roles.map((r) => (
          <div
            key={r.id}
            style={{
              border: "1px solid #ddd",
              padding: "6px 10px",
              background: "#fafafa",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            <strong>{r.name}</strong>
            {r.name !== "Admin" && (
              <button
                className="btn-danger btn-small"
                style={{ padding: "1px 5px", fontSize: "10px" }}
                onClick={() => handleDeleteRole(r.id)}
              >
                x
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Users Table */}
      <h3>Registered Users ({filteredUsers.length})</h3>
      {loading ? (
        <p>Loading users...</p>
      ) : (
        <div className="table-container">
          <table className="simple-table">
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center" }}>
                    No users found matching the filter.
                  </td>
                </tr>
              ) : (
                filteredUsers
                  .slice((page - 1) * pageSize, page * pageSize)
                  .map((u) => (
                    <tr key={u.id}>
                      <td>
                        <strong>{u.fullName}</strong>
                      </td>
                      <td>{u.email}</td>
                      <td>{u.phoneNumber || "-"}</td>
                      <td>
                        <span className="role-tag">{u.role}</span>
                      </td>
                      <td>
                        {u.isActive ? (
                          <span style={{ color: "green", fontWeight: "bold" }}>Active</span>
                        ) : (
                          <span style={{ color: "gray", fontWeight: "bold" }}>Inactive</span>
                        )}
                      </td>
                      <td>
                        {assignRoleUserId === u.id ? (
                          <span style={{ display: "inline-flex", gap: "4px" }}>
                            <select
                              value={newRoleForUser}
                              onChange={(e) => setNewRoleForUser(e.target.value)}
                              style={{ padding: "2px" }}
                            >
                              {roles.map((r) => (
                                <option key={r.id} value={r.name}>
                                  {r.name}
                                </option>
                              ))}
                            </select>
                            <button
                              className="btn-success btn-small"
                              onClick={() => handleAssignRole(u.id)}
                            >
                              Save
                            </button>
                            <button
                              className="btn-secondary btn-small"
                              onClick={() => setAssignRoleUserId(null)}
                            >
                              X
                            </button>
                          </span>
                        ) : (
                          <button
                            className="btn-secondary btn-small"
                            onClick={() => {
                              setAssignRoleUserId(u.id);
                              setNewRoleForUser(u.role);
                            }}
                          >
                            Change Role
                          </button>
                        )}

                        <button
                          className="btn-danger btn-small"
                          onClick={() => handleDeleteUser(u.id)}
                          disabled={u.email === currentUser?.email}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <Pagination
            page={page}
            pageSize={pageSize}
            totalCount={filteredUsers.length}
            onPageChange={(p) => setPage(p)}
            onPageSizeChange={(sz) => {
              setPageSize(sz);
              setPage(1);
            }}
            pageSizeOptions={[5, 10, 25, 50]}
          />
        </div>
      )}
    </div>
  );
}
