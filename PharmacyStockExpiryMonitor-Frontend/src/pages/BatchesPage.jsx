import React, { useEffect, useState } from "react";
import {
  Boxes,
  Plus,
  Search,
  CalendarClock,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  Edit2,
  Trash2,
  X,
  RefreshCw,
  Clock,
  DollarSign
} from "lucide-react";
import {
  getBatches,
  createBatch,
  updateBatch,
  deleteBatch,
  getMedicines,
  errorMessage
} from "../api";
import Pagination from "../components/Pagination";

export default function BatchesPage({ onSetToast }) {
  const [batches, setBatches] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [expiryFilter, setExpiryFilter] = useState("all"); // 'all' | 'expired' | 'critical' | 'warning' | 'safe'
  const [selectedMedicine, setSelectedMedicine] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [modal, setModal] = useState(null); // { mode: 'create' | 'edit', item?: any }
  const [form, setForm] = useState({
    medicineId: "",
    batchNumber: "",
    manufacturingDate: "",
    expiryDate: "",
    initialQuantity: 100,
    unitCost: 150
  });
  const [saving, setSaving] = useState(false);

  async function loadMedicines() {
    try {
      const res = await getMedicines({ page: 1, pageSize: 100 });
      setMedicines(res.data);
    } catch (e) {
      console.error(e);
    }
  }

  async function loadBatches() {
    setLoading(true);
    setError("");
    try {
      const res = await getBatches();
      setBatches(res.data);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMedicines();
    loadBatches();
  }, []);

  const now = new Date();

  function getDaysUntilExpiry(expiryDate) {
    if (!expiryDate) return 0;
    return Math.ceil((new Date(expiryDate) - now) / (1000 * 60 * 60 * 24));
  }

  function getExpiryStatus(expiryDate) {
    const days = getDaysUntilExpiry(expiryDate);
    if (days < 0) return { label: "EXPIRED", cls: "status-danger", days };
    if (days <= 30) return { label: `CRITICAL (${days}d)`, cls: "status-danger", days };
    if (days <= 90) return { label: `WARNING (${days}d)`, cls: "status-warning", days };
    return { label: `SAFE (${days}d)`, cls: "status-safe", days };
  }

  // Filter batches
  const filteredBatches = batches.filter((b) => {
    const days = getDaysUntilExpiry(b.expiryDate);
    const matchesSearch =
      (b.batchNumber || "").toLowerCase().includes(search.toLowerCase()) ||
      (b.medicineName || "").toLowerCase().includes(search.toLowerCase());

    const matchesMedicine =
      !selectedMedicine || b.medicineId?.toString() === selectedMedicine;

    if (!matchesSearch || !matchesMedicine) return false;

    if (expiryFilter === "expired") return days < 0;
    if (expiryFilter === "critical") return days >= 0 && days <= 30;
    if (expiryFilter === "warning") return days > 30 && days <= 90;
    if (expiryFilter === "safe") return days > 90;
    return true;
  });

  // Calculate metrics
  const expiredCount = batches.filter((b) => getDaysUntilExpiry(b.expiryDate) < 0).length;
  const criticalCount = batches.filter((b) => {
    const d = getDaysUntilExpiry(b.expiryDate);
    return d >= 0 && d <= 30;
  }).length;
  const warningCount = batches.filter((b) => {
    const d = getDaysUntilExpiry(b.expiryDate);
    return d > 30 && d <= 90;
  }).length;
  const safeCount = batches.filter((b) => getDaysUntilExpiry(b.expiryDate) > 90).length;

  function openCreate() {
    const today = new Date().toISOString().split("T")[0];
    const nextYear = new Date(Date.now() + 365 * 86400000).toISOString().split("T")[0];
    setForm({
      medicineId: medicines[0]?.id?.toString() || "",
      batchNumber: `B-${Math.floor(20000 + Math.random() * 80000)}`,
      manufacturingDate: today,
      expiryDate: nextYear,
      initialQuantity: 100,
      unitCost: 250
    });
    setModal({ mode: "create" });
  }

  function openEdit(item) {
    setForm({
      medicineId: item.medicineId?.toString() || "",
      batchNumber: item.batchNumber || "",
      manufacturingDate: item.manufacturingDate?.split("T")[0] || "",
      expiryDate: item.expiryDate?.split("T")[0] || "",
      initialQuantity: item.initialQuantity || 0,
      unitCost: item.unitCost || 0
    });
    setModal({ mode: "edit", item });
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.medicineId && modal.mode === "create") {
      onSetToast("Please select a Medicine.");
      return;
    }
    setSaving(true);
    try {
      if (modal.mode === "edit") {
        const payload = {
          batchNumber: form.batchNumber.trim(),
          manufacturingDate: new Date(form.manufacturingDate).toISOString(),
          expiryDate: new Date(form.expiryDate).toISOString(),
          unitCost: parseFloat(form.unitCost) || 0
        };
        await updateBatch(modal.item.id, payload);
        onSetToast(`Batch '${form.batchNumber}' updated successfully.`);
      } else {
        const payload = {
          medicineId: parseInt(form.medicineId, 10),
          batchNumber: form.batchNumber.trim(),
          manufacturingDate: new Date(form.manufacturingDate).toISOString(),
          expiryDate: new Date(form.expiryDate).toISOString(),
          initialQuantity: parseInt(form.initialQuantity, 10) || 1,
          unitCost: parseFloat(form.unitCost) || 0
        };
        await createBatch(payload);
        onSetToast(`Batch '${form.batchNumber}' created successfully.`);
      }
      setModal(null);
      loadBatches();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(item) {
    if (!window.confirm(`Delete batch record '${item.batchNumber}'?`)) return;
    try {
      await deleteBatch(item.id);
      onSetToast(`Batch '${item.batchNumber}' removed.`);
      loadBatches();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  const formatPKR = (v) =>
    new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      maximumFractionDigits: 0
    }).format(Number(v || 0));

  return (
    <div className="page-content">
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            <span>EXPIRY RISK AUDIT</span>
            <span className="eyebrow-line" />
          </div>
          <h1>Batches & Shelf-Life Monitor</h1>
          <p>
            Track lot production batches, expiration timetables, unit valuations, and enforce First-Expiry-First-Out dispensing.
          </p>
        </div>
        <div className="heading-actions">
          <button className="btn btn-light" onClick={loadBatches}>
            <RefreshCw size={15} /> Refresh
          </button>
          <button className="btn btn-primary" onClick={openCreate}>
            <Plus size={16} /> New Batch Lot
          </button>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <AlertTriangle size={18} />
          <span>{error}</span>
          <button onClick={loadBatches}>Retry</button>
        </div>
      )}

      {/* Expiry Risk Filter Ribbons */}
      <div className="expiry-risk-ribbon">
        <div
          className={`ribbon-card all ${expiryFilter === "all" ? "active" : ""}`}
          onClick={() => { setExpiryFilter("all"); setPage(1); }}
        >
          <div className="ribbon-val">{batches.length}</div>
          <div className="ribbon-lbl">Total Batches</div>
        </div>

        <div
          className={`ribbon-card danger ${expiryFilter === "expired" ? "active" : ""}`}
          onClick={() => { setExpiryFilter("expired"); setPage(1); }}
        >
          <div className="ribbon-val text-danger">{expiredCount}</div>
          <div className="ribbon-lbl">Expired Lots</div>
        </div>

        <div
          className={`ribbon-card critical ${expiryFilter === "critical" ? "active" : ""}`}
          onClick={() => { setExpiryFilter("critical"); setPage(1); }}
        >
          <div className="ribbon-val text-urgent">{criticalCount}</div>
          <div className="ribbon-lbl">Critical (&lt;30 Days)</div>
        </div>

        <div
          className={`ribbon-card warning ${expiryFilter === "warning" ? "active" : ""}`}
          onClick={() => { setExpiryFilter("warning"); setPage(1); }}
        >
          <div className="ribbon-val text-warning">{warningCount}</div>
          <div className="ribbon-lbl">Approaching (&lt;90 Days)</div>
        </div>

        <div
          className={`ribbon-card safe ${expiryFilter === "safe" ? "active" : ""}`}
          onClick={() => { setExpiryFilter("safe"); setPage(1); }}
        >
          <div className="ribbon-val text-success">{safeCount}</div>
          <div className="ribbon-lbl">Safe Shelf-Life</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="filter-bar">
        <div className="search-input-wrap">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search by lot batch number or medicine name..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
          {search && (
            <button className="clear-btn" onClick={() => { setSearch(""); setPage(1); }}>
              <X size={14} />
            </button>
          )}
        </div>

        <div className="filter-group">
          <select
            value={selectedMedicine}
            onChange={(e) => { setSelectedMedicine(e.target.value); setPage(1); }}
          >
            <option value="">All Medicines</option>
            {medicines.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.medicineCode})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Batches Table */}
      <section className="panel table-panel">
        <div className="panel-head">
          <div className="table-caption">
            Showing <b>{filteredBatches.length}</b> batch lot records
          </div>
        </div>

        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>BATCH #</th>
                <th>PRODUCT MEDICINE</th>
                <th>MFG. DATE</th>
                <th>EXPIRY DATE</th>
                <th>LOT STOCK</th>
                <th>UNIT COST</th>
                <th>SHELF-LIFE RISK</th>
                <th className="text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredBatches
                .slice((page - 1) * pageSize, page * pageSize)
                .map((b) => {
                const status = getExpiryStatus(b.expiryDate);
                const isDepleted = Number(b.remainingQuantity || 0) <= 0;

                return (
                  <tr key={b.id} className={status.days < 0 ? "row-expired" : ""}>
                    <td>
                      <span className="code-badge">{b.batchNumber}</span>
                    </td>
                    <td>
                      <b>{b.medicineName || `Medicine #${b.medicineId}`}</b>
                    </td>
                    <td>{new Date(b.manufacturingDate).toLocaleDateString("en-GB")}</td>
                    <td>
                      <div className="date-cell">
                        <Clock size={13} className="text-muted" />
                        <span>{new Date(b.expiryDate).toLocaleDateString("en-GB")}</span>
                      </div>
                    </td>
                    <td>
                      <b>{b.remainingQuantity}</b> / {b.initialQuantity} units
                      {isDepleted && <span className="depleted-tag">Depleted</span>}
                    </td>
                    <td>{formatPKR(b.unitCost)}</td>
                    <td>
                      <span className={`pill-status ${status.cls}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="action-buttons-group">
                        <button
                          className="icon-btn edit-btn"
                          title="Edit Batch"
                          onClick={() => openEdit(b)}
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          className="icon-btn delete-btn"
                          title="Delete Batch"
                          onClick={() => handleDelete(b)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredBatches.length === 0 && !loading && (
                <tr>
                  <td colSpan={8} className="empty-table-cell">
                    <Boxes size={32} />
                    <p>No batch records match the selected filters.</p>
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
          totalCount={filteredBatches.length}
          onPageChange={setPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setPage(1);
          }}
        />
      </section>

      {/* Modal: Create / Edit Batch */}
      {modal && (
        <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && setModal(null)}>
          <div className="record-modal">
            <div className="modal-head">
              <div>
                <span className="eyebrow">BATCH INVENTORY LOT</span>
                <h2>{modal.mode === "edit" ? "Edit Batch Lot" : "Receive New Batch Lot"}</h2>
              </div>
              <button className="icon-btn" onClick={() => setModal(null)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="form-grid">
                {modal.mode === "create" ? (
                  <label className="form-field">
                    <span>Target Medicine *</span>
                    <select
                      required
                      value={form.medicineId}
                      onChange={(e) => setForm({ ...form, medicineId: e.target.value })}
                    >
                      <option value="">Select Medicine</option>
                      {medicines.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.medicineCode})
                        </option>
                      ))}
                    </select>
                  </label>
                ) : (
                  <label className="form-field">
                    <span>Target Medicine</span>
                    <input
                      type="text"
                      disabled
                      value={modal.item?.medicineName || `Medicine #${modal.item?.medicineId}`}
                    />
                  </label>
                )}

                <label className="form-field">
                  <span>Batch Lot Number *</span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. B-26011"
                    value={form.batchNumber}
                    onChange={(e) => setForm({ ...form, batchNumber: e.target.value })}
                  />
                </label>

                <label className="form-field">
                  <span>Manufacturing Date *</span>
                  <input
                    type="date"
                    required
                    value={form.manufacturingDate}
                    onChange={(e) => setForm({ ...form, manufacturingDate: e.target.value })}
                  />
                </label>

                <label className="form-field">
                  <span>Expiry Date *</span>
                  <input
                    type="date"
                    required
                    value={form.expiryDate}
                    onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                  />
                </label>

                {modal.mode === "create" && (
                  <label className="form-field">
                    <span>Initial Quantity Received *</span>
                    <input
                      type="number"
                      min="1"
                      required
                      placeholder="e.g. 100"
                      value={form.initialQuantity}
                      onChange={(e) => setForm({ ...form, initialQuantity: e.target.value })}
                    />
                  </label>
                )}

                <label className="form-field">
                  <span>Unit Cost (PKR) *</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="e.g. 240.00"
                    value={form.unitCost}
                    onChange={(e) => setForm({ ...form, unitCost: e.target.value })}
                  />
                </label>
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
                  {saving ? "Saving..." : modal.mode === "edit" ? "Save Changes" : "Create Batch"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
