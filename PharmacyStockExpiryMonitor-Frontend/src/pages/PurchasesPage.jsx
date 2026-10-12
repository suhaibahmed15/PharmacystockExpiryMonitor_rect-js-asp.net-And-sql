import React, { useEffect, useState } from "react";
import {
  ShoppingCart,
  Plus,
  Search,
  Calendar,
  AlertTriangle,
  Eye,
  Trash2,
  X,
  RefreshCw,
  FileText
} from "lucide-react";
import {
  getPurchases,
  createPurchase,
  getSuppliers,
  getMedicines,
  errorMessage
} from "../api";
import Pagination from "../components/Pagination";

export default function PurchasesPage({ onSetToast }) {
  const [purchases, setPurchases] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [modal, setModal] = useState(false);
  const [viewItem, setViewItem] = useState(null); // for viewing items breakdown

  const [form, setForm] = useState({
    purchaseNumber: "",
    supplierId: "",
    purchaseDate: "",
    notes: "",
    purchaseItems: []
  });
  const [saving, setSaving] = useState(false);

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const [purRes, supRes, medRes] = await Promise.allSettled([
        getPurchases(),
        getSuppliers({ page: 1, pageSize: 100 }),
        getMedicines({ page: 1, pageSize: 100 })
      ]);

      if (purRes.status === "fulfilled") setPurchases(purRes.value.data);
      if (supRes.status === "fulfilled") setSuppliers(supRes.value.data);
      if (medRes.status === "fulfilled") setMedicines(medRes.value.data);
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
    const today = new Date().toISOString().split("T")[0];
    const purNum = `PUR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    setForm({
      purchaseNumber: purNum,
      supplierId: suppliers[0]?.id?.toString() || "",
      purchaseDate: today,
      notes: "Routine inventory replenishment",
      purchaseItems: [
        {
          medicineId: medicines[0]?.id?.toString() || "",
          quantity: 50,
          unitPrice: 120
        }
      ]
    });
    setModal(true);
  }

  function addLineItem() {
    setForm({
      ...form,
      purchaseItems: [
        ...form.purchaseItems,
        {
          medicineId: medicines[0]?.id?.toString() || "",
          quantity: 20,
          unitPrice: 100
        }
      ]
    });
  }

  function updateLineItem(index, field, value) {
    const updated = [...form.purchaseItems];
    updated[index] = { ...updated[index], [field]: value };
    setForm({ ...form, purchaseItems: updated });
  }

  function removeLineItem(index) {
    if (form.purchaseItems.length <= 1) {
      onSetToast("A purchase must have at least one line item.");
      return;
    }
    setForm({
      ...form,
      purchaseItems: form.purchaseItems.filter((_, i) => i !== index)
    });
  }

  const grandTotal = form.purchaseItems.reduce(
    (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0),
    0
  );

  async function handleSave(e) {
    e.preventDefault();
    if (!form.supplierId) {
      onSetToast("Please select a Supplier.");
      return;
    }
    if (form.purchaseItems.length === 0) {
      onSetToast("Please add at least one line item.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        purchaseNumber: form.purchaseNumber.trim(),
        supplierId: parseInt(form.supplierId, 10),
        purchaseDate: new Date(form.purchaseDate).toISOString(),
        notes: form.notes?.trim() || null,
        purchaseItems: form.purchaseItems.map((pi) => ({
          medicineId: parseInt(pi.medicineId, 10),
          quantity: parseInt(pi.quantity, 10) || 1,
          unitPrice: parseFloat(pi.unitPrice) || 0
        }))
      };

      await createPurchase(payload);
      onSetToast(`Purchase order '${form.purchaseNumber}' created successfully.`);
      setModal(false);
      loadData();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  const formatPKR = (v) =>
    new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      maximumFractionDigits: 0
    }).format(Number(v || 0));

  const filteredPurchases = purchases.filter(
    (p) =>
      (p.purchaseNumber || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.supplierName || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-content">
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            <span>PROCUREMENT & SUPPLY CHAIN</span>
            <span className="eyebrow-line" />
          </div>
          <h1>Purchases & Vendor Invoices</h1>
          <p>
            Record bulk supplier orders, unit pricing, receiving verification, and inventory capital deployment.
          </p>
        </div>
        <div className="heading-actions">
          <button className="btn btn-light" onClick={loadData}>
            <RefreshCw size={15} /> Refresh
          </button>
          <button className="btn btn-primary" onClick={openCreate}>
            <Plus size={16} /> New Purchase Order
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

      {/* Search Bar */}
      <div className="filter-bar">
        <div className="search-input-wrap">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search by invoice number or vendor name..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
          {search && (
            <button className="clear-btn" onClick={() => { setSearch(""); setPage(1); }}>
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Main Table */}
      <section className="panel table-panel">
        <div className="panel-head">
          <div className="table-caption">
            Showing <b>{filteredPurchases.length}</b> purchase transaction records
          </div>
        </div>

        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>INVOICE #</th>
                <th>SUPPLIER VENDOR</th>
                <th>PURCHASE DATE</th>
                <th>ITEMS COUNT</th>
                <th>TOTAL AMOUNT</th>
                <th>NOTES</th>
                <th className="text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredPurchases
                .slice((page - 1) * pageSize, page * pageSize)
                .map((p) => (
                <tr key={p.id}>
                  <td>
                    <span className="code-badge">{p.purchaseNumber}</span>
                  </td>
                  <td>
                    <b>{p.supplierName || `Supplier #${p.supplierId}`}</b>
                  </td>
                  <td>{new Date(p.purchaseDate).toLocaleDateString("en-GB")}</td>
                  <td>
                    <span className="badge-count">
                      {p.purchaseItems?.length || 1} line item(s)
                    </span>
                  </td>
                  <td>
                    <strong className="text-success">{formatPKR(p.totalAmount)}</strong>
                  </td>
                  <td>
                    <span className="text-muted cell-truncate">
                      {p.notes || "—"}
                    </span>
                  </td>
                  <td className="text-right">
                    <button
                      className="btn btn-xs btn-light"
                      onClick={() => setViewItem(p)}
                    >
                      <Eye size={13} /> View Items
                    </button>
                  </td>
                </tr>
              ))}
              {filteredPurchases.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="empty-table-cell">
                    <ShoppingCart size={32} />
                    <p>No purchase records found.</p>
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
          totalCount={filteredPurchases.length}
          onPageChange={setPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setPage(1);
          }}
        />
      </section>

      {/* View Items Breakdown Modal */}
      {viewItem && (
        <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && setViewItem(null)}>
          <div className="record-modal">
            <div className="modal-head">
              <div>
                <span className="eyebrow">PURCHASE DETAILS</span>
                <h2>Invoice {viewItem.purchaseNumber}</h2>
                <small className="text-muted">
                  Supplier: <b>{viewItem.supplierName}</b> | Date:{" "}
                  {new Date(viewItem.purchaseDate).toLocaleDateString("en-GB")}
                </small>
              </div>
              <button className="icon-btn" onClick={() => setViewItem(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="table-responsive" style={{ margin: "16px 0" }}>
              <table>
                <thead>
                  <tr>
                    <th>MEDICINE ID</th>
                    <th>QUANTITY</th>
                    <th>UNIT PRICE</th>
                    <th>SUBTOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  {(viewItem.purchaseItems || []).map((item, idx) => (
                    <tr key={idx}>
                      <td>
                        {medicines.find((m) => m.id === item.medicineId)?.name ||
                          `Medicine #${item.medicineId}`}
                      </td>
                      <td>{item.quantity} units</td>
                      <td>{formatPKR(item.unitPrice)}</td>
                      <td>
                        <b>{formatPKR(item.quantity * item.unitPrice)}</b>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="purchase-modal-summary">
              <span>Total Invoice Amount:</span>
              <strong>{formatPKR(viewItem.totalAmount)}</strong>
            </div>

            <div className="modal-actions">
              <button className="btn btn-primary" onClick={() => setViewItem(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Purchase Modal with Line Items Builder */}
      {modal && (
        <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && setModal(false)}>
          <div className="record-modal wide-modal">
            <div className="modal-head">
              <div>
                <span className="eyebrow">NEW PROCUREMENT</span>
                <h2>Record Supplier Purchase Order</h2>
              </div>
              <button className="icon-btn" onClick={() => setModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="form-grid">
                <label className="form-field">
                  <span>Purchase Invoice # *</span>
                  <input
                    type="text"
                    required
                    value={form.purchaseNumber}
                    onChange={(e) => setForm({ ...form, purchaseNumber: e.target.value })}
                  />
                </label>

                <label className="form-field">
                  <span>Supplier Vendor *</span>
                  <select
                    required
                    value={form.supplierId}
                    onChange={(e) => setForm({ ...form, supplierId: e.target.value })}
                  >
                    <option value="">Select Vendor</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="form-field">
                  <span>Purchase Date *</span>
                  <input
                    type="date"
                    required
                    value={form.purchaseDate}
                    onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })}
                  />
                </label>

                <label className="form-field">
                  <span>Notes / Reference</span>
                  <input
                    type="text"
                    placeholder="e.g. Received via Medline Express"
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  />
                </label>
              </div>

              {/* Line Items Dynamic Builder */}
              <div className="line-items-section">
                <div className="line-items-header">
                  <div>
                    <h3>Invoice Line Items</h3>
                    <small>Medicines received in this consignment</small>
                  </div>
                  <button
                    type="button"
                    className="btn btn-xs btn-light"
                    onClick={addLineItem}
                  >
                    <Plus size={14} /> Add Line Item
                  </button>
                </div>

                <div className="line-items-table">
                  {form.purchaseItems.map((item, idx) => (
                    <div className="line-item-row" key={idx}>
                      <div className="field-grow">
                        <span className="row-label">Medicine</span>
                        <select
                          required
                          value={item.medicineId}
                          onChange={(e) => updateLineItem(idx, "medicineId", e.target.value)}
                        >
                          {medicines.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.name} ({m.medicineCode})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="field-sm">
                        <span className="row-label">Quantity</span>
                        <input
                          type="number"
                          min="1"
                          required
                          value={item.quantity}
                          onChange={(e) => updateLineItem(idx, "quantity", e.target.value)}
                        />
                      </div>

                      <div className="field-sm">
                        <span className="row-label">Unit Price (PKR)</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          required
                          value={item.unitPrice}
                          onChange={(e) => updateLineItem(idx, "unitPrice", e.target.value)}
                        />
                      </div>

                      <div className="field-subtotal">
                        <span className="row-label">Subtotal</span>
                        <strong>{formatPKR((Number(item.quantity) || 0) * (Number(item.unitPrice) || 0))}</strong>
                      </div>

                      <button
                        type="button"
                        className="icon-btn delete-btn"
                        onClick={() => removeLineItem(idx)}
                        title="Remove Item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="grand-total-banner">
                  <span>Grand Total Payable:</span>
                  <strong>{formatPKR(grandTotal)}</strong>
                </div>
              </div>

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
                  {saving ? "Recording..." : "Save Purchase Order"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
