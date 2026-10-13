import React, { useEffect, useState } from "react";
import {
  getAlertsApi,
  markAlertAsReadApi,
  resolveAlertApi,
  createAlertApi,
  getMedicinesApi,
  getErrorMessage
} from "../services/api";
import Pagination from "../components/Pagination";
import "../styles/Alerts.css";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filter, setFilter] = useState("all"); // 'all' | 'unresolved' | 'unread'
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    medicineId: "",
    batchId: "",
    alertType: 1, // 1: LowStock, 2: NearExpiry, 3: Expired, 4: StockOut
    message: ""
  });

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [alertsRes, medRes] = await Promise.all([
        getAlertsApi(),
        getMedicinesApi({ page: 1, pageSize: 100 })
      ]);
      setAlerts(alertsRes.data || []);
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

  const getAlertTypeName = (type) => {
    switch (type) {
      case 1:
        return "Low Stock";
      case 2:
        return "Near Expiry";
      case 3:
        return "Expired";
      case 4:
        return "Stock Out";
      default:
        return `Type #${type}`;
    }
  };

  const handleMarkAsRead = async (id) => {
    setError("");
    setSuccess("");
    try {
      await markAlertAsReadApi(id);
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
      await resolveAlertApi(id);
      setSuccess("Alert resolved successfully.");
      loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleCreateAlert = async (e) => {
    e.preventDefault();
    if (!formData.medicineId || !formData.message) {
      setError("Medicine and message are required.");
      return;
    }

    try {
      await createAlertApi({
        medicineId: Number(formData.medicineId),
        batchId: formData.batchId ? Number(formData.batchId) : null,
        alertType: Number(formData.alertType),
        message: formData.message
      });
      setSuccess("Alert created successfully.");
      setShowForm(false);
      loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  // Filter alerts: resolved, unresolved, readed, unreaded
  const filteredAlerts = alerts.filter((a) => {
    if (filter === "resolved") return a.isResolved;
    if (filter === "unresolved") return !a.isResolved;
    if (filter === "readed" || filter === "read") return a.isRead;
    if (filter === "unreaded" || filter === "unread") return !a.isRead;
    return true;
  });

  return (
    <div className="container">
      <h1>Stock & Expiry Alerts</h1>

      {error && <div className="message-error">{error}</div>}
      {success && <div className="message-success">{success}</div>}

      <div className="alerts-top-bar">
        <div>
          <label style={{ fontSize: "13px", fontWeight: "bold", marginRight: "8px" }}>
            Alert Status:
          </label>
          <select
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setPage(1);
            }}
            style={{ padding: "5px 10px", borderRadius: "4px", border: "1px solid #cbd5e1" }}
          >
            <option value="all">All Alerts</option>
            <option value="resolved">Resolved</option>
            <option value="unresolved">Unresolved</option>
            <option value="readed">Readed</option>
            <option value="unreaded">Unreaded</option>
          </select>
        </div>

        <button
          className="btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Close Form" : "+ Create Custom Alert"}
        </button>
      </div>

      {showForm && (
        <form className="simple-form" onSubmit={handleCreateAlert}>
          <h3>Create Custom Alert</h3>
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
              <label>Alert Type *</label>
              <select
                value={formData.alertType}
                onChange={(e) =>
                  setFormData({ ...formData, alertType: e.target.value })
                }
              >
                <option value={1}>Low Stock Warning</option>
                <option value={2}>Near Expiry Alert</option>
                <option value={3}>Expired Quarantine Alert</option>
                <option value={4}>Stock Out Warning</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Alert Message *</label>
            <input
              type="text"
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
              placeholder="e.g. Critical stock depletion noticed during physical audit"
              required
            />
          </div>

          <div>
            <button type="submit" className="btn-primary" style={{ marginRight: "10px" }}>
              Save Alert
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
        <p>Loading alerts...</p>
      ) : (
        <div className="table-container">
          <table className="simple-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Type</th>
                <th>Medicine ID</th>
                <th>Message</th>
                <th>Read Status</th>
                <th>Resolution</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAlerts.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center" }}>
                    No alerts found for this filter.
                  </td>
                </tr>
              ) : (
                filteredAlerts
                  .slice((page - 1) * pageSize, page * pageSize)
                  .map((a) => (
                    <tr key={a.id} className={!a.isRead ? "alert-unread" : ""}>
                      <td>{a.id}</td>
                      <td>
                        <strong>{getAlertTypeName(a.alertType)}</strong>
                      </td>
                      <td>Medicine #{a.medicineId}</td>
                      <td>{a.message}</td>
                      <td>
                        {a.isRead ? (
                          <span style={{ color: "gray" }}>Read</span>
                        ) : (
                          <span className="status-unread-tag">Unread</span>
                        )}
                      </td>
                      <td>
                        {a.isResolved ? (
                          <span className="status-resolved-tag">
                            Resolved ({new Date(a.resolvedAt).toLocaleDateString()})
                          </span>
                        ) : (
                          <span style={{ color: "#cc0000", fontWeight: "bold" }}>
                            Unresolved
                          </span>
                        )}
                      </td>
                      <td>{new Date(a.createdAt).toLocaleString()}</td>
                      <td>
                        {!a.isRead && (
                          <button
                            className="btn-secondary btn-small"
                            onClick={() => handleMarkAsRead(a.id)}
                          >
                            Mark Read
                          </button>
                        )}
                        {!a.isResolved && (
                          <button
                            className="btn-success btn-small"
                            onClick={() => handleResolve(a.id)}
                          >
                            Resolve
                          </button>
                        )}
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
            totalCount={filteredAlerts.length}
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
