import React, { useEffect, useState } from "react";
import {
  Truck,
  Plus,
  Search,
  AlertTriangle,
  Edit2,
  Trash2,
  X,
  RefreshCw,
  Phone,
  Mail,
  MapPin,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  errorMessage
} from "../api";
import Pagination from "../components/Pagination";

export default function SuppliersPage({ onSetToast }) {
  const [suppliers, setSuppliers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modal, setModal] = useState(null); // { mode: 'create' | 'edit', item?: any }
  const [form, setForm] = useState({
    name: "",
    contactPerson: "",
    phone: "",
    email: "",
    address: "",
    isActive: true
  });
  const [saving, setSaving] = useState(false);

  async function loadSuppliers() {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString()
      });
      if (search.trim()) params.append("search", search.trim());
      if (selectedStatus !== "") params.append("isActive", selectedStatus);

      const res = await getSuppliers(params);
      setSuppliers(res.data);
      setTotalCount(res.raw.data?.totalCount ?? res.data.length);
      setTotalPages(res.raw.data?.totalPages ?? Math.ceil((res.raw.data?.totalCount || 1) / pageSize));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSuppliers();
  }, [page, search, selectedStatus]);

  function openCreate() {
    setForm({
      name: "",
      contactPerson: "",
      phone: "",
      email: "",
      address: "",
      isActive: true
    });
    setModal({ mode: "create" });
  }

  function openEdit(item) {
    setForm({
      name: item.name || "",
      contactPerson: item.contactPerson || "",
      phone: item.phone || "",
      email: item.email || "",
      address: item.address || "",
      isActive: item.isActive !== false
    });
    setModal({ mode: "edit", item });
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        contactPerson: form.contactPerson.trim() || null,
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
        address: form.address.trim() || null
      };

      if (modal.mode === "edit") {
        payload.isActive = form.isActive;
        await updateSupplier(modal.item.id, payload);
        onSetToast(`Supplier '${form.name}' updated.`);
      } else {
        await createSupplier(payload);
        onSetToast(`Supplier '${form.name}' created.`);
      }
      setModal(null);
      loadSuppliers();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(item) {
    if (!window.confirm(`Delete supplier vendor '${item.name}'?`)) return;
    try {
      await deleteSupplier(item.id);
      onSetToast(`Supplier '${item.name}' removed.`);
      loadSuppliers();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  return (
    <div className="page-content">
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            <span>VENDOR PARTNERSHIPS</span>
            <span className="eyebrow-line" />
          </div>
          <h1>Pharmaceutical Suppliers</h1>
          <p>
            Authorized pharmaceutical distributors, procurement representatives, and direct vendor contacts.
          </p>
        </div>
        <div className="heading-actions">
          <button className="btn btn-light" onClick={loadSuppliers}>
            <RefreshCw size={15} /> Refresh
          </button>
          <button className="btn btn-primary" onClick={openCreate}>
            <Plus size={16} /> Add Supplier
          </button>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <AlertTriangle size={18} />
          <span>{error}</span>
          <button onClick={loadSuppliers}>Retry</button>
        </div>
      )}

      {/* Search and Filters */}
      <div className="filter-bar">
        <div className="search-input-wrap">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search vendor name, contact person or email..."
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
            Showing <b>{suppliers.length}</b> vendor suppliers
          </div>
        </div>

        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>SUPPLIER NAME</th>
                <th>CONTACT PERSON</th>
                <th>PHONE NUMBER</th>
                <th>EMAIL ADDRESS</th>
                <th>HEADQUARTERS</th>
                <th>STATUS</th>
                <th className="text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((s) => (
                <tr key={s.id}>
                  <td>
                    <b>{s.name}</b>
                  </td>
                  <td>{s.contactPerson || "—"}</td>
                  <td>
                    {s.phone ? (
                      <div className="contact-link">
                        <Phone size={13} className="text-muted" />
                        <span>{s.phone}</span>
                      </div>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>
                    {s.email ? (
                      <div className="contact-link">
                        <Mail size={13} className="text-muted" />
                        <span>{s.email}</span>
                      </div>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>
                    <span className="cell-truncate">
                      {s.address ? (
                        <>
                          <MapPin size={12} className="text-muted inline-icon" /> {s.address}
                        </>
                      ) : (
                        "—"
                      )}
                    </span>
                  </td>
                  <td>
                    <span className={`status-pill ${s.isActive ? "good" : "muted"}`}>
                      <i /> {s.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="text-right">
                    <div className="action-buttons-group">
                      <button
                        className="icon-btn edit-btn"
                        title="Edit Supplier"
                        onClick={() => openEdit(s)}
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        className="icon-btn delete-btn"
                        title="Delete Supplier"
                        onClick={() => handleDelete(s)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {suppliers.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="empty-table-cell">
                    <Truck size={32} />
                    <p>No supplier records found.</p>
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
                <span className="eyebrow">DISTRIBUTOR</span>
                <h2>{modal.mode === "edit" ? "Edit Supplier" : "Add Supplier"}</h2>
              </div>
              <button className="icon-btn" onClick={() => setModal(null)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="form-grid">
                <label className="form-field">
                  <span>Vendor Company Name *</span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Medline Distributors"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </label>

                <label className="form-field">
                  <span>Contact Person</span>
                  <input
                    type="text"
                    placeholder="e.g. Tariq Mehmood"
                    value={form.contactPerson}
                    onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
                  />
                </label>

                <label className="form-field">
                  <span>Contact Phone</span>
                  <input
                    type="text"
                    placeholder="e.g. +92 300 1234567"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </label>

                <label className="form-field">
                  <span>Official Email</span>
                  <input
                    type="email"
                    placeholder="e.g. orders@medline.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </label>
              </div>

              <label className="form-field" style={{ marginTop: "14px" }}>
                <span>Physical Warehouse / Office Address</span>
                <input
                  type="text"
                  placeholder="e.g. Industrial Area Sector 4, Karachi"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
              </label>

              {modal.mode === "edit" && (
                <label className="check-field" style={{ marginTop: "16px" }}>
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  />
                  <span>Active Supplier Account</span>
                </label>
              )}

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
                  {saving ? "Saving..." : "Save Supplier"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
