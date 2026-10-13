import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import purchaseApi from "../../api/purchaseApi";
import supplierApi from "../../api/supplierApi";
import medicineApi from "../../api/medicineApi";
import { getErrorMessage } from "../../api/axiosClient";
import FormField from "../../components/common/FormField";
import Loader from "../../components/common/Loader";
import { formatCurrency } from "../../utils/formatters";

export default function PurchaseCreatePage() {
  const navigate = useNavigate();

  const [suppliers, setSuppliers] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    purchaseNumber: `PO-${Date.now().toString().slice(-6)}`,
    supplierId: "",
    purchaseDate: new Date().toISOString().split("T")[0],
    notes: "",
    purchaseItems: [
      {
        medicineId: "",
        quantity: 50,
        unitPrice: 12.5
      }
    ]
  });

  useEffect(() => {
    const loadDependencies = async () => {
      setInitialLoading(true);
      try {
        const [supRes, medRes] = await Promise.all([
          supplierApi.getAll({ page: 1, pageSize: 100 }),
          medicineApi.getAll({ page: 1, pageSize: 100 })
        ]);
        const supList = supRes.data.items || supRes.data || [];
        const medList = medRes.data.items || medRes.data || [];
        setSuppliers(supList);
        setMedicines(medList);

        setFormData((prev) => ({
          ...prev,
          supplierId: supList[0]?.id || "",
          purchaseItems: [
            {
              medicineId: medList[0]?.id || "",
              quantity: 50,
              unitPrice: 12.5
            }
          ]
        }));
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setInitialLoading(false);
      }
    };
    loadDependencies();
  }, []);

  const handleAddItemRow = () => {
    setFormData((prev) => ({
      ...prev,
      purchaseItems: [
        ...prev.purchaseItems,
        {
          medicineId: medicines[0]?.id || "",
          quantity: 10,
          unitPrice: 10.0
        }
      ]
    }));
  };

  const handleRemoveItemRow = (index) => {
    setFormData((prev) => {
      const updated = [...prev.purchaseItems];
      updated.splice(index, 1);
      return { ...prev, purchaseItems: updated };
    });
  };

  const handleItemChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.purchaseItems];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, purchaseItems: updated };
    });
  };

  const calculateGrandTotal = () => {
    return formData.purchaseItems.reduce(
      (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0),
      0
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.purchaseNumber.trim() || !formData.supplierId) {
      setError("Purchase Number and Supplier are required.");
      return;
    }

    if (formData.purchaseItems.length === 0) {
      setError("Please add at least one line item to the purchase.");
      return;
    }

    const hasInvalidItem = formData.purchaseItems.some(
      (item) => !item.medicineId || Number(item.quantity) <= 0 || Number(item.unitPrice) < 0
    );

    if (hasInvalidItem) {
      setError("All line items must have a medicine selected with quantity > 0 and unit price >= 0.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        purchaseNumber: formData.purchaseNumber.trim(),
        supplierId: Number(formData.supplierId),
        purchaseDate: formData.purchaseDate,
        notes: formData.notes.trim() || null,
        purchaseItems: formData.purchaseItems.map((item) => ({
          medicineId: Number(item.medicineId),
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice)
        }))
      };

      await purchaseApi.create(payload);
      setSuccess("Purchase order recorded successfully.");
      setTimeout(() => navigate("/purchases"), 800);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <Loader message="Loading suppliers and catalog..." />;
  }

  return (
    <div className="container">
      <div className="back-link-bar">
        <Link to="/purchases" className="btn-secondary btn-small">
          &larr; Back to Purchase Orders
        </Link>
      </div>

      <div className="page-header">
        <div>
          <h1>Create Purchase Order</h1>
          <p className="page-subtitle">
            Enter wholesale distributor delivery details and build invoice item line items.
          </p>
        </div>
      </div>

      {error && <div className="message-error">{error}</div>}
      {success && <div className="message-success">{success}</div>}

      <form className="simple-form purchase-order-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <FormField label="Invoice / PO Number" required>
            <input
              type="text"
              value={formData.purchaseNumber}
              onChange={(e) => setFormData({ ...formData, purchaseNumber: e.target.value })}
              required
              className="form-control"
            />
          </FormField>

          <FormField label="Supplier Vendor" required>
            <select
              value={formData.supplierId}
              onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
              required
              className="form-control"
            >
              <option value="">-- Select Supplier --</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        <div className="form-row">
          <FormField label="Purchase Date" required>
            <input
              type="date"
              value={formData.purchaseDate}
              onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
              required
              className="form-control"
            />
          </FormField>

          <FormField label="Notes / Invoice Reference">
            <input
              type="text"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Delivery bill reference, terms, etc."
              className="form-control"
            />
          </FormField>
        </div>

        {/* Dynamic Item Rows */}
        <div className="items-builder-box">
          <div className="items-builder-header">
            <h4>Purchase Order Line Items</h4>
            <button
              type="button"
              className="btn-secondary btn-small"
              onClick={handleAddItemRow}
            >
              + Add Item Row
            </button>
          </div>

          <div className="table-container">
            <table className="simple-table dynamic-items-table">
              <thead>
                <tr>
                  <th style={{ width: "40%" }}>Medicine</th>
                  <th style={{ width: "18%" }}>Quantity</th>
                  <th style={{ width: "20%" }}>Unit Price (PKR)</th>
                  <th style={{ width: "15%" }}>Subtotal</th>
                  <th style={{ width: "7%" }}></th>
                </tr>
              </thead>
              <tbody>
                {formData.purchaseItems.map((item, idx) => {
                  const subtotal = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
                  return (
                    <tr key={idx}>
                      <td>
                        <select
                          value={item.medicineId}
                          onChange={(e) => handleItemChange(idx, "medicineId", e.target.value)}
                          required
                          className="form-control"
                        >
                          <option value="">-- Select Medicine --</option>
                          {medicines.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.name} ({m.medicineCode})
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(idx, "quantity", e.target.value)}
                          required
                          className="form-control"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(idx, "unitPrice", e.target.value)}
                          required
                          className="form-control"
                        />
                      </td>
                      <td>
                        <strong>{formatCurrency(subtotal)}</strong>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <button
                          type="button"
                          className="btn-danger btn-small"
                          onClick={() => handleRemoveItemRow(idx)}
                          disabled={formData.purchaseItems.length === 1}
                          title="Remove item"
                        >
                          &times;
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="order-grand-total-row">
            <span>Order Grand Total:</span>
            <span className="total-highlight">{formatCurrency(calculateGrandTotal())}</span>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Recording Purchase..." : "Confirm & Save Purchase"}
          </button>
          <Link to="/purchases" className="btn-secondary">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
