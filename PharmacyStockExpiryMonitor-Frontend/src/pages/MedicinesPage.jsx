import React, { useEffect, useState } from "react";
import {
  getMedicinesApi,
  createMedicineApi,
  updateMedicineApi,
  deleteMedicineApi,
  getCategoriesApi,
  getErrorMessage
} from "../services/api";
import Pagination from "../components/Pagination";
import "../styles/Medicines.css";

export default function MedicinesPage() {
  const [medicines, setMedicines] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Pagination, Search, and Filters
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(""); // "" | "true" | "false"
  const [categoryFilter, setCategoryFilter] = useState("");

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    medicineCode: "",
    name: "",
    genericName: "",
    description: "",
    categoryId: "",
    reorderLevel: 20,
    isActive: true
  });

  const loadCategories = async () => {
    try {
      const res = await getCategoriesApi({ page: 1, pageSize: 100 });
      setCategories(res.data.items || res.data || []);
    } catch {
      // Ignore if category fetch fails
    }
  };

  const loadMedicines = async () => {
    setLoading(true);
    setError("");
    try {
      const params = {
        page,
        pageSize,
        search: search.trim() || undefined,
        isActive: statusFilter !== "" ? statusFilter === "true" : undefined,
        categoryId: categoryFilter ? Number(categoryFilter) : undefined
      };
      const res = await getMedicinesApi(params);
      setMedicines(res.data.items || []);
      setTotalPages(res.data.totalPages || 1);
      setTotalCount(res.data.totalCount ?? res.data.totalItems ?? ((res.data.totalPages || 1) * pageSize));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadMedicines();
  }, [page, pageSize, search, statusFilter, categoryFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadMedicines();
  };

  const handleResetForm = () => {
    setFormData({
      medicineCode: "",
      name: "",
      genericName: "",
      description: "",
      categoryId: categories[0]?.id || "",
      reorderLevel: 20,
      isActive: true
    });
    setEditId(null);
    setShowForm(false);
  };

  const handleOpenAdd = () => {
    setFormData({
      medicineCode: `MED-${Math.floor(100 + Math.random() * 900)}`,
      name: "",
      genericName: "",
      description: "",
      categoryId: categories[0]?.id || "",
      reorderLevel: 20,
      isActive: true
    });
    setEditId(null);
    setShowForm(true);
    setError("");
    setSuccess("");
  };

  const handleOpenEdit = (item) => {
    setFormData({
      medicineCode: item.medicineCode,
      name: item.name,
      genericName: item.genericName || "",
      description: item.description || "",
      categoryId: item.categoryId,
      reorderLevel: item.reorderLevel,
      isActive: item.isActive
    });
    setEditId(item.id);
    setShowForm(true);
    setError("");
    setSuccess("");
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.name || !formData.medicineCode || !formData.categoryId) {
      setError("Please fill in Medicine Code, Name, and Category.");
      return;
    }

    try {
      if (editId) {
        await updateMedicineApi(editId, {
          ...formData,
          categoryId: Number(formData.categoryId),
          reorderLevel: Number(formData.reorderLevel)
        });
        setSuccess("Medicine updated successfully.");
      } else {
        await createMedicineApi({
          medicineCode: formData.medicineCode,
          name: formData.name,
          genericName: formData.genericName,
          description: formData.description,
          categoryId: Number(formData.categoryId),
          reorderLevel: Number(formData.reorderLevel)
        });
        setSuccess("Medicine added successfully.");
      }
      handleResetForm();
      loadMedicines();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this medicine?")) {
      return;
    }
    setError("");
    setSuccess("");
    try {
      await deleteMedicineApi(id);
      setSuccess("Medicine deleted successfully.");
      loadMedicines();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="container">
      <h1>Medicine Management</h1>

      {error && <div className="message-error">{error}</div>}
      {success && <div className="message-success">{success}</div>}

      <div className="top-action-bar">
        <form onSubmit={handleSearchSubmit} className="search-box">
          <input
            type="text"
            placeholder="Search by name or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* Active / Inactive Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            style={{ padding: "6px 8px", border: "1px solid #ccc", borderRadius: "3px" }}
          >
            <option value="">All Statuses</option>
            <option value="true">Active Only</option>
            <option value="false">Inactive Only</option>
          </select>

          {/* Category Dropdown Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            style={{ padding: "6px 8px", border: "1px solid #ccc", borderRadius: "3px" }}
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <button type="submit" className="btn-secondary">
            Filter
          </button>
          {(search || statusFilter || categoryFilter) && (
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setSearch("");
                setStatusFilter("");
                setCategoryFilter("");
                setPage(1);
              }}
            >
              Reset
            </button>
          )}
        </form>

        <button className="btn-primary" onClick={handleOpenAdd}>
          {showForm && !editId ? "Close Form" : "+ Add New Medicine"}
        </button>
      </div>

      {/* Add / Edit Form */}
      {showForm && (
        <form className="simple-form" onSubmit={handleFormSubmit}>
          <h3>{editId ? "Edit Medicine" : "Add New Medicine"}</h3>

          <div className="form-row">
            <div className="form-group">
              <label>Medicine Code *</label>
              <input
                type="text"
                value={formData.medicineCode}
                onChange={(e) =>
                  setFormData({ ...formData, medicineCode: e.target.value })
                }
                required
              />
            </div>
            <div className="form-group">
              <label>Medicine Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Generic Name</label>
              <input
                type="text"
                value={formData.genericName}
                onChange={(e) =>
                  setFormData({ ...formData, genericName: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label>Category *</label>
              <select
                value={formData.categoryId}
                onChange={(e) =>
                  setFormData({ ...formData, categoryId: e.target.value })
                }
                required
              >
                <option value="">-- Select Category --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Reorder Safety Threshold (Min Stock)</label>
              <input
                type="number"
                min="0"
                value={formData.reorderLevel}
                onChange={(e) =>
                  setFormData({ ...formData, reorderLevel: e.target.value })
                }
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
                Active Medicine
              </label>
            </div>
          )}

          <div style={{ marginTop: "10px" }}>
            <button type="submit" className="btn-primary" style={{ marginRight: "10px" }}>
              {editId ? "Update Medicine" : "Save Medicine"}
            </button>
            <button type="button" className="btn-secondary" onClick={handleResetForm}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Medicines Table */}
      {loading ? (
        <p>Loading medicines...</p>
      ) : (
        <div className="table-container">
          <table className="simple-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Code</th>
                <th>Name</th>
                <th>Generic Name</th>
                <th>Category</th>
                <th>Current Stock</th>
                <th>Reorder Level</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {medicines.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: "center" }}>
                    No medicines found.
                  </td>
                </tr>
              ) : (
                medicines.map((med) => {
                  const isLow = Number(med.currentStock) <= Number(med.reorderLevel);
                  return (
                    <tr key={med.id}>
                      <td>{med.id}</td>
                      <td>{med.medicineCode}</td>
                      <td>
                        <strong>{med.name}</strong>
                      </td>
                      <td>{med.genericName || "-"}</td>
                      <td>{med.categoryName || med.categoryId}</td>
                      <td className={isLow ? "stock-low" : "stock-normal"}>
                        {med.currentStock} {isLow && "(Low Stock)"}
                      </td>
                      <td>{med.reorderLevel}</td>
                      <td>
                        {med.isActive ? (
                          <span style={{ color: "green", fontWeight: "bold" }}>Active</span>
                        ) : (
                          <span style={{ color: "gray", fontWeight: "bold" }}>Inactive</span>
                        )}
                      </td>
                      <td>
                        <button
                          className="btn-secondary btn-small"
                          onClick={() => handleOpenEdit(med)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn-danger btn-small"
                          onClick={() => handleDelete(med.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <Pagination
            page={page}
            pageSize={pageSize}
            totalCount={totalCount || totalPages * pageSize}
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
