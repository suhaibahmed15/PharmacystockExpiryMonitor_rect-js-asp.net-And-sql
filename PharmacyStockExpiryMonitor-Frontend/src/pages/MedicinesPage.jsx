import React, { useEffect, useState } from "react";
import {
  Pill,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  Edit2,
  Trash2,
  X,
  Boxes,
  CheckCircle,
  XCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  getMedicines,
  createMedicine,
  updateMedicine,
  deleteMedicine,
  getCategories,
  errorMessage
} from "../api";
import Pagination from "../components/Pagination";

export default function MedicinesPage({ onSetToast }) {
  const navigate = useNavigate();
  const [medicines, setMedicines] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modal, setModal] = useState(null); // { mode: 'create' | 'edit', item?: any }
  const [form, setForm] = useState({
    medicineCode: "",
    name: "",
    genericName: "",
    description: "",
    categoryId: "",
    reorderLevel: 20,
    isActive: true
  });
  const [saving, setSaving] = useState(false);

  // Load Categories for dropdown
  async function loadCategories() {
    try {
      const res = await getCategories({ page: 1, pageSize: 100 });
      setCategories(res.data);
    } catch (e) {
      console.error("Could not load categories", e);
    }
  }

  // Load Medicines
  async function loadMedicines() {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        sortBy,
        sortDirection
      });

      if (search.trim()) params.append("search", search.trim());
      if (selectedCategory) params.append("categoryId", selectedCategory);
      if (selectedStatus !== "") params.append("isActive", selectedStatus);

      const res = await getMedicines(params);
      setMedicines(res.data);
      setTotalCount(res.raw.data?.totalCount ?? res.data.length);
      setTotalPages(res.raw.data?.totalPages ?? Math.ceil((res.raw.data?.totalCount || 1) / pageSize));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadMedicines();
  }, [page, search, selectedCategory, selectedStatus, sortBy, sortDirection]);

  function openCreate() {
    setForm({
      medicineCode: `MED-0${Math.floor(100 + Math.random() * 900)}`,
      name: "",
      genericName: "",
      description: "",
      categoryId: categories[0]?.id?.toString() || "",
      reorderLevel: 20,
      isActive: true
    });
    setModal({ mode: "create" });
  }

  function openEdit(item) {
    setForm({
      medicineCode: item.medicineCode || "",
      name: item.name || "",
      genericName: item.genericName || "",
      description: item.description || "",
      categoryId: item.categoryId?.toString() || "",
      reorderLevel: item.reorderLevel || 20,
      isActive: item.isActive !== false
    });
    setModal({ mode: "edit", item });
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.categoryId) {
      onSetToast("Please select a Category.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        medicineCode: form.medicineCode.trim(),
        name: form.name.trim(),
        genericName: form.genericName.trim() || null,
        description: form.description.trim() || null,
        categoryId: parseInt(form.categoryId, 10),
        reorderLevel: parseInt(form.reorderLevel, 10) || 0
      };

      if (modal.mode === "edit") {
        payload.isActive = form.isActive;
        await updateMedicine(modal.item.id, payload);
        onSetToast(`Medicine '${form.name}' updated successfully.`);
      } else {
        await createMedicine(payload);
        onSetToast(`Medicine '${form.name}' created successfully.`);
      }
      setModal(null);
      loadMedicines();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(item) {
    if (!window.confirm(`Are you sure you want to delete '${item.name}'?`)) return;
    try {
      await deleteMedicine(item.id);
      onSetToast(`Medicine '${item.name}' deleted.`);
      loadMedicines();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  return (
    <div className="page-content">
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            <span>CATALOGUE DIRECTORY</span>
            <span className="eyebrow-line" />
          </div>
          <h1>Medicine Inventory</h1>
          <p>
            Manage pharmacy catalogue, active pharmaceutical formulations, classification, and safety reorder thresholds.
          </p>
        </div>
        <div className="heading-actions">
          <button className="btn btn-light" onClick={loadMedicines}>
            <RefreshCw size={15} /> Refresh
          </button>
          <button className="btn btn-primary" onClick={openCreate}>
            <Plus size={16} /> Add Medicine
          </button>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <AlertTriangle size={18} />
          <span>{error}</span>
          <button onClick={loadMedicines}>Retry</button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="filter-bar">
        <div className="search-input-wrap">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search medicine name, generic formula or code..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
          {search && (
            <button className="clear-btn" onClick={() => setSearch("")}>
              <X size={14} />
            </button>
          )}
        </div>

        <div className="filter-group">
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Statuses</option>
            <option value="true">Active Only</option>
            <option value="false">Inactive Only</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setPage(1);
            }}
          >
            <option value="name">Sort by Name</option>
            <option value="medicineCode">Sort by Code</option>
            <option value="reorderLevel">Sort by Reorder Level</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <section className="panel table-panel">
        <div className="panel-head">
          <div className="table-caption">
            <b>{totalCount}</b> registered medicine records found
          </div>
        </div>

        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>CODE</th>
                <th>MEDICINE & FORMULA</th>
                <th>CATEGORY</th>
                <th>CURRENT STOCK</th>
                <th>REORDER LVL</th>
                <th>STATUS</th>
                <th className="text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {medicines.map((m) => {
                const isLow = Number(m.currentStock || 0) <= Number(m.reorderLevel || 0);
                return (
                  <tr key={m.id}>
                    <td>
                      <span className="code-badge">{m.medicineCode}</span>
                    </td>
                    <td>
                      <div className="item-primary-text">{m.name}</div>
                      {m.genericName && (
                        <div className="item-sub-text">{m.genericName}</div>
                      )}
                    </td>
                    <td>
                      <span className="category-tag">{m.categoryName || "General"}</span>
                    </td>
                    <td>
                      <span className={`stock-number ${isLow ? "text-danger font-bold" : ""}`}>
                        {m.currentStock || 0}
                      </span>{" "}
                      units
                      {isLow && <span className="low-tag">Low</span>}
                    </td>
                    <td>{m.reorderLevel} units</td>
                    <td>
                      <span
                        className={`status-pill ${m.isActive ? "good" : "muted"}`}
                      >
                        <i />
                        {m.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="action-buttons-group">
                        <button
                          className="icon-btn edit-btn"
                          title="Edit Medicine"
                          onClick={() => openEdit(m)}
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          className="icon-btn delete-btn"
                          title="Delete Medicine"
                          onClick={() => handleDelete(m)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {medicines.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="empty-table-cell">
                    <Pill size={32} />
                    <p>No medicines matched your query or filters.</p>
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
          totalCount={totalCount}
          onPageChange={setPage}
        />
      </section>

      {/* Modal: Create / Edit Medicine */}
      {modal && (
        <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && setModal(null)}>
          <div className="record-modal">
            <div className="modal-head">
              <div>
                <span className="eyebrow">MEDICINE CATALOGUE</span>
                <h2>{modal.mode === "edit" ? "Edit Medicine" : "Add New Medicine"}</h2>
              </div>
              <button className="icon-btn" onClick={() => setModal(null)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="form-grid">
                <label className="form-field">
                  <span>Medicine Code *</span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MED-010"
                    value={form.medicineCode}
                    onChange={(e) => setForm({ ...form, medicineCode: e.target.value })}
                  />
                </label>

                <label className="form-field">
                  <span>Medicine Name *</span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Amoxicillin 500mg"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </label>

                <label className="form-field">
                  <span>Generic Formulation</span>
                  <input
                    type="text"
                    placeholder="e.g. Amoxicillin Trihydrate"
                    value={form.genericName}
                    onChange={(e) => setForm({ ...form, genericName: e.target.value })}
                  />
                </label>

                <label className="form-field">
                  <span>Category *</span>
                  <select
                    required
                    value={form.categoryId}
                    onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="form-field">
                  <span>Reorder Alert Level *</span>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="e.g. 20"
                    value={form.reorderLevel}
                    onChange={(e) => setForm({ ...form, reorderLevel: e.target.value })}
                  />
                </label>

                {modal.mode === "edit" && (
                  <label className="check-field" style={{ alignSelf: "center", marginTop: "22px" }}>
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    />
                    <span>Active in Pharmacy System</span>
                  </label>
                )}
              </div>

              <label className="form-field" style={{ marginTop: "14px" }}>
                <span>Therapeutic Description / Usage Notes</span>
                <textarea
                  rows={3}
                  placeholder="e.g. Broad spectrum antibiotic used for respiratory and urinary tract bacterial infections."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </label>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-light"
                  onClick={() => setModal(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? "Saving..." : modal.mode === "edit" ? "Save Changes" : "Create Medicine"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
