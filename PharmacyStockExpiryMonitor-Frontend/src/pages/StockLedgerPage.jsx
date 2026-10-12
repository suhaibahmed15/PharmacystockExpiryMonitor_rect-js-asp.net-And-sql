import React, { useEffect, useState } from "react";
import {
  ClipboardList,
  Plus,
  Search,
  Filter,
  ArrowDownLeft,
  ArrowUpRight,
  Sliders,
  Repeat,
  AlertTriangle,
  X,
  RefreshCw,
  Clock,
  ShieldCheck
} from "lucide-react";
import {
  getTransactions,
  createTransaction,
  getBatches,
  errorMessage
} from "../api";
import Pagination from "../components/Pagination";

export default function StockLedgerPage({ onSetToast }) {
  const [transactions, setTransactions] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({
    batchId: "",
    transactionType: "2", // StockOut default for dispensing
    quantity: 1,
    reason: "Dispensed to patient",
    isAdminOverride: false
  });
  const [saving, setSaving] = useState(false);

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const [txRes, batchRes] = await Promise.allSettled([
        getTransactions(),
        getBatches()
      ]);

      if (txRes.status === "fulfilled") setTransactions(txRes.value.data);
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

  function openCreate() {
    setForm({
      batchId: batches[0]?.id?.toString() || "",
      transactionType: "2",
      quantity: 5,
      reason: "Patient prescription dispensation",
      isAdminOverride: false
    });
    setModal(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.batchId) {
      onSetToast("Please select a Batch lot.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        batchId: parseInt(form.batchId, 10),
        transactionType: parseInt(form.transactionType, 10),
        quantity: parseInt(form.quantity, 10) || 1,
        reason: form.reason.trim(),
        isAdminOverride: form.isAdminOverride
      };

      await createTransaction(payload);
      onSetToast("Stock movement recorded in audit ledger.");
      setModal(false);
      loadData();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  function getTypeBadge(type) {
    // 1: StockIn, 2: StockOut, 3: Adjustment, 4: Transfer
    const num = Number(type);
    if (num === 1 || type === "StockIn") {
      return (
        <span className="type-badge in">
          <ArrowDownLeft size={13} /> Stock In
        </span>
      );
    }
    if (num === 2 || type === "StockOut") {
      return (
        <span className="type-badge out">
          <ArrowUpRight size={13} /> Dispensed (Out)
        </span>
      );
    }
    if (num === 3 || type === "Adjustment") {
      return (
        <span className="type-badge adjustment">
          <Sliders size={13} /> Adjustment
        </span>
      );
    }
    return (
      <span className="type-badge transfer">
        <Repeat size={13} /> Transfer
      </span>
    );
  }

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch =
      (t.medicineName || "").toLowerCase().includes(search.toLowerCase()) ||
      (t.batchNumber || "").toLowerCase().includes(search.toLowerCase()) ||
      (t.reason || "").toLowerCase().includes(search.toLowerCase());

    const matchesType = !selectedType || t.transactionType?.toString() === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="page-content">
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            <span>AUDIT TRAIL & COMPLIANCE</span>
            <span className="eyebrow-line" />
          </div>
          <h1>Stock Transaction Ledger</h1>
          <p>
            Immutable audit trail of stock reception, patient dispensary, inventory adjustments, and physical reconciliations.
          </p>
        </div>
        <div className="heading-actions">
          <button className="btn btn-light" onClick={loadData}>
            <RefreshCw size={15} /> Refresh
          </button>
          <button className="btn btn-primary" onClick={openCreate}>
            <Plus size={16} /> Log Movement
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
            placeholder="Search by medicine, batch number or dispensation reason..."
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
            value={selectedType}
            onChange={(e) => { setSelectedType(e.target.value); setPage(1); }}
          >
            <option value="">All Movement Types</option>
            <option value="1">Stock In</option>
            <option value="2">Stock Out (Dispensed)</option>
            <option value="3">Adjustment</option>
            <option value="4">Transfer</option>
          </select>
        </div>
      </div>

      {/* Ledger Table */}
      <section className="panel table-panel">
        <div className="panel-head">
          <div className="table-caption">
            Showing <b>{filteredTransactions.length}</b> verified ledger entries
          </div>
        </div>

        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>TRANSACTION TIME</th>
                <th>TYPE</th>
                <th>MEDICINE PRODUCT</th>
                <th>BATCH LOT</th>
                <th>QUANTITY</th>
                <th>REASON / NOTES</th>
                <th>ADMIN OVERRIDE</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions
                .slice((page - 1) * pageSize, page * pageSize)
                .map((t) => (
                <tr key={t.id}>
                  <td>
                    <div className="date-cell">
                      <Clock size={13} className="text-muted" />
                      <span>{new Date(t.createdAt).toLocaleString("en-GB")}</span>
                    </div>
                  </td>
                  <td>{getTypeBadge(t.transactionType)}</td>
                  <td>
                    <b>{t.medicineName || `Medicine #${t.medicineId || "—"}`}</b>
                  </td>
                  <td>
                    <span className="code-badge">{t.batchNumber || `Batch #${t.batchId}`}</span>
                  </td>
                  <td>
                    <b className={Number(t.transactionType) === 2 ? "text-danger" : "text-success"}>
                      {Number(t.transactionType) === 2 ? `-${t.quantity}` : `+${t.quantity}`}
                    </b>{" "}
                    units
                  </td>
                  <td>
                    <span className="cell-truncate">{t.reason || "—"}</span>
                  </td>
                  <td>
                    {t.isAdminOverride ? (
                      <span className="status-pill good">
                        <ShieldCheck size={12} /> Authorized
                      </span>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                </tr>
              ))}
              {filteredTransactions.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="empty-table-cell">
                    <ClipboardList size={32} />
                    <p>No transactions match your search criteria.</p>
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
          totalCount={filteredTransactions.length}
          onPageChange={setPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setPage(1);
          }}
        />
      </section>

      {/* Log Transaction Modal */}
      {modal && (
        <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && setModal(false)}>
          <div className="record-modal">
            <div className="modal-head">
              <div>
                <span className="eyebrow">AUDIT DISPENSATION</span>
                <h2>Record Stock Transaction</h2>
              </div>
              <button className="icon-btn" onClick={() => setModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="form-grid">
                <label className="form-field">
                  <span>Batch Lot Selection *</span>
                  <select
                    required
                    value={form.batchId}
                    onChange={(e) => setForm({ ...form, batchId: e.target.value })}
                  >
                    <option value="">Select Batch Lot</option>
                    {batches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.batchNumber} — {b.medicineName} ({b.remainingQuantity} units on hand)
                      </option>
                    ))}
                  </select>
                </label>

                <label className="form-field">
                  <span>Transaction Type *</span>
                  <select
                    required
                    value={form.transactionType}
                    onChange={(e) => setForm({ ...form, transactionType: e.target.value })}
                  >
                    <option value="2">Stock Out (Dispensed to Patient)</option>
                    <option value="1">Stock In (Manual Receiving)</option>
                    <option value="3">Adjustment (Inventory Count)</option>
                    <option value="4">Transfer (Branch Relocation)</option>
                  </select>
                </label>

                <label className="form-field">
                  <span>Quantity Units *</span>
                  <input
                    type="number"
                    min="1"
                    required
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  />
                </label>

                <label className="form-field">
                  <span>Dispensation Reason / Notes *</span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Prescription RX-8821"
                    value={form.reason}
                    onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  />
                </label>
              </div>

              {form.transactionType === "3" && (
                <div className="adjustment-notice">
                  <ShieldCheck size={16} />
                  <span>
                    Inventory adjustment requires an Administrative Override flag.
                  </span>
                </div>
              )}

              <label className="check-field" style={{ marginTop: "16px" }}>
                <input
                  type="checkbox"
                  checked={form.isAdminOverride}
                  onChange={(e) => setForm({ ...form, isAdminOverride: e.target.checked })}
                />
                <span>Administrator Override Approval</span>
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
                  {saving ? "Logging..." : "Record Transaction"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
