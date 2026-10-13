import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import userApi from "../../api/userApi";
import roleApi from "../../api/roleApi";
import { getErrorMessage } from "../../api/axiosClient";
import useAuth from "../../hooks/useAuth";
import DataTable from "../../components/common/DataTable";
import StatusBadge from "../../components/common/StatusBadge";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import Modal from "../../components/common/Modal";
import UserForm from "./UserForm";

export default function UserListPage() {
  const { user: currentUser, isAdmin } = useAuth();

  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [assignRoleTarget, setAssignRoleTarget] = useState(null);
  const [selectedRole, setSelectedRole] = useState("");
  const [assigningRole, setAssigningRole] = useState(false);

  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadData = async () => {
    if (!isAdmin) return;
    setLoading(true);
    setError("");
    try {
      const [userRes, roleRes] = await Promise.all([
        userApi.getAll(),
        roleApi.getAll()
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

  const handleAssignRoleSubmit = async () => {
    if (!assignRoleTarget || !selectedRole) return;
    setAssigningRole(true);
    setError("");
    setSuccess("");
    try {
      await userApi.assignRole(assignRoleTarget.id, { role: selectedRole });
      setSuccess(`Role updated to ${selectedRole} successfully.`);
      setAssignRoleTarget(null);
      loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setAssigningRole(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;
    setDeleting(true);
    setError("");
    try {
      await userApi.delete(deleteTargetId);
      setSuccess("User account deleted successfully.");
      setDeleteTargetId(null);
      loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    if (statusFilter === "true" && !u.isActive) return false;
    if (statusFilter === "false" && u.isActive) return false;
    if (roleFilter && u.role?.toLowerCase() !== roleFilter.toLowerCase()) return false;
    return true;
  });

  const columns = [
    { key: "id", header: "ID", width: "60px" },
    {
      key: "fullName",
      header: "Staff Full Name",
      render: (row) => <strong>{row.fullName}</strong>
    },
    { key: "email", header: "Email Address" },
    { key: "phoneNumber", header: "Phone", render: (row) => row.phoneNumber || "-" },
    {
      key: "role",
      header: "Role",
      render: (row) => (
        <span className="role-tag" style={{ textTransform: "capitalize" }}>
          {row.role}
        </span>
      )
    },
    {
      key: "isActive",
      header: "Status",
      render: (row) => (
        <StatusBadge
          status={row.isActive}
          label={row.isActive ? "Active" : "Inactive"}
        />
      )
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) => {
        const isSelf = row.email === currentUser?.email;
        return (
          <div className="table-actions">
            <button
              type="button"
              className="btn-secondary btn-small"
              onClick={() => {
                setAssignRoleTarget(row);
                setSelectedRole(row.role);
              }}
            >
              Change Role
            </button>
            <button
              type="button"
              className="btn-danger btn-small"
              disabled={isSelf}
              title={isSelf ? "Cannot delete your own active account" : "Delete user"}
              onClick={() => setDeleteTargetId(row.id)}
            >
              Delete
            </button>
          </div>
        );
      }
    }
  ];

  const pagedData = filteredUsers.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h1>User &amp; Security Management</h1>
          <p className="page-subtitle">
            Administered staff user accounts, credential provisioning, and authorization privileges.
          </p>
        </div>
        <div className="page-header-actions">
          <button
            type="button"
            className="btn-primary"
            onClick={() => setIsAddModalOpen(true)}
          >
            + Add New User
          </button>
          <Link to="/roles" className="btn-secondary">
            Manage Roles &rarr;
          </Link>
        </div>
      </div>

      {error && <div className="message-error">{error}</div>}
      {success && <div className="message-success">{success}</div>}

      <div className="top-action-bar">
        <div className="search-box">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="filter-select"
          >
            <option value="">All Statuses (Active &amp; Inactive)</option>
            <option value="true">Active Staff Only</option>
            <option value="false">Inactive Staff Only</option>
          </select>

          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="filter-select"
          >
            <option value="">All Roles</option>
            {roles.map((r) => (
              <option key={r.id} value={r.name}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={pagedData}
        loading={loading}
        emptyMessage="No user accounts found matching current filter."
        pagination={{
          page,
          pageSize,
          totalCount: filteredUsers.length,
          onPageChange: (p) => setPage(p),
          onPageSizeChange: (sz) => {
            setPageSize(sz);
            setPage(1);
          }
        }}
      />

      {/* Add User Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Create New System User"
        maxWidth="600px"
      >
        <UserForm
          onSuccess={() => {
            setIsAddModalOpen(false);
            setSuccess("User created successfully.");
            loadData();
          }}
          onCancel={() => setIsAddModalOpen(false)}
        />
      </Modal>

      {/* Change Role Modal */}
      <Modal
        isOpen={Boolean(assignRoleTarget)}
        onClose={() => setAssignRoleTarget(null)}
        title={`Change Role: ${assignRoleTarget?.fullName}`}
        maxWidth="460px"
      >
        <div>
          <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "14px" }}>
            Select a new authorization role for <strong>{assignRoleTarget?.email}</strong>:
          </p>
          <div className="form-group">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="form-control"
            >
              {roles.map((r) => (
                <option key={r.id} value={r.name}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-actions" style={{ marginTop: "16px" }}>
            <button
              type="button"
              className="btn-primary"
              onClick={handleAssignRoleSubmit}
              disabled={assigningRole}
            >
              {assigningRole ? "Updating..." : "Save Assigned Role"}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setAssignRoleTarget(null)}
              disabled={assigningRole}
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete User Confirm */}
      <ConfirmDialog
        isOpen={Boolean(deleteTargetId)}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete User Account"
        message="Are you sure you want to delete this staff user account? They will lose access immediately."
        confirmText="Yes, Delete User"
        loading={deleting}
      />
    </div>
  );
}
