import React, { useEffect, useState } from "react";
import {
  Bell,
  Plus,
  Search,
  CheckCircle,
  AlertTriangle,
  AlertOctagon,
  CalendarClock,
  Activity,
  Check,
  Eye,
  X,
  RefreshCw,
  Clock
} from "lucide-react";
import {
  getAlerts,
  createAlert,
  markAlertRead,
  resolveAlert,
  getMedicines,
  getBatches,
  errorMessage
} from "../api";
import Pagination from "../components/Pagination";

export default function AlertsPage({ onSetToast }) {
  const [alerts, setAlerts] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("unresolved"); // 'all' | 'unresolved' | 'unread' | 'resolved'
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({
    medicineId: "",
    batchId: "",
    alertType: "1", // 1: LowStock, 2: NearExpiry, 3: Expired, 4: StockOut
    message: ""
  });
  const [saving, setSaving] = useState(false);

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const [alertRes, medRes, batchRes] = await Promise.allSettled([
        getAlerts(),
        getMedicines({ page: 1, pageSize: 100 }),
        getBatches()
      ]);

      if (alertRes.status === "fulfilled") setAlerts(alertRes.value.data);
      if (medRes.status === "fulfilled") setMedicines(medRes.value.data);
      if (batchRes.status === "fulfilled") setBatches(batchRes.value.data);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function markAsRead(alertItem) {
    try {
      await markAlertRead(alertItem.id);
      onSetToast("Alert marked as read.");
      loadData();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  async function resolveAlert(alertItem) {
    try {
      await resolveAlert(alertItem.id);
      onSetToast("Alert marked as resolved.");
      loadData();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  function openCreate() {
    setForm({
      medicineId: medicines[0]?.id?.toString() || "",
      batchId: "",
      alertType: "2",
      message: "Batch nearing expiration; requires priority dispensary."
    });
    setModal(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.medicineId) {
      onSetToast("Please select a Medicine.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        medicineId: parseInt(form.medicineId, 10),
        batchId: form.batchId ? parseInt(form.batchId, 10) : null,
        alertType: parseInt(form.alertType, 10),
        message: form.message.trim()
      };

      await createAlert(payload);
      onSetToast("New alert registered.");
      setModal(false);
      loadData();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  function renderAlertIcon(type) {
    // 1: LowStock, 2: NearExpiry, 3: Expired, 4: StockOut
    const t = Number(type);
    if (t === 1 || type === "LowStock") {
      return (
        <div className="alert-type-icon orange">
          <Activity size={16} />
        </div>
      );
    }
    if (t === 2 || type === "NearExpiry") {
      return (
        <div className="alert-type-icon purple">
          <CalendarClock size={16} />
        </div>
      );
    }
    if (t === 3 || type === "Expired") {
      return (
        <div className="alert-type-icon red">
          <AlertOctagon size={16} />
        </div>
      );
    }
    return (
      <div className="alert-type-icon red">
        <AlertTriangle size={16} />
      </div>
    );
  }

  function getAlertTypeName(type) {
    const t = Number(type);
    if (t === 1 || type === "LowStock") return "Low Stock Alert";
    if (t === 2 || type === "NearExpiry") return "Near Expiration Alert";
    if (t === 3 || type === "Expired") return "Expired Batch Alert";
    return "Stockout Risk Alert";
  }

  const filteredAlerts = alerts.filter((a) => {
    const matchesSearch =
      (a.message || "").toLowerCase().includes(search.toLowerCase()) ||
      (a.medicineName || "").toLowerCase().includes(search.toLowerCase()) ||
      (a.batchNumber || "").toLowerCase().includes(search.toLowerCase());

    const matchesType = !filterType || a.alertType?.toString() === filterType;

    let matchesStatus = true;
    if (filterStatus === "unresolved") matchesStatus = !a.isResolved;
    else if (filterStatus === "unread") matchesStatus = !a.isRead;
    else if (filterStatus === "resolved") matchesStatus = !!a.isResolved;

    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="page-content">
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            <span>CLINICAL RISK MONITOR</span>
            <span className="eyebrow-line" />
          </div>
          <h1>System Alerts & Notifications</h1>
          <p>
            Real-time warnings for approaching batch expiry, low medicine inventory, and supply anomalies.
          </p>
        </div>
        <div className="heading-actions">
          <button className="btn btn-light" onClick={loadData}>
            <RefreshCw size={15} /> Refresh
          </button>
          <button className="btn btn-primary" onClick={openCreate}>
            <Plus size={16} /> Manual Alert
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

      {/* Filter and Search */}
      <div className="filter-bar">
        <div className="search-input-wrap">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search alerts by medicine, message or batch..."
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
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
          >
            <option value="all">All Statuses</option>
            <option value="unresolved">Unresolved (Open)</option>
            <option value="unread">Unread Only</option>
            <option value="resolved">Resolved</option>
          </select>

          <select
            value={filterType}
            onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
          >
            <option value="">All Alert Types</option>
            <option value="1">Low Stock</option>
            <option value="2">Near Expiry</option>
            <option value="3">Expired Lot</option>
            <option value="4">Stock Out</option>
          </select>
        </div>
      </div>

      {/* Main Alerts Table */}
      <section className="panel table-panel">
        <div className="panel-head">
          <div className="table-caption">
            Showing <b>{filteredAlerts.length}</b> notifications
          </div>
        </div>

        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>TYPE</th>
                <th>MEDICINE / LOT</th>
                <th>ALERT MESSAGE</th>
                <th>TIME</th>
                <th>READ STATUS</th>
                <th>RESOLUTION</th>
                <th className="text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredAlerts
                .slice((page - 1) * pageSize, page * pageSize)
                .map((a) => (
                <tr key={a.id} className={!a.isRead ? "row-unread" : ""}>
                  <td>
                    <div className="alert-type-cell">
                      {renderAlertIcon(a.alertType)}
                      <span>{getAlertTypeName(a.alertType)}</span>
                    </div>
                  </td>
                  <td>
                    <b>{a.medicineName || `Medicine #${a.medicineId}`}</b>
                    {a.batchNumber && (
                      <span className="code-badge d-block mt-1">{a.batchNumber}</span>
                    )}
                  </td>
                  <td>
                    <span className="cell-message-full">{a.message}</span>
                  </td>
                  <td>
                    <div className="date-cell">
                      <Clock size={12} className="text-muted" />
                      <span>{new Date(a.createdAt).toLocaleString("en-GB")}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`status-pill ${a.isRead ? "good" : "warn"}`}>
                      <i /> {a.isRead ? "Read" : "Unread"}
                    </span>
                  </td>
                  <td>
                    <span className={`status-pill ${a.isResolved ? "good" : "muted"}`}>
                      <i /> {a.isResolved ? "Resolved" : "Open"}
                    </span>
                  </td>
                  <td className="text-right">
                    <div className="action-buttons-group">
                      {!a.isRead && (
                        <button
                          className="btn btn-xs btn-light"
                          title="Mark Read"
                          onClick={() => markAsRead(a)}
                        >
                          <Eye size={13} /> Mark Read
                        </button>
                      )}
                      {!a.isResolved && (
                        <button
                          className="btn btn-xs btn-primary"
                          title="Resolve Alert"
                          onClick={() => resolveAlert(a)}
                        >
                          <Check size={13} /> Resolve
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredAlerts.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="empty-table-cell">
                    <CheckCircle size={32} className="text-success" />
                    <p>No active alerts matching the selected filters.</p>
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
          totalCount={filteredAlerts.length}
          onPageChange={setPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setPage(1);
          }}
        />
      </section>

      {/* Manual Alert Modal */}
      {modal && (
        <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && setModal(false)}>
          <div className="record-modal">
            <div className="modal-head">
              <div>
                <span className="eyebrow">RISK DISPATCH</span>
                <h2>Register Manual Alert</h2>
              </div>
              <button className="icon-btn" onClick={() => setModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="form-grid">
                <label className="form-field">
                  <span>Product Medicine *</span>
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

                <label className="form-field">
                  <span>Specific Batch Lot (Optional)</span>
                  <select
                    value={form.batchId}
                    onChange={(e) => setForm({ ...form, batchId: e.target.value })}
                  >
                    <option value="">All Batches / None</option>
                    {batches
                      .filter((b) => !form.medicineId || b.medicineId?.toString() === form.medicineId)
                      .map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.batchNumber} (Exp: {new Date(b.expiryDate).toLocaleDateString("en-GB")})
                        </option>
                      ))}
                  </select>
                </label>

                <label className="form-field">
                  <span>Alert Category *</span>
                  <select
                    required
                    value={form.alertType}
                    onChange={(e) => setForm({ ...form, alertType: e.target.value })}
                  >
                    <option value="1">Low Stock Warning</option>
                    <option value="2">Near Expiry Caution</option>
                    <option value="3">Expired Lot Violation</option>
                    <option value="4">Stock Out Emergency</option>
                  </select>
                </label>
              </div>

              <label className="form-field" style={{ marginTop: "14px" }}>
                <span>Alert Message *</span>
                <textarea
                  rows={3}
                  required
                  placeholder="Detail the critical condition or action needed..."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                />
              </label>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-light"
                  onClick={() => setModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? "Registering..." : "Dispatch Alert"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
