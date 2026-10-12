import React, { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import {
  getDashboardSummary,
  getMedicines,
  getBatches,
  getAlerts,
  errorMessage
} from "../api";
import PharmacistDashboard from "../components/dashboard/PharmacistDashboard";
import StoreManagerDashboard from "../components/dashboard/StoreManagerDashboard";
import AdminDashboard from "../components/dashboard/AdminDashboard";

export default function DashboardPage({ onSetToast, currentUser }) {
  const [summary, setSummary] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [batches, setBatches] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const rawRole =
    currentUser?.role ||
    (() => {
      try {
        return JSON.parse(localStorage.getItem("pharmacy_user") || "{}")?.role;
      } catch {
        return "Admin";
      }
    })() ||
    "Admin";

  const isStoreManager =
    rawRole.toLowerCase() === "storemanager" ||
    rawRole.toLowerCase() === "manager";
  const isPharmacist = rawRole.toLowerCase() === "pharmacist";
  const isAdmin = !isStoreManager && !isPharmacist;

  async function loadDashboard() {
    setLoading(true);
    setError("");
    try {
      const [sumRes, medRes, batchRes, alertRes] = await Promise.allSettled([
        getDashboardSummary(),
        getMedicines({ page: 1, pageSize: 100 }),
        getBatches(),
        getAlerts()
      ]);

      if (sumRes.status === "fulfilled") {
        setSummary(sumRes.value);
      }
      if (medRes.status === "fulfilled") {
        setMedicines(medRes.value.data);
      }
      if (batchRes.status === "fulfilled") {
        setBatches(batchRes.value.data);
      }
      if (alertRes.status === "fulfilled") {
        setAlerts(alertRes.value.data);
      }
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const now = new Date();
  const nearExpiryBatches = batches
    .filter((b) => {
      const diffDays = Math.ceil(
        (new Date(b.expiryDate) - now) / (1000 * 60 * 60 * 24)
      );
      return diffDays <= 90;
    })
    .sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));

  const criticalExpiryBatches = nearExpiryBatches.filter((b) => {
    const diffDays = Math.ceil(
      (new Date(b.expiryDate) - now) / (1000 * 60 * 60 * 24)
    );
    return diffDays <= 30;
  });

  const lowStockMedicines = medicines
    .filter((m) => Number(m.currentStock || 0) <= Number(m.reorderLevel || 0))
    .sort((a, b) => Number(a.currentStock || 0) - Number(b.currentStock || 0));

  const trendData = [
    { month: "May", stock: 320, dispensed: 180 },
    { month: "Jun", stock: 410, dispensed: 220 },
    { month: "Jul", stock: 390, dispensed: 260 },
    { month: "Aug", stock: 520, dispensed: 310 },
    { month: "Sep", stock: 480, dispensed: 290 },
    {
      month: "Oct",
      stock: summary?.totalMedicines ? summary.totalMedicines * 25 : 560,
      dispensed: 340
    }
  ];

  return (
    <div className="page-content">
      {error && (
        <div className="error-banner">
          <AlertTriangle size={18} />
          <span>{error}</span>
          <button onClick={loadDashboard}>Retry</button>
        </div>
      )}

      {isPharmacist && (
        <PharmacistDashboard
          summary={summary}
          medicines={medicines}
          batches={batches}
          alerts={alerts}
          nearExpiryBatches={nearExpiryBatches}
          criticalExpiryBatches={criticalExpiryBatches}
          lowStockMedicines={lowStockMedicines}
          trendData={trendData}
          loading={loading}
          onRefresh={loadDashboard}
          onSetToast={onSetToast}
        />
      )}

      {isStoreManager && (
        <StoreManagerDashboard
          summary={summary}
          medicines={medicines}
          batches={batches}
          nearExpiryBatches={nearExpiryBatches}
          lowStockMedicines={lowStockMedicines}
          trendData={trendData}
          loading={loading}
          onRefresh={loadDashboard}
        />
      )}

      {isAdmin && (
        <AdminDashboard
          summary={summary}
          medicines={medicines}
          batches={batches}
          alerts={alerts}
          nearExpiryBatches={nearExpiryBatches}
          lowStockMedicines={lowStockMedicines}
          trendData={trendData}
          loading={loading}
          onRefresh={loadDashboard}
        />
      )}
    </div>
  );
}
