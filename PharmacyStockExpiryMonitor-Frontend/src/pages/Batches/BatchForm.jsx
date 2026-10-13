import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import batchApi from "../../api/batchApi";
import medicineApi from "../../api/medicineApi";
import { getErrorMessage } from "../../api/axiosClient";
import FormField from "../../components/common/FormField";
import Loader from "../../components/common/Loader";

export default function BatchForm({
  editId: propEditId,
  initialData = null,
  preselectedMedicineId = null,
  onSuccess,
  onCancel
}) {
  const { id: paramId } = useParams();
  const editId = propEditId || paramId;
  const navigate = useNavigate();

  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(Boolean(editId && !initialData));
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const defaultExp = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const [formData, setFormData] = useState({
    medicineId: initialData?.medicineId || preselectedMedicineId || "",
    batchNumber: initialData?.batchNumber || `BAT-${Math.floor(1000 + Math.random() * 9000)}`,
    manufacturingDate: initialData?.manufacturingDate
      ? initialData.manufacturingDate.split("T")[0]
      : new Date().toISOString().split("T")[0],
    expiryDate: initialData?.expiryDate
      ? initialData.expiryDate.split("T")[0]
      : defaultExp,
    initialQuantity: initialData?.initialQuantity || initialData?.remainingQuantity || 100,
    unitCost: initialData?.unitCost ?? 15.0
  });

  useEffect(() => {
    const loadMedicines = async () => {
      try {
        const res = await medicineApi.getAll({ page: 1, pageSize: 100 });
        const list = res.data.items || res.data || [];
        setMedicines(list);
        if (list.length > 0 && !formData.medicineId && !preselectedMedicineId) {
          setFormData((prev) => ({ ...prev, medicineId: list[0].id }));
        }
      } catch {
        // ignore
      }
    };
    loadMedicines();
  }, [preselectedMedicineId]);

  useEffect(() => {
    if (editId && !initialData) {
      const fetchBatch = async () => {
        setFetching(true);
        try {
          const res = await batchApi.getById(editId);
          const b = res.data;
          setFormData({
            medicineId: b.medicineId,
            batchNumber: b.batchNumber,
            manufacturingDate: b.manufacturingDate ? b.manufacturingDate.split("T")[0] : "",
            expiryDate: b.expiryDate ? b.expiryDate.split("T")[0] : "",
            initialQuantity: b.initialQuantity || b.remainingQuantity,
            unitCost: b.unitCost
          });
        } catch (err) {
          setError(getErrorMessage(err));
        } finally {
          setFetching(false);
        }
      };
      fetchBatch();
    }
  }, [editId, initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.batchNumber.trim() || !formData.expiryDate) {
      setError("Please fill in Batch Number and Expiry Date.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (editId) {
        await batchApi.update(editId, {
          batchNumber: formData.batchNumber.trim(),
          manufacturingDate: formData.manufacturingDate,
          expiryDate: formData.expiryDate,
          unitCost: Number(formData.unitCost)
        });
        setSuccess("Batch updated successfully.");
      } else {
        await batchApi.create({
          medicineId: Number(formData.medicineId),
          batchNumber: formData.batchNumber.trim(),
          manufacturingDate: formData.manufacturingDate,
          expiryDate: formData.expiryDate,
          initialQuantity: Number(formData.initialQuantity),
          unitCost: Number(formData.unitCost)
        });
        setSuccess("Batch created successfully.");
      }

      if (onSuccess) {
        onSuccess();
      } else {
        setTimeout(() => navigate("/batches"), 600);
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
      navigate("/batches");
    }
  };

  if (fetching) {
    return <Loader message="Loading batch details..." />;
  }

  return (
    <div className="form-card-container">
      <div className="form-header">
        <h3>{editId ? `Edit Batch (#${editId})` : "Add New Medicine Batch"}</h3>
        <p className="form-description">
          Define lot number, manufacture date, shelf expiry, initial stock level, and procurement unit cost.
        </p>
      </div>

      {error && <div className="message-error">{error}</div>}
      {success && <div className="message-success">{success}</div>}

      <form className="simple-form" onSubmit={handleSubmit}>
        <div className="form-row">
          {!editId && (
            <FormField label="Target Medicine" required>
              <select
                value={formData.medicineId}
                onChange={(e) => setFormData({ ...formData, medicineId: e.target.value })}
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
            </FormField>
          )}

          <FormField label="Batch Lot Number" required>
            <input
              type="text"
              value={formData.batchNumber}
              onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
              placeholder="e.g. BAT-2024-001"
              required
              className="form-control"
            />
          </FormField>
        </div>

        <div className="form-row">
          <FormField label="Manufacturing Date" required>
            <input
              type="date"
              value={formData.manufacturingDate}
              onChange={(e) => setFormData({ ...formData, manufacturingDate: e.target.value })}
              required
              className="form-control"
            />
          </FormField>

          <FormField label="Expiry Date" required hint="Used by the FEFO dispensing engine.">
            <input
              type="date"
              value={formData.expiryDate}
              onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
              required
              className="form-control"
            />
          </FormField>
        </div>

        <div className="form-row">
          {!editId && (
            <FormField label="Initial Received Quantity" required>
              <input
                type="number"
                min="1"
                value={formData.initialQuantity}
                onChange={(e) => setFormData({ ...formData, initialQuantity: e.target.value })}
                required
                className="form-control"
              />
            </FormField>
          )}

          <FormField label="Unit Cost (PKR)" required>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.unitCost}
              onChange={(e) => setFormData({ ...formData, unitCost: e.target.value })}
              required
              className="form-control"
            />
          </FormField>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Saving..." : editId ? "Update Batch" : "Save Batch"}
          </button>
          <button type="button" className="btn-secondary" onClick={handleCancelClick} disabled={loading}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
