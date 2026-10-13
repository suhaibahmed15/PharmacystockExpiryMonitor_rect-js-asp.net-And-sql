import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import medicineApi from "../../api/medicineApi";
import categoryApi from "../../api/categoryApi";
import { getErrorMessage } from "../../api/axiosClient";
import FormField from "../../components/common/FormField";
import Loader from "../../components/common/Loader";

export default function MedicineForm({
  editId: propEditId,
  initialData = null,
  onSuccess,
  onCancel
}) {
  const { id: paramId } = useParams();
  const editId = propEditId || paramId;
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(Boolean(editId && !initialData));
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    medicineCode: initialData?.medicineCode || `MED-${Math.floor(100 + Math.random() * 900)}`,
    name: initialData?.name || "",
    genericName: initialData?.genericName || "",
    description: initialData?.description || "",
    categoryId: initialData?.categoryId || "",
    reorderLevel: initialData?.reorderLevel ?? 20,
    isActive: initialData?.isActive ?? true
  });

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await categoryApi.getAll({ page: 1, pageSize: 100 });
        const list = res.data.items || res.data || [];
        setCategories(list);
        if (list.length > 0 && !formData.categoryId) {
          setFormData((prev) => ({ ...prev, categoryId: list[0].id }));
        }
      } catch {
        // ignore
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    if (editId && !initialData) {
      const fetchMedicine = async () => {
        setFetching(true);
        try {
          const res = await medicineApi.getById(editId);
          const med = res.data;
          setFormData({
            medicineCode: med.medicineCode,
            name: med.name,
            genericName: med.genericName || "",
            description: med.description || "",
            categoryId: med.categoryId,
            reorderLevel: med.reorderLevel,
            isActive: med.isActive
          });
        } catch (err) {
          setError(getErrorMessage(err));
        } finally {
          setFetching(false);
        }
      };
      fetchMedicine();
    }
  }, [editId, initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.name.trim() || !formData.medicineCode.trim() || !formData.categoryId) {
      setError("Please fill in Medicine Code, Name, and Category.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        medicineCode: formData.medicineCode.trim(),
        name: formData.name.trim(),
        genericName: formData.genericName.trim() || null,
        description: formData.description.trim() || null,
        categoryId: Number(formData.categoryId),
        reorderLevel: Number(formData.reorderLevel),
        ...(editId ? { isActive: formData.isActive } : {})
      };

      if (editId) {
        await medicineApi.update(editId, payload);
        setSuccess("Medicine updated successfully.");
      } else {
        await medicineApi.create(payload);
        setSuccess("Medicine created successfully.");
      }

      if (onSuccess) {
        onSuccess();
      } else {
        setTimeout(() => navigate("/medicines"), 600);
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
      navigate("/medicines");
    }
  };

  if (fetching) {
    return <Loader message="Loading medicine details..." />;
  }

  return (
    <div className="form-card-container">
      <div className="form-header">
        <h3>{editId ? `Edit Medicine (#${editId})` : "Add New Medicine"}</h3>
        <p className="form-description">
          Enter product identifiers, generic formulation, category classification, and reorder safety thresholds.
        </p>
      </div>

      {error && <div className="message-error">{error}</div>}
      {success && <div className="message-success">{success}</div>}

      <form className="simple-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <FormField label="Medicine Code" required>
            <input
              type="text"
              value={formData.medicineCode}
              onChange={(e) => setFormData({ ...formData, medicineCode: e.target.value })}
              placeholder="e.g. MED-101"
              required
              className="form-control"
            />
          </FormField>

          <FormField label="Brand / Medicine Name" required>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Paracetamol 500mg"
              required
              className="form-control"
            />
          </FormField>
        </div>

        <div className="form-row">
          <FormField label="Generic Name / Molecule">
            <input
              type="text"
              value={formData.genericName}
              onChange={(e) => setFormData({ ...formData, genericName: e.target.value })}
              placeholder="e.g. Acetaminophen"
              className="form-control"
            />
          </FormField>

          <FormField label="Category" required>
            <select
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              required
              className="form-control"
            >
              <option value="">-- Select Category --</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        <div className="form-row">
          <FormField
            label="Reorder Safety Threshold (Min Stock)"
            required
            hint="System triggers Low Stock alerts when stock is at or below this level."
          >
            <input
              type="number"
              min="0"
              value={formData.reorderLevel}
              onChange={(e) => setFormData({ ...formData, reorderLevel: e.target.value })}
              required
              className="form-control"
            />
          </FormField>

          <FormField label="Description / Instructions">
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Dosage form, storage requirements, etc."
              className="form-control"
            />
          </FormField>
        </div>

        {editId && (
          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              />
              <span>Active in inventory (Available for prescribing &amp; dispensing)</span>
            </label>
          </div>
        )}

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Saving..." : editId ? "Update Medicine" : "Save Medicine"}
          </button>
          <button type="button" className="btn-secondary" onClick={handleCancelClick} disabled={loading}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
