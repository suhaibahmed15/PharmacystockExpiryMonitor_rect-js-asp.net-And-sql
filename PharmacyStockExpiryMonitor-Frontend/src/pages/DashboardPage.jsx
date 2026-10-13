import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import {
  getDashboardSummaryApi,
  getAlertsApi,
  getErrorMessage
} from "../services/api";
import "../styles/Dashboard.css";

export default function DashboardPage({ currentUser }) {
  // 1. Detect logged-in user role
  const storedUser = currentUser || (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  })();

  const detectRole = (roleStr) => {
    const lower = (roleStr || "").toLowerCase();
    if (lower.includes("pharmacist")) return "Pharmacist";
    if (lower.includes("manager")) return "StoreManager";
    return "Admin";
  };

  const userRole = detectRole(storedUser?.role);

  // 2. Data State
  const [summary, setSummary] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [sumRes, alertRes] = await Promise.allSettled([
        getDashboardSummaryApi(),
        getAlertsApi()
      ]);

      if (sumRes.status === "fulfilled") setSummary(sumRes.value.data);
      if (alertRes.status === "fulfilled") setAlerts(alertRes.value.data || []);
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
      default:
        return "General";
    }
  };

  // Simple monthly bar chart data
  const chartData = [
    { month: "May", StockOnHand: 320, Dispensed: 180 },
    { month: "Jun", StockOnHand: 410, Dispensed: 220 },
    { month: "Jul", StockOnHand: 390, Dispensed: 260 },
    { month: "Aug", StockOnHand: 520, Dispensed: 310 },
    { month: "Sep", StockOnHand: 480, Dispensed: 290 },
    {
      month: "Oct",
      StockOnHand: summary?.totalMedicines ? summary.totalMedicines * 25 : 560,
      Dispensed: 340
    }
  ];

  return (
    <div className="container dashboard-container">
      {/* Title automatically reflects the user's role */}
      <div className="dashboard-title">
        {userRole === "Pharmacist" && "Pharmacist Dashboard"}
        {userRole === "StoreManager" && "Store Manager Dashboard"}
        {userRole === "Admin" && "Admin Dashboard"}
      </div>
      <div className="dashboard-subtitle">
        Welcome, {storedUser?.fullName || "User"} (Logged in as: {storedUser?.role || "Pharmacist"})
      </div>

      {error && <div className="message-error">{error}</div>}

      {loading ? (
        <p>Loading dashboard...</p>
      ) : (
        <>
          {/* ========================================= */}
          {/* 1. PHARMACIST VIEW                        */}
          {/* ========================================= */}
          {userRole === "Pharmacist" && (
            <>
              {summary?.expiredCount > 0 ? (
                <div className="notice-box notice-danger">
                  <strong>Notice:</strong> You have {summary.expiredCount} expired batch(es). Please quarantine them from dispensing shelves.
                </div>
              ) : summary?.nearExpiryCount > 0 ? (
                <div className="notice-box notice-warning">
                  <strong>Notice:</strong> {summary.nearExpiryCount} batch(es) are expiring within 90 days. Please prioritize dispensing these first.
                </div>
              ) : null}

              <div className="cards-row">
                <Link to="/batches" className="card-item">
                  <h4>Expired Stock</h4>
                  <div className="card-number" style={{ color: "#dc3545" }}>
                    {summary?.expiredCount ?? 0}
                  </div>
                  <div className="card-link-text">View Batches</div>
                </Link>

                <Link to="/batches" className="card-item">
                  <h4>Near Expiry (90 Days)</h4>
                  <div className="card-number" style={{ color: "#ffc107" }}>
                    {summary?.nearExpiryCount ?? 0}
                  </div>
                  <div className="card-link-text">View Batches</div>
                </Link>

                <Link to="/alerts" className="card-item">
                  <h4>Low Stock Items</h4>
                  <div className="card-number" style={{ color: "#fd7e14" }}>
                    {summary?.lowStockCount ?? 0}
                  </div>
                  <div className="card-link-text">View Alerts</div>
                </Link>

                <Link to="/batches" className="card-item">
                  <h4>Batches in Stock</h4>
                  <div className="card-number" style={{ color: "#198754" }}>
                    {summary?.totalBatches ?? 0}
                  </div>
                  <div className="card-link-text">View Batches</div>
                </Link>
              </div>

              <div className="action-buttons">
                <Link to="/transactions">Record Dispensing</Link>
                <Link to="/batches">Check Batches</Link>
                <Link to="/alerts">View Stock Alerts</Link>
                <Link to="/medicines">Medicines Directory</Link>
              </div>
            </>
          )}

          {/* ========================================= */}
          {/* 2. STORE MANAGER VIEW                     */}
          {/* ========================================= */}
          {userRole === "StoreManager" && (
            <>
              <div className="cards-row">
                <Link to="/medicines" className="card-item">
                  <h4>Low Stock Items</h4>
                  <div className="card-number" style={{ color: "#fd7e14" }}>
                    {summary?.lowStockCount ?? 0}
                  </div>
                  <div className="card-link-text">View Medicines</div>
                </Link>

                <Link to="/purchases" className="card-item">
                  <h4>Total Purchases</h4>
                  <div className="card-number" style={{ color: "#198754" }}>
                    ${(summary?.totalPurchaseAmount ?? 0).toLocaleString()}
                  </div>
                  <div className="card-link-text">View Purchases</div>
                </Link>

                <Link to="/batches" className="card-item">
                  <h4>Total Batches</h4>
                  <div className="card-number">
                    {summary?.totalBatches ?? 0}
                  </div>
                  <div className="card-link-text">View Batches</div>
                </Link>

                <Link to="/suppliers" className="card-item">
                  <h4>Suppliers</h4>
                  <div className="card-number">
                    {summary?.totalSuppliers ?? 0}
                  </div>
                  <div className="card-link-text">View Suppliers</div>
                </Link>
              </div>

              <div className="action-buttons">
                <Link to="/purchases">New Purchase Order</Link>
                <Link to="/batches">Add Batch (Stock In)</Link>
                <Link to="/suppliers">Suppliers List</Link>
                <Link to="/categories">Categories</Link>
              </div>
            </>
          )}

          {/* ========================================= */}
          {/* 3. ADMIN VIEW                             */}
          {/* ========================================= */}
          {userRole === "Admin" && (
            <>
              <div className="cards-row">
                <Link to="/medicines" className="card-item">
                  <h4>Total Medicines</h4>
                  <div className="card-number">
                    {summary?.totalMedicines ?? 0}
                  </div>
                  <div className="card-link-text">View Medicines</div>
                </Link>

                <Link to="/categories" className="card-item">
                  <h4>Categories</h4>
                  <div className="card-number">
                    {summary?.totalCategories ?? 0}
                  </div>
                  <div className="card-link-text">View Categories</div>
                </Link>

                <Link to="/suppliers" className="card-item">
                  <h4>Suppliers</h4>
                  <div className="card-number">
                    {summary?.totalSuppliers ?? 0}
                  </div>
                  <div className="card-link-text">View Suppliers</div>
                </Link>

                <Link to="/batches" className="card-item">
                  <h4>Total Batches</h4>
                  <div className="card-number">
                    {summary?.totalBatches ?? 0}
                  </div>
                  <div className="card-link-text">View Batches</div>
                </Link>

                <Link to="/alerts" className="card-item">
                  <h4>Low Stock Items</h4>
                  <div className="card-number" style={{ color: "#fd7e14" }}>
                    {summary?.lowStockCount ?? 0}
                  </div>
                  <div className="card-link-text">View Alerts</div>
                </Link>

                <Link to="/batches" className="card-item">
                  <h4>Expired Stock</h4>
                  <div className="card-number" style={{ color: "#dc3545" }}>
                    {summary?.expiredCount ?? 0}
                  </div>
                  <div className="card-link-text">View Batches</div>
                </Link>
              </div>

              <div className="action-buttons">
                <Link to="/users">Manage Users</Link>
                <Link to="/transactions">Stock Ledger</Link>
                <Link to="/alerts">All Alerts</Link>
              </div>
            </>
          )}

          {/* ========================================= */}
          {/* SIMPLE BAR CHART                          */}
          {/* ========================================= */}
          <div className="simple-box">
            <h3>Monthly Stock Movement (Bar Chart)</h3>
            <p style={{ margin: "0 0 10px 0", fontSize: "12px", color: "#666" }}>
              Overview of warehouse stock on hand vs units dispensed.
            </p>
            <div style={{ width: "100%", height: 230 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 10, right: 15, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#eeeeee" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                  <Bar dataKey="StockOnHand" name="Stock on Hand" fill="#0d6efd" />
                  <Bar dataKey="Dispensed" name="Dispensed Units" fill="#198754" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ========================================= */}
          {/* RECENT ALERTS TABLE                       */}
          {/* ========================================= */}
          <div className="simple-box">
            <h3>Recent Stock & Expiry Alerts</h3>
            <div className="table-container">
              <table className="simple-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Message</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {alerts.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ textAlign: "center", padding: "12px" }}>
                        No alerts logged.
                      </td>
                    </tr>
                  ) : (
                    alerts.slice(0, 5).map((alert) => (
                      <tr key={alert.id}>
                        <td>{getAlertTypeName(alert.alertType)}</td>
                        <td>{alert.message}</td>
                        <td>
                          {alert.isResolved ? (
                            <span style={{ color: "#198754", fontWeight: "bold" }}>
                              Resolved
                            </span>
                          ) : (
                            <span style={{ color: "#dc3545", fontWeight: "bold" }}>
                              Active
                            </span>
                          )}
                        </td>
                        <td>{new Date(alert.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
