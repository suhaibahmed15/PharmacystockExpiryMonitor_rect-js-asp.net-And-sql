import React, { useEffect, useState } from "react";
import {
  getSuppliersApi,
  createSupplierApi,
  updateSupplierApi,
  deleteSupplierApi,
  getErrorMessage
} from "../services/api";
import Pagination from "../components/Pagination";
import "../styles/Suppliers.css";

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(""); // "" | "true" | "false"
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    contactPerson: "",
    phone: "",
    email: "",
    address: "",
    isActive: true
  });

  const loadSuppliers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getSuppliersApi({
        page: 1,
        pageSize: 100,
        search: search.trim() || undefined,
        isActive: statusFilter !== "" ? statusFilter === "true" : undefined
      });
      setSuppliers(res.data.items || res.data || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, [search, statusFilter]);

  const handleOpenAdd = () => {
    setFormData({
      name: "",
      contactPerson: "",
      phone: "",
      email: "",
      address: "",
      isActive: true
    });
    setEditId(null);
    setShowForm(true);
    setError("");
    setSuccess("");
  };

  const handleOpenEdit = (item) => {
    setFormData({
      name: item.name,
      contactPerson: item.contactPerson || "",
      phone: item.phone || "",
      email: item.email || "",
      address: item.address || "",
      isActive: item.isActive
    });
    setEditId(item.id);
    setShowForm(true);
    setError("");
    setSuccess("");
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      setError("Supplier Name is required.");
      return;
    }

    try {
      if (editId) {
        await updateSupplierApi(editId, formData);
        setSuccess("Supplier updated successfully.");
      } else {
        await createSupplierApi({
          name: formData.name,
          contactPerson: formData.contactPerson,
          phone: formData.phone,
          email: formData.email,
          address: formData.address
        });
        setSuccess("Supplier added successfully.");
      }
      setShowForm(false);
      setEditId(null);
      loadSuppliers();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this supplier?")) return;
    setError("");
    setSuccess("");
    try {
      await deleteSupplierApi(id);
      setSuccess("Supplier deleted successfully.");
      loadSuppliers();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="container">
      <h1>Supplier Management</h1>

      {error && <div className="message-error">{error}</div>}
      {success && <div className="message-success">{success}</div>}

      <div className="supplier-top-bar">
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <input
            type="text"
            placeholder="Search supplier name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ padding: "6px 8px", width: "220px", border: "1px solid #ccc" }}
          />

          {/* Active / Inactive Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: "6px 8px", border: "1px solid #ccc", borderRadius: "3px" }}
          >
            <option value="">All Statuses</option>
            <option value="true">Active Only</option>
            <option value="false">Inactive Only</option>
          </select>
        </div>

        <button className="btn-primary" onClick={handleOpenAdd}>
          {showForm && !editId ? "Close Form" : "+ Add Supplier"}
        </button>
      </div>

      {showForm && (
        <form className="simple-form" onSubmit={handleFormSubmit}>
          <h3>{editId ? "Edit Supplier" : "Add New Supplier"}</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Supplier Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Contact Person</label>
              <input
                type="text"
                value={formData.contactPerson}
                onChange={(e) =>
                  setFormData({ ...formData, contactPerson: e.target.value })
                }
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          {editId && (
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  style={{ width: "auto", marginRight: "8px" }}
                />
                Active
              </label>
            </div>
          )}

          <div>
            <button type="submit" className="btn-primary" style={{ marginRight: "10px" }}>
              {editId ? "Update Supplier" : "Save Supplier"}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p>Loading suppliers...</p>
      ) : (
        <div className="table-container">
          <table className="simple-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Supplier Name</th>
                <th>Contact Person</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Address</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center" }}>
                    No suppliers found.
                  </td>
                </tr>
              ) : (
                suppliers
                  .slice((page - 1) * pageSize, page * pageSize)
                  .map((s) => (
                    <tr key={s.id}>
                      <td>{s.id}</td>
                      <td>
                        <strong>{s.name}</strong>
                      </td>
                      <td>{s.contactPerson || "-"}</td>
                      <td>{s.phone || "-"}</td>
                      <td>{s.email || "-"}</td>
                      <td>{s.address || "-"}</td>
                      <td>
                        {s.isActive ? (
                          <span style={{ color: "green", fontWeight: "bold" }}>Active</span>
                        ) : (
                          <span style={{ color: "gray", fontWeight: "bold" }}>Inactive</span>
                        )}
                      </td>
                      <td>
                        <button
                          className="btn-secondary btn-small"
                          onClick={() => handleOpenEdit(s)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn-danger btn-small"
                          onClick={() => handleDelete(s.id)}
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
            totalCount={suppliers.length}
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
