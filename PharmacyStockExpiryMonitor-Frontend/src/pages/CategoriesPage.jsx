import React, { useEffect, useState } from "react";
import {
  Tags,
  Plus,
  Search,
  AlertTriangle,
  Edit2,
  Trash2,
  X,
  RefreshCw,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  errorMessage
} from "../api";
import Pagination from "../components/Pagination";

export default function CategoriesPage({ onSetToast }) {
  const [categories, setCategories] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modal, setModal] = useState(null); // { mode: 'create' | 'edit', item?: any }
  const [form, setForm] = useState({ name: "", isActive: true });
  const [saving, setSaving] = useState(false);

  async function loadCategories() {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString()
      });
      if (search.trim()) params.append("search", search.trim());
      if (selectedStatus !== "") params.append("isActive", selectedStatus);

      const res = await getCategories(params);
      setCategories(res.data);
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
  }, [page, search, selectedStatus]);

  function openCreate() {
    setForm({ name: "", isActive: true });
    setModal({ mode: "create" });
  }

  function openEdit(item) {
    setForm({ name: item.name || "", isActive: item.isActive !== false });
    setModal({ mode: "edit", item });
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      if (modal.mode === "edit") {
        await updateCategory(modal.item.id, {
          name: form.name.trim(),
          isActive: form.isActive
        });
        onSetToast(`Category '${form.name}' updated.`);
      } else {
        await createCategory({
          name: form.name.trim()
        });
        onSetToast(`Category '${form.name}' created.`);
      }
      setModal(null);
      loadCategories();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(item) {
    if (!window.confirm(`Delete category '${item.name}'?`)) return;
    try {
      await deleteCategory(item.id);
      onSetToast(`Category '${item.name}' deleted.`);
      loadCategories();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  return (
    <div className="page-content">
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            <span>CLASSIFICATION TAXONOMY</span>
            <span className="eyebrow-line" />
          </div>
          <h1>Medicine Categories</h1>
          <p>
            Structure medicines by therapeutic classification (Antibiotics, Analgesics, Cardiovascular, etc.).
          </p>
        </div>
        <div className="heading-actions">
          <button className="btn btn-light" onClick={loadCategories}>
            <RefreshCw size={15} /> Refresh
          </button>
          <button className="btn btn-primary" onClick={openCreate}>
            <Plus size={16} /> Add Category
          </button>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <AlertTriangle size={18} />
          <span>{error}</span>
          <button onClick={loadCategories}>Retry</button>
        </div>
      )}

      {/* Filter and Search */}
      <div className="filter-bar">
        <div className="search-input-wrap">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search category name..."
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
        </div>
      </div>

      {/* Table */}
      <section className="panel table-panel">
        <div className="panel-head">
          <div className="table-caption">
            Showing <b>{categories.length}</b> category groups
          </div>
        </div>

        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>CATEGORY NAME</th>
                <th>STATUS</th>
                <th className="text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id}>
                  <td>
                    <span className="code-badge">#{c.id}</span>
                  </td>
                  <td>
                    <b>{c.name}</b>
                  </td>
                  <td>
                    <span className={`status-pill ${c.isActive ? "good" : "muted"}`}>
                      <i /> {c.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="text-right">
                    <div className="action-buttons-group">
                      <button
                        className="icon-btn edit-btn"
                        title="Edit Category"
                        onClick={() => openEdit(c)}
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        className="icon-btn delete-btn"
                        title="Delete Category"
                        onClick={() => handleDelete(c)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && !loading && (
                <tr>
                  <td colSpan={4} className="empty-table-cell">
                    <Tags size={32} />
                    <p>No categories found.</p>
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

      {/* Modal */}
      {modal && (
        <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && setModal(null)}>
          <div className="record-modal">
            <div className="modal-head">
              <div>
                <span className="eyebrow">TAXONOMY</span>
                <h2>{modal.mode === "edit" ? "Edit Category" : "Add Category"}</h2>
              </div>
              <button className="icon-btn" onClick={() => setModal(null)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="form-grid">
                <label className="form-field" style={{ gridColumn: "1 / -1" }}>
                  <span>Category Name *</span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Antibiotics"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </label>

                {modal.mode === "edit" && (
                  <label className="check-field" style={{ gridColumn: "1 / -1" }}>
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    />
                    <span>Active Category</span>
                  </label>
                )}
              </div>

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
                  {saving ? "Saving..." : "Save Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
