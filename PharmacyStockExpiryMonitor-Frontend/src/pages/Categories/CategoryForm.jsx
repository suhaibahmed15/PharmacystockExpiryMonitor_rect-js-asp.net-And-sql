import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import categoryApi from "../../api/categoryApi";
import { getErrorMessage } from "../../api/axiosClient";
import FormField from "../../components/common/FormField";
import Loader from "../../components/common/Loader";

export default function CategoryForm({
  editId: propEditId,
  initialData = null,
  onSuccess,
  onCancel
}) {
  const { id: paramId } = useParams();
  const editId = propEditId || paramId;
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(Boolean(editId && !initialData));
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    isActive: initialData?.isActive ?? true
  });

  useEffect(() => {
    if (editId && !initialData) {
      const fetchCategory = async () => {
        setFetching(true);
        try {
          const res = await categoryApi.getById(editId);
          const cat = res.data;
          setFormData({
            name: cat.name,
            description: cat.description || "",
            isActive: cat.isActive
          });
        } catch (err) {
          setError(getErrorMessage(err));
        } finally {
          setFetching(false);
        }
      };
      fetchCategory();
    }
  }, [editId, initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("Category Name is required.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (editId) {
        await categoryApi.update(editId, {
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          isActive: formData.isActive
        });
        setSuccess("Category updated successfully.");
      } else {
        await categoryApi.create({
          name: formData.name.trim(),
          description: formData.description.trim() || null
        });
        setSuccess("Category created successfully.");
      }

      if (onSuccess) {
        onSuccess();
      } else {
        setTimeout(() => navigate("/categories"), 600);
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
      navigate("/categories");
    }
  };

  if (fetching) {
    return <Loader message="Loading category details..." />;
  }

  return (
    <div className="form-card-container">
      <div className="form-header">
        <h3>{editId ? `Edit Category (#${editId})` : "Add New Category"}</h3>
        <p className="form-description">
          Group medicines logically (e.g. Antibiotics, Analgesics, Cardiovascular, Antiseptics).
        </p>
      </div>

      {error && <div className="message-error">{error}</div>}
      {success && <div className="message-success">{success}</div>}

      <form className="simple-form" onSubmit={handleSubmit}>
        <FormField label="Category Name" required>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Antibiotics"
            required
            autoFocus
            className="form-control"
          />
        </FormField>

        <FormField label="Description">
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Optional therapeutic classification notes"
            rows="3"
            className="form-control"
          />
        </FormField>

        {editId && (
          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              />
              <span>Active Category</span>
            </label>
          </div>
        )}

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Saving..." : editId ? "Update Category" : "Save Category"}
          </button>
          <button type="button" className="btn-secondary" onClick={handleCancelClick} disabled={loading}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
