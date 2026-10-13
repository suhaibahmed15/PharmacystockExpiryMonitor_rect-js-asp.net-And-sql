import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import supplierApi from "../../api/supplierApi";
import { getErrorMessage } from "../../api/axiosClient";
import FormField from "../../components/common/FormField";
import Loader from "../../components/common/Loader";

export default function SupplierForm({
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
    contactPerson: initialData?.contactPerson || "",
    phone: initialData?.phone || "",
    email: initialData?.email || "",
    address: initialData?.address || "",
    isActive: initialData?.isActive ?? true
  });

  useEffect(() => {
    if (editId && !initialData) {
      const fetchSupplier = async () => {
        setFetching(true);
        try {
          const res = await supplierApi.getById(editId);
          const sup = res.data;
          setFormData({
            name: sup.name,
            contactPerson: sup.contactPerson || "",
            phone: sup.phone || "",
            email: sup.email || "",
            address: sup.address || "",
            isActive: sup.isActive
          });
        } catch (err) {
          setError(getErrorMessage(err));
        } finally {
          setFetching(false);
        }
      };
      fetchSupplier();
    }
  }, [editId, initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("Supplier Name is required.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (editId) {
        await supplierApi.update(editId, {
          name: formData.name.trim(),
          contactPerson: formData.contactPerson.trim() || null,
          phone: formData.phone.trim() || null,
          email: formData.email.trim() || null,
          address: formData.address.trim() || null,
          isActive: formData.isActive
        });
        setSuccess("Supplier updated successfully.");
      } else {
        await supplierApi.create({
          name: formData.name.trim(),
          contactPerson: formData.contactPerson.trim() || null,
          phone: formData.phone.trim() || null,
          email: formData.email.trim() || null,
          address: formData.address.trim() || null
        });
        setSuccess("Supplier added successfully.");
      }

      if (onSuccess) {
        onSuccess();
      } else {
        setTimeout(() => navigate("/suppliers"), 600);
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
      navigate("/suppliers");
    }
  };

  if (fetching) {
    return <Loader message="Loading supplier details..." />;
  }

  return (
    <div className="form-card-container">
      <div className="form-header">
        <h3>{editId ? `Edit Supplier (#${editId})` : "Add New Supplier"}</h3>
        <p className="form-description">
          Register pharmaceutical distributors, manufacturers, and licensed medical vendors.
        </p>
      </div>

      {error && <div className="message-error">{error}</div>}
      {success && <div className="message-success">{success}</div>}

      <form className="simple-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <FormField label="Supplier / Company Name" required>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Medico Global Distributors"
              required
              autoFocus
              className="form-control"
            />
          </FormField>

          <FormField label="Contact Person">
            <input
              type="text"
              value={formData.contactPerson}
              onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
              placeholder="e.g. John Doe (Sales Rep)"
              className="form-control"
            />
          </FormField>
        </div>

        <div className="form-row">
          <FormField label="Phone Number">
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+92 300 1234567"
              className="form-control"
            />
          </FormField>

          <FormField label="Email Address">
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="orders@medicoglobal.com"
              className="form-control"
            />
          </FormField>
        </div>

        <FormField label="Physical / Warehouse Address">
          <input
            type="text"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="Plot 12, Industrial Area, Sector 5"
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
              <span>Active Supplier (Eligible for purchase orders)</span>
            </label>
          </div>
        )}

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Saving..." : editId ? "Update Supplier" : "Save Supplier"}
          </button>
          <button type="button" className="btn-secondary" onClick={handleCancelClick} disabled={loading}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
