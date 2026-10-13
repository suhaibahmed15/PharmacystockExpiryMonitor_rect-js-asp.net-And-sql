import React, { useEffect, useState } from "react";
import alertApi from "../../api/alertApi";
import medicineApi from "../../api/medicineApi";
import { getErrorMessage } from "../../api/axiosClient";
import DataTable from "../../components/common/DataTable";
import StatusBadge from "../../components/common/StatusBadge";
import Modal from "../../components/common/Modal";
import FormField from "../../components/common/FormField";
import { ALERT_TYPE_LABELS } from "../../utils/constants";
import { formatDateTime } from "../../utils/formatters";

export default function AlertListPage() {
  const [alerts, setAlerts] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filter, setFilter] = useState("all"); // 'all' | 'unresolved' | 'resolved' | 'unread' | 'read'

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [formData, setFormData] = useState({
    medicineId: "",
    batchId: "",
    alertType: 1,
    message: ""
  });

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [alertsRes, medRes] = await Promise.all([
        alertApi.getAll(),
        medicineApi.getAll({ page: 1, pageSize: 100 })
      ]);
      setAlerts(alertsRes.data || []);
      const medList = medRes.data.items || medRes.data || [];
      setMedicines(medList);
      if (medList.length > 0 && !formData.medicineId) {
        setFormData((prev) => ({ ...prev, medicineId: medList[0].id }));
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleMarkAsRead = async (id) => {
    setError("");
    setSuccess("");
    try {
      await alertApi.markAsRead(id);
      setSuccess("Alert marked as read.");
      loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleResolve = async (id) => {
    setError("");
    setSuccess("");
    try {
      await alertApi.resolve(id);
      setSuccess("Alert marked as resolved.");
      loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleCreateAlert = async (e) => {
    e.preventDefault();
    if (!formData.medicineId || !formData.message.trim()) {
      setError("Medicine and message are required.");
      return;
    }

    setModalLoading(true);
    setError("");
    try {
      await alertApi.create({
        medicineId: Number(formData.medicineId),
        batchId: formData.batchId ? Number(formData.batchId) : null,
        alertType: Number(formData.alertType),
        message: formData.message.trim()
      });
      setSuccess("Custom alert triggered successfully.");
      setIsModalOpen(false);
      setFormData({
        medicineId: medicines[0]?.id || "",
        batchId: "",
        alertType: 1,
        message: ""
      });
      loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setModalLoading(false);
    }
  };

  const filteredAlerts = alerts.filter((a) => {
    if (filter === "resolved") return a.isResolved;
    if (filter === "unresolved") return !a.isResolved;
    if (filter === "read") return a.isRead;
    if (filter === "unread") return !a.isRead;
    return true;
  });

  const columns = [
    { key: "id", header: "ID", width: "60px" },
    {
      key: "alertType",
      header: "Alert Type",
      render: (row) => {
        let variant = "warning";
        if (row.alertType === 3) variant = "danger"; // expired
        if (row.alertType === 1) variant = "warning"; // low stock
        return (
          <StatusBadge
            variant={variant}
            label={ALERT_TYPE_LABELS[row.alertType] || `Type #${row.alertType}`}
          />
        );
      }
    },
    {
      key: "medicineName",
      header: "Medicine",
      render: (row) => row.medicineName || `Medicine #${row.medicineId}`
    },
    {
      key: "message",
      header: "Notice Message",
      render: (row) => <strong>{row.message}</strong>
    },
    {
      key: "isRead",
      header: "Read State",
      render: (row) => (
        <StatusBadge
          variant={row.isRead ? "neutral" : "warning"}
          label={row.isRead ? "Read" : "Unread"}
        />
      )
    },
    {
      key: "isResolved",
      header: "Resolution",
      render: (row) => (
        <StatusBadge
          status={row.isResolved ? "resolved" : "unresolved"}
          label={row.isResolved ? "Resolved" : "Unresolved"}
        />
      )
    },
    {
      key: "createdAt",
      header: "Created Time",
      render: (row) => formatDateTime(row.createdAt)
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <div className="table-actions">
          {!row.isRead && (
            <button
              type="button"
              className="btn-secondary btn-small"
              onClick={() => handleMarkAsRead(row.id)}
            >
              Mark Read
            </button>
          )}
          {!row.isResolved && (
            <button
              type="button"
              className="btn-success btn-small"
              onClick={() => handleResolve(row.id)}
            >
              Resolve
            </button>
          )}
        </div>
      )
    }
  ];

  const pagedData = filteredAlerts.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h1>Stock &amp; Expiry Alerts</h1>
          <p className="page-subtitle">
            Automated alerts for inventory stockouts, threshold depletions, and approaching shelf expirations.
          </p>
        </div>
        <button type="button" className="btn-primary" onClick={() => setIsModalOpen(true)}>
          + Create Custom Alert
        </button>
      </div>

      {error && <div className="message-error">{error}</div>}
      {success && <div className="message-success">{success}</div>}

      <div className="top-action-bar">
        <div className="filter-group-inline">
          <label style={{ fontSize: "13px", fontWeight: "600", marginRight: "8px" }}>
            Alert Status:
          </label>
          <select
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setPage(1);
            }}
            className="filter-select"
          >
            <option value="all">All Alerts</option>
            <option value="unresolved">Unresolved (Active)</option>
            <option value="resolved">Resolved</option>
            <option value="unread">Unread Only</option>
            <option value="read">Read Only</option>
          </select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={pagedData}
        loading={loading}
        emptyMessage="No alerts matching the selected status filter."
        pagination={{
          page,
          pageSize,
          totalCount: filteredAlerts.length,
          onPageChange: (p) => setPage(p),
          onPageSizeChange: (sz) => {
            setPageSize(sz);
            setPage(1);
          }
        }}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Custom Stock Alert"
        maxWidth="560px"
      >
        <form className="simple-form" onSubmit={handleCreateAlert}>
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

          <FormField label="Alert Classification" required>
            <select
              value={formData.alertType}
              onChange={(e) => setFormData({ ...formData, alertType: e.target.value })}
              className="form-control"
            >
              <option value={1}>Low Stock Warning</option>
              <option value={2}>Near Expiry Alert</option>
              <option value={3}>Expired Quarantine Alert</option>
              <option value={4}>Stock Out Emergency</option>
            </select>
          </FormField>

          <FormField label="Alert Notice Message" required>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="e.g. Critical depletion noticed during physical audit count"
              required
              rows="3"
              className="form-control"
            />
          </FormField>

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={modalLoading}>
              {modalLoading ? "Saving Alert..." : "Trigger Alert"}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setIsModalOpen(false)}
              disabled={modalLoading}
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
