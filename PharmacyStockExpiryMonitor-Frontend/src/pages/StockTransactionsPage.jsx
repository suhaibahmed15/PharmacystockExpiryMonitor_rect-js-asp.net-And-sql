import React, { useEffect, useState } from "react";
import {
  getStockTransactionsApi,
  createStockTransactionApi,
  getMedicinesApi,
  getBatchesApi,
  getErrorMessage
} from "../services/api";
import Pagination from "../components/Pagination";
import "../styles/StockTransactions.css";

export default function StockTransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [typeFilter, setTypeFilter] = useState("all");

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    medicineId: "",
    batchId: "",
    transactionType: 2, // StockOut default
    quantity: 1,
    reason: "Dispensed to customer",
    isAdminOverride: false
  });

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [txRes, medRes, batchRes] = await Promise.all([
        getStockTransactionsApi(),
        getMedicinesApi({ page: 1, pageSize: 100 }),
        getBatchesApi()
      ]);
      setTransactions(txRes.data || []);
      setMedicines(medRes.data.items || medRes.data || []);
      setBatches(batchRes.data || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getTransactionTypeName = (type) => {
    switch (type) {
      case 1:
        return "Stock In";
      case 2:
        return "Stock Out / Dispensed";
      case 3:
        return "Adjustment";
      case 4:
        return "Transfer";
      default:
        return `Type ${type}`;
    }
  };

  const filteredTransactions = transactions.filter((tx) => {
    if (typeFilter === "2") return tx.transactionType === 2;
    if (typeFilter === "1") return tx.transactionType === 1;
    return true;
  });

  const getTransactionTypeClass = (type) => {
    switch (type) {
      case 1:
        return "type-in";
      case 2:
        return "type-out";
      case 3:
        return "type-adjust";
      default:
        return "";
    }
  };

  const handleOpenAdd = () => {
    setFormData({
      medicineId: medicines[0]?.id || "",
      batchId: batches[0]?.id || "",
      transactionType: 2,
      quantity: 1,
      reason: "Dispensed to customer",
      isAdminOverride: false
    });
    setShowForm(true);
    setError("");
    setSuccess("");
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.medicineId || !formData.quantity) {
      setError("Medicine and quantity are required.");
      return;
    }

    try {
      await createStockTransactionApi({
        medicineId: Number(formData.medicineId),
        batchId: formData.batchId ? Number(formData.batchId) : null,
        transactionType: Number(formData.transactionType),
        quantity: Number(formData.quantity),
        reason: formData.reason,
        isAdminOverride: formData.isAdminOverride
      });
      setSuccess("Stock transaction logged successfully.");
      setShowForm(false);
      loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="container">
      <h1>Stock Transactions Log</h1>

      {error && <div className="message-error">{error}</div>}
      {success && <div className="message-success">{success}</div>}

      <div className="tx-top-bar">
        <div>
          <label style={{ fontSize: "13px", fontWeight: "bold", marginRight: "8px" }}>
            Movement:
          </label>
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
            style={{ padding: "5px 10px", borderRadius: "4px", border: "1px solid #cbd5e1" }}
          >
            <option value="all">All Movements</option>
            <option value="2">Stock Out / Dispensed</option>
            <option value="1">Stock In</option>
          </select>
        </div>
        <button className="btn-primary" onClick={handleOpenAdd}>
          {showForm ? "Close Form" : "+ Record Stock Movement"}
        </button>
      </div>

      {showForm && (
        <form className="simple-form" onSubmit={handleFormSubmit}>
          <h3>Record Stock Movement</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Medicine *</label>
              <select
                value={formData.medicineId}
                onChange={(e) =>
                  setFormData({ ...formData, medicineId: e.target.value })
                }
                required
              >
                <option value="">-- Select Medicine --</option>
                {medicines.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.medicineCode})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Batch (Optional)</label>
              <select
                value={formData.batchId}
                onChange={(e) =>
                  setFormData({ ...formData, batchId: e.target.value })
                }
              >
                <option value="">-- General / No Batch --</option>
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.batchNumber} (Rem: {b.remainingQuantity})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Transaction Type *</label>
              <select
                value={formData.transactionType}
                onChange={(e) =>
                  setFormData({ ...formData, transactionType: e.target.value })
                }
                required
              >
                <option value={2}>Stock Out / Dispensed</option>
                <option value={1}>Stock In</option>
              </select>
            </div>

            <div className="form-group">
              <label>Quantity *</label>
              <input
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Reason / Audit Note</label>
            <input
              type="text"
              value={formData.reason}
              onChange={(e) =>
                setFormData({ ...formData, reason: e.target.value })
              }
              placeholder="e.g. Dispensed to patient prescription #124"
            />
          </div>

          <div>
            <button type="submit" className="btn-primary" style={{ marginRight: "10px" }}>
              Submit Movement
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
        <p>Loading transactions...</p>
      ) : (
        <div className="table-container">
          <table className="simple-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Medicine ID</th>
                <th>Batch ID</th>
                <th>Transaction Type</th>
                <th>Quantity</th>
                <th>Previous Qty</th>
                <th>New Qty</th>
                <th>Reason</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: "center" }}>
                    No stock transactions recorded yet.
                  </td>
                </tr>
              ) : (
                filteredTransactions
                  .slice((page - 1) * pageSize, page * pageSize)
                  .map((tx) => (
                    <tr key={tx.id}>
                      <td>{tx.id}</td>
                      <td>Medicine #{tx.medicineId}</td>
                      <td>{tx.batchId ? `Batch #${tx.batchId}` : "-"}</td>
                      <td className={getTransactionTypeClass(tx.transactionType)}>
                        {getTransactionTypeName(tx.transactionType)}
                      </td>
                      <td>
                        <strong>{tx.quantity}</strong>
                      </td>
                      <td>{tx.previousQuantity}</td>
                      <td>{tx.newQuantity}</td>
                      <td>{tx.reason || "-"}</td>
                      <td>{new Date(tx.createdAt).toLocaleString()}</td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <Pagination
            page={page}
            pageSize={pageSize}
            totalCount={filteredTransactions.length}
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
