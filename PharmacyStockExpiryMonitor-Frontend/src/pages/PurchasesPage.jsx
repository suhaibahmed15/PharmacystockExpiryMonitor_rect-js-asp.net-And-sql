import React, { useEffect, useState } from "react";
import {
  getPurchasesApi,
  createPurchaseApi,
  getSuppliersApi,
  getMedicinesApi,
  getErrorMessage
} from "../services/api";
import Pagination from "../components/Pagination";
import "../styles/Purchases.css";

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [showForm, setShowForm] = useState(false);
  const [viewDetails, setViewDetails] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    purchaseNumber: "",
    supplierId: "",
    purchaseDate: new Date().toISOString().split("T")[0],
    notes: "",
    purchaseItems: []
  });

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [purRes, supRes, medRes] = await Promise.all([
        getPurchasesApi(),
        getSuppliersApi({ page: 1, pageSize: 100 }),
        getMedicinesApi({ page: 1, pageSize: 100 })
      ]);
      setPurchases(purRes.data || []);
      setSuppliers(supRes.data.items || supRes.data || []);
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
      purchaseNumber: `PO-${Date.now().toString().slice(-6)}`,
      supplierId: suppliers[0]?.id || "",
      purchaseDate: new Date().toISOString().split("T")[0],
      notes: "",
      purchaseItems: [
        {
          medicineId: medicines[0]?.id || "",
          quantity: 50,
          unitPrice: 12.5
        }
      ]
    });
    setShowForm(true);
    setError("");
    setSuccess("");
  };

  const handleAddItemRow = () => {
    setFormData({
      ...formData,
      purchaseItems: [
        ...formData.purchaseItems,
        {
          medicineId: medicines[0]?.id || "",
          quantity: 10,
          unitPrice: 10.0
        }
      ]
    });
  };

  const handleRemoveItemRow = (index) => {
    const updated = [...formData.purchaseItems];
    updated.splice(index, 1);
    setFormData({ ...formData, purchaseItems: updated });
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...formData.purchaseItems];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, purchaseItems: updated });
  };

  const calculateTotal = () => {
    return formData.purchaseItems.reduce(
      (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0),
      0
    );
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.purchaseNumber || !formData.supplierId) {
      setError("Purchase Number and Supplier are required.");
      return;
    }

    if (formData.purchaseItems.length === 0) {
      setError("Please add at least one item to the purchase.");
      return;
    }

    try {
      const payload = {
        purchaseNumber: formData.purchaseNumber,
        supplierId: Number(formData.supplierId),
        purchaseDate: formData.purchaseDate,
        notes: formData.notes,
        purchaseItems: formData.purchaseItems.map((item) => ({
          medicineId: Number(item.medicineId),
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice)
        }))
      };

      await createPurchaseApi(payload);
      setSuccess("Purchase recorded successfully.");
      setShowForm(false);
      loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="container">
      <h1>Purchase Management</h1>

      {error && <div className="message-error">{error}</div>}
      {success && <div className="message-success">{success}</div>}

      <div className="purchase-top-bar">
        <p style={{ margin: 0, fontSize: "13px", color: "#666" }}>
          Record procurement invoices, purchase items from suppliers, and order amounts.
        </p>
        <button className="btn-primary" onClick={handleOpenAdd}>
          {showForm ? "Close Form" : "+ Create Purchase Order"}
        </button>
      </div>

      {/* Create Purchase Form */}
      {showForm && (
        <form className="simple-form" onSubmit={handleFormSubmit}>
          <h3>Create New Purchase Order</h3>

          <div className="form-row">
            <div className="form-group">
              <label>Purchase Number / Invoice # *</label>
              <input
                type="text"
                value={formData.purchaseNumber}
                onChange={(e) =>
                  setFormData({ ...formData, purchaseNumber: e.target.value })
                }
                required
              />
            </div>
            <div className="form-group">
              <label>Supplier *</label>
              <select
                value={formData.supplierId}
                onChange={(e) =>
                  setFormData({ ...formData, supplierId: e.target.value })
                }
                required
              >
                <option value="">-- Select Supplier --</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Purchase Date *</label>
              <input
                type="date"
                value={formData.purchaseDate}
                onChange={(e) =>
                  setFormData({ ...formData, purchaseDate: e.target.value })
                }
                required
              />
            </div>
            <div className="form-group">
              <label>Notes / Remarks</label>
              <input
                type="text"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Optional delivery or invoice note"
              />
            </div>
          </div>

          {/* Line Items Section */}
          <div className="items-builder-box">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "8px"
              }}
            >
              <strong>Purchase Line Items</strong>
              <button
                type="button"
                className="btn-secondary btn-small"
                onClick={handleAddItemRow}
              >
                + Add Item
              </button>
            </div>

            {formData.purchaseItems.map((item, idx) => (
              <div key={idx} className="item-row">
                <div style={{ flex: 3 }}>
                  <label style={{ fontSize: "11px", display: "block" }}>
                    Medicine:
                  </label>
                  <select
                    value={item.medicineId}
                    onChange={(e) =>
                      handleItemChange(idx, "medicineId", e.target.value)
                    }
                    style={{ width: "100%", padding: "4px" }}
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

                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "11px", display: "block" }}>
                    Qty:
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) =>
                      handleItemChange(idx, "quantity", e.target.value)
                    }
                    style={{ width: "100%", padding: "4px" }}
                    required
                  />
                </div>

                <div style={{ flex: 1.5 }}>
                  <label style={{ fontSize: "11px", display: "block" }}>
                    Unit Price:
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={item.unitPrice}
                    onChange={(e) =>
                      handleItemChange(idx, "unitPrice", e.target.value)
                    }
                    style={{ width: "100%", padding: "4px" }}
                    required
                  />
                </div>

                <div style={{ flex: 1.5, textAlign: "right" }}>
                  <label style={{ fontSize: "11px", display: "block" }}>
                    Subtotal:
                  </label>
                  <span style={{ fontSize: "13px", fontWeight: "bold" }}>
                    PKR{" "}
                    {(
                      (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0)
                    ).toFixed(2)}
                  </span>
                </div>

                <div>
                  <button
                    type="button"
                    className="btn-danger btn-small"
                    style={{ marginTop: "15px" }}
                    onClick={() => handleRemoveItemRow(idx)}
                    disabled={formData.purchaseItems.length === 1}
                  >
                    X
                  </button>
                </div>
              </div>
            ))}

            <div
              style={{
                textAlign: "right",
                marginTop: "10px",
                borderTop: "1px solid #eee",
                paddingTop: "6px"
              }}
            >
              <strong>
                Order Grand Total: PKR {calculateTotal().toFixed(2)}
              </strong>
            </div>
          </div>

          <div style={{ marginTop: "15px" }}>
            <button type="submit" className="btn-primary" style={{ marginRight: "10px" }}>
              Save Purchase
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

      {/* Details Modal */}
      {viewDetails && (
        <div
          style={{
            border: "2px solid #0066cc",
            padding: "15px",
            backgroundColor: "#ffffff",
            marginBottom: "20px"
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <h3>Purchase Details: {viewDetails.purchaseNumber}</h3>
            <button
              className="btn-secondary btn-small"
              onClick={() => setViewDetails(null)}
            >
              Close
            </button>
          </div>
          <p style={{ margin: "5px 0" }}>
            <strong>Supplier:</strong> {viewDetails.supplierName || `Supplier #${viewDetails.supplierId}`} |{" "}
            <strong>Date:</strong> {new Date(viewDetails.purchaseDate).toLocaleDateString()} |{" "}
            <strong>Total Amount:</strong> PKR {Number(viewDetails.totalAmount).toFixed(2)}
          </p>
          {viewDetails.notes && (
            <p style={{ margin: "5px 0", color: "#666" }}>
              <strong>Notes:</strong> {viewDetails.notes}
            </p>
          )}

          <table className="simple-table" style={{ marginTop: "10px" }}>
            <thead>
              <tr>
                <th>Medicine ID</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {(viewDetails.purchaseItems || []).map((item, idx) => (
                <tr key={idx}>
                  <td>Medicine #{item.medicineId}</td>
                  <td>{item.quantity}</td>
                  <td>PKR {Number(item.unitPrice).toFixed(2)}</td>
                  <td>PKR {(item.quantity * item.unitPrice).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Purchases Table */}
      {loading ? (
        <p>Loading purchases...</p>
      ) : (
        <div className="table-container">
          <table className="simple-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Purchase #</th>
                <th>Supplier</th>
                <th>Purchase Date</th>
                <th>Total Amount</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {purchases.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center" }}>
                    No purchases found.
                  </td>
                </tr>
              ) : (
                purchases
                  .slice((page - 1) * pageSize, page * pageSize)
                  .map((p) => (
                    <tr key={p.id}>
                      <td>{p.id}</td>
                      <td>
                        <strong>{p.purchaseNumber}</strong>
                      </td>
                      <td>{p.supplierName || `Supplier #${p.supplierId}`}</td>
                      <td>{new Date(p.purchaseDate).toLocaleDateString()}</td>
                      <td>
                        <strong>PKR {Number(p.totalAmount).toFixed(2)}</strong>
                      </td>
                      <td>{p.notes || "-"}</td>
                      <td>
                        <button
                          className="btn-secondary btn-small"
                          onClick={() => setViewDetails(p)}
                        >
                          View Items ({(p.purchaseItems || []).length})
                        </button>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <Pagination
            page={page}
            pageSize={pageSize}
            totalCount={purchases.length}
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
