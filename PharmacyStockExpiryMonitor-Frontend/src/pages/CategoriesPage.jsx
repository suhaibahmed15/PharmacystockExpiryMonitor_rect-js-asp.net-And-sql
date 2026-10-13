import React, { useEffect, useState } from "react";
import {
  getCategoriesApi,
  createCategoryApi,
  updateCategoryApi,
  deleteCategoryApi,
  getErrorMessage
} from "../services/api";
import Pagination from "../components/Pagination";
import "../styles/Categories.css";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
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
    description: "",
    isActive: true
  });

  const loadCategories = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getCategoriesApi({
        page: 1,
        pageSize: 100,
        search: search.trim() || undefined,
        isActive: statusFilter !== "" ? statusFilter === "true" : undefined
      });
      setCategories(res.data.items || res.data || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, [search, statusFilter]);

  const handleOpenAdd = () => {
    setFormData({ name: "", description: "", isActive: true });
    setEditId(null);
    setShowForm(true);
    setError("");
    setSuccess("");
  };

  const handleOpenEdit = (item) => {
    setFormData({
      name: item.name,
      description: item.description || "",
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
      setError("Category Name is required.");
      return;
    }

    try {
      if (editId) {
        await updateCategoryApi(editId, formData);
        setSuccess("Category updated successfully.");
      } else {
        await createCategoryApi({
          name: formData.name,
          description: formData.description
        });
        setSuccess("Category created successfully.");
      }
      setShowForm(false);
      setEditId(null);
      loadCategories();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    setError("");
    setSuccess("");
    try {
      await deleteCategoryApi(id);
      setSuccess("Category deleted successfully.");
      loadCategories();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="container">
      <h1>Category Management</h1>

      {error && <div className="message-error">{error}</div>}
      {success && <div className="message-success">{success}</div>}

      <div className="category-top-bar">
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <input
            type="text"
            placeholder="Search category name..."
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
          {showForm && !editId ? "Close Form" : "+ Add Category"}
        </button>
      </div>

      {showForm && (
        <form className="simple-form" onSubmit={handleFormSubmit}>
          <h3>{editId ? "Edit Category" : "Add New Category"}</h3>
          <div className="form-group">
            <label>Category Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
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
              {editId ? "Update" : "Save"}
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
        <p>Loading categories...</p>
      ) : (
        <div className="table-container">
          <table className="simple-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Description</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center" }}>
                    No categories found.
                  </td>
                </tr>
              ) : (
                categories
                  .slice((page - 1) * pageSize, page * pageSize)
                  .map((c) => (
                    <tr key={c.id}>
                      <td>{c.id}</td>
                      <td>
                        <strong>{c.name}</strong>
                      </td>
                      <td>{c.description || "-"}</td>
                      <td>
                        {c.isActive ? (
                          <span style={{ color: "green", fontWeight: "bold" }}>Active</span>
                        ) : (
                          <span style={{ color: "gray", fontWeight: "bold" }}>Inactive</span>
                        )}
                      </td>
                      <td>
                        <button
                          className="btn-secondary btn-small"
                          onClick={() => handleOpenEdit(c)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn-danger btn-small"
                          onClick={() => handleDelete(c.id)}
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
            totalCount={categories.length}
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
