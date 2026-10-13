import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import stockTransactionApi from "../../api/stockTransactionApi";
import medicineApi from "../../api/medicineApi";
import batchApi from "../../api/batchApi";
import { getErrorMessage } from "../../api/axiosClient";
import FormField from "../../components/common/FormField";
import Loader from "../../components/common/Loader";
import useAuth from "../../hooks/useAuth";

export default function StockTransactionForm({ onSuccess, onCancel }) {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [medicines, setMedicines] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    medicineId: "",
    batchId: "",
    transactionType: 2, // 2: StockOut / Dispensed default
    quantity: 1,
    reason: "Dispensed to customer prescription",
    isAdminOverride: false
  });

  useEffect(() => {
    const loadDependencies = async () => {
      setInitialLoading(true);
      try {
        const [medRes, batchRes] = await Promise.all([
          medicineApi.getAll({ page: 1, pageSize: 100 }),
          batchApi.getAll()
        ]);
        const medList = medRes.data.items || medRes.data || [];
        const batchList = batchRes.data || [];
        setMedicines(medList);
        setBatches(batchList);

        if (medList.length > 0) {
          setFormData((prev) => ({
            ...prev,
            medicineId: medList[0].id
          }));
        }
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setInitialLoading(false);
      }
    };
    loadDependencies();
  }, []);

  // Filter batches by selected medicine
  const availableBatches = batches.filter(
    (b) => Number(b.medicineId) === Number(formData.medicineId)
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.medicineId || Number(formData.quantity) <= 0) {
      setError("Medicine and a valid quantity (> 0) are required.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await stockTransactionApi.create({
        medicineId: Number(formData.medicineId),
        batchId: formData.batchId ? Number(formData.batchId) : null,
        transactionType: Number(formData.transactionType),
        quantity: Number(formData.quantity),
        reason: formData.reason.trim() || null,
        isAdminOverride: formData.isAdminOverride
      });

      setSuccess("Stock movement recorded successfully.");
      if (onSuccess) {
        onSuccess();
      } else {
        setTimeout(() => navigate("/transactions"), 600);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleCancelClick = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate("/transactions");
    }
  };

  if (initialLoading) {
    return <Loader message="Loading stock ledger options..." />;
  }

  return (
    <div className="form-card-container">
      <div className="form-header">
        <h3>Record Stock Movement / Dispensing</h3>
        <p className="form-description">
          Log dispensing to patient, warehouse stock-in, inventory adjustments, or disposal.
        </p>
      </div>

      {error && <div className="message-error">{error}</div>}
      {success && <div className="message-success">{success}</div>}

      <form className="simple-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <FormField label="Medicine Item" required>
            <select
              value={formData.medicineId}
              onChange={(e) =>
                setFormData({ ...formData, medicineId: e.target.value, batchId: "" })
              }
              required
              className="form-control"
            >
              <option value="">-- Select Medicine --</option>
              {medicines.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.medicineCode}) &bull; Stock: {m.currentStock}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Target Batch Lot (Optional)">
            <select
              value={formData.batchId}
              onChange={(e) => setFormData({ ...formData, batchId: e.target.value })}
              className="form-control"
            >
              <option value="">-- General Stock / Any Batch --</option>
              {availableBatches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.batchNumber} (Rem: {b.remainingQuantity})
                </option>
              ))}
            </select>
          </FormField>
        </div>

        <div className="form-row">
          <FormField label="Transaction Type" required>
            <select
              value={formData.transactionType}
              onChange={(e) => setFormData({ ...formData, transactionType: e.target.value })}
              required
              className="form-control"
            >
              <option value={2}>Stock Out / Dispensed to Patient</option>
              <option value={1}>Stock In / Direct Warehouse Receipt</option>
              <option value={3}>Inventory Adjustment / Audit Correction</option>
              <option value={4}>Transfer / Quarantine Move</option>
            </select>
          </FormField>

          <FormField label="Quantity Units" required>
            <input
              type="number"
              min="1"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              required
              className="form-control"
            />
          </FormField>
        </div>

        <FormField label="Reason / Audit Note" hint="e.g. Prescription #129, Broken ampoule, Physical count adjustment">
          <input
            type="text"
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            placeholder="Audit explanation for stock movement"
            className="form-control"
          />
        </FormField>

        {isAdmin && (
          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.isAdminOverride}
                onChange={(e) => setFormData({ ...formData, isAdminOverride: e.target.checked })}
              />
              <span>Admin Override (Bypass safety checks if emergency)</span>
            </label>
          </div>
        )}

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Recording..." : "Submit Stock Transaction"}
          </button>
          <button type="button" className="btn-secondary" onClick={handleCancelClick} disabled={loading}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
