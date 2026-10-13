import React, { useEffect, useState } from "react";
import {
  getBatchesApi,
  createBatchApi,
  updateBatchApi,
  deleteBatchApi,
  getMedicinesApi,
  getErrorMessage
} from "../services/api";
import Pagination from "../components/Pagination";
import "../styles/Batches.css";

export default function BatchesPage() {
  const [batches, setBatches] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    medicineId: "",
    batchNumber: "",
    manufacturingDate: "",
    expiryDate: "",
    initialQuantity: 100,
    unitCost: 10.0
  });

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [batchRes, medRes] = await Promise.all([
        getBatchesApi(),
        getMedicinesApi({ page: 1, pageSize: 100 })
      ]);
      setBatches(batchRes.data || []);
      setMedicines(medRes.data.items || medRes.data || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setFormData({
      medicineId: medicines[0]?.id || "",
      batchNumber: `BAT-${Math.floor(1000 + Math.random() * 9000)}`,
      manufacturingDate: new Date().toISOString().split("T")[0],
      expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      initialQuantity: 100,
      unitCost: 15.0
    });
    setEditId(null);
    setShowForm(true);
    setError("");
    setSuccess("");
  };

  const handleOpenEdit = (item) => {
    setFormData({
      medicineId: item.medicineId,
      batchNumber: item.batchNumber,
      manufacturingDate: item.manufacturingDate
        ? item.manufacturingDate.split("T")[0]
        : "",
      expiryDate: item.expiryDate ? item.expiryDate.split("T")[0] : "",
      initialQuantity: item.initialQuantity || item.remainingQuantity,
      unitCost: item.unitCost
    });
    setEditId(item.id);
    setShowForm(true);
    setError("");
    setSuccess("");
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.batchNumber || !formData.expiryDate) {
      setError("Please fill in Batch Number and Expiry Date.");
      return;
    }

    try {
      if (editId) {
        await updateBatchApi(editId, {
          batchNumber: formData.batchNumber,
          manufacturingDate: formData.manufacturingDate,
          expiryDate: formData.expiryDate,
          unitCost: Number(formData.unitCost)
        });
        setSuccess("Batch updated successfully.");
      } else {
        await createBatchApi({
          medicineId: Number(formData.medicineId),
          batchNumber: formData.batchNumber,
          manufacturingDate: formData.manufacturingDate,
          expiryDate: formData.expiryDate,
          initialQuantity: Number(formData.initialQuantity),
          unitCost: Number(formData.unitCost)
        });
        setSuccess("Batch created successfully.");
      }
      setShowForm(false);
      setEditId(null);
      loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this batch?")) return;
    setError("");
    setSuccess("");
    try {
      await deleteBatchApi(id);
      setSuccess("Batch deleted successfully.");
      loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  // Helper to determine expiry status
  const getExpiryStatus = (expiryDate) => {
    if (!expiryDate) return { text: "Unknown", className: "" };
    const now = new Date();
    const exp = new Date(expiryDate);
    const diffDays = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      return { text: "Expired", className: "text-expired" };
    } else if (diffDays <= 90) {
      return {
        text: `Expiring Soon (${diffDays} days left)`,
        className: "text-near-expiry"
      };
    } else {
      return { text: `Safe (${diffDays} days left)`, className: "text-safe" };
    }
  };

  return (
    <div className="container">
      <h1>Batch Management</h1>

      {error && <div className="message-error">{error}</div>}
      {success && <div className="message-success">{success}</div>}

      <div className="batch-top-bar">
        <p style={{ margin: 0, fontSize: "13px", color: "#666" }}>
          Track pharmaceutical manufacturing lots, stock expiry dates, and unit costs.
        </p>
        <button className="btn-primary" onClick={handleOpenAdd}>
          {showForm && !editId ? "Close Form" : "+ Add Batch"}
        </button>
      </div>

      {showForm && (
        <form className="simple-form" onSubmit={handleFormSubmit}>
          <h3>{editId ? "Edit Batch" : "Add New Batch"}</h3>
          <div className="form-row">
            {!editId && (
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
            )}
            <div className="form-group">
              <label>Batch Number *</label>
              <input
                type="text"
                value={formData.batchNumber}
                onChange={(e) =>
                  setFormData({ ...formData, batchNumber: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Manufacturing Date *</label>
              <input
                type="date"
                value={formData.manufacturingDate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    manufacturingDate: e.target.value
                  })
                }
                required
              />
            </div>
            <div className="form-group">
              <label>Expiry Date *</label>
              <input
                type="date"
                value={formData.expiryDate}
                onChange={(e) =>
                  setFormData({ ...formData, expiryDate: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="form-row">
            {!editId && (
              <div className="form-group">
                <label>Initial Quantity *</label>
                <input
                  type="number"
                  min="1"
                  value={formData.initialQuantity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      initialQuantity: e.target.value
                    })
                  }
                  required
                />
              </div>
            )}
            <div className="form-group">
              <label>Unit Cost (PKR) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.unitCost}
                onChange={(e) =>
                  setFormData({ ...formData, unitCost: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div>
            <button type="submit" className="btn-primary" style={{ marginRight: "10px" }}>
              {editId ? "Update Batch" : "Save Batch"}
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
        <p>Loading batches...</p>
      ) : (
        <div className="table-container">
          <table className="simple-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Batch Number</th>
                <th>Medicine Name</th>
                <th>Manufacturing Date</th>
                <th>Expiry Date</th>
                <th>Expiry Status</th>
                <th>Remaining Qty</th>
                <th>Unit Cost</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {batches.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: "center" }}>
                    No batches found.
                  </td>
                </tr>
              ) : (
                batches
                  .slice((page - 1) * pageSize, page * pageSize)
                  .map((b) => {
                    const status = getExpiryStatus(b.expiryDate);
                    return (
                      <tr key={b.id}>
                        <td>{b.id}</td>
                        <td>
                          <strong>{b.batchNumber}</strong>
                        </td>
                        <td>{b.medicineName || `Medicine #${b.medicineId}`}</td>
                        <td>
                          {b.manufacturingDate
                            ? new Date(b.manufacturingDate).toLocaleDateString()
                            : "-"}
                        </td>
                        <td>
                          {b.expiryDate
                            ? new Date(b.expiryDate).toLocaleDateString()
                            : "-"}
                        </td>
                        <td className={status.className}>{status.text}</td>
                        <td>
                          <strong>{b.remainingQuantity}</strong>
                        </td>
                        <td>PKR {Number(b.unitCost).toFixed(2)}</td>
                        <td>
                          <button
                            className="btn-secondary btn-small"
                            onClick={() => handleOpenEdit(b)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn-danger btn-small"
                            onClick={() => handleDelete(b.id)}
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
            totalCount={batches.length}
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
