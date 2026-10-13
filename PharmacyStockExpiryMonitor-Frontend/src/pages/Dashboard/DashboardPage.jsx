import React from "react";
// import { useEffect, useState } from "react";
// import { Link } from "react-router-dom";
// import dashboardApi from "../../api/dashboardApi";
// import alertApi from "../../api/alertApi";
// import { getErrorMessage } from "../../api/axiosClient";
import useAuth from "../../hooks/useAuth";
// import StatCard from "../../components/dashboard/StatCard";
// import ExpiryChart from "../../components/dashboard/ExpiryChart";
// import StatusBadge from "../../components/common/StatusBadge";
// import Loader from "../../components/common/Loader";
// import { ALERT_TYPE_LABELS } from "../../utils/constants";
// import { formatCurrency, formatDate } from "../../utils/formatters";

export default function DashboardPage() {
  const { user, role } = useAuth();

  const roleName = user?.role || role || "User";

  return (
    <div style={{ padding: "32px", fontSize: "24px", fontWeight: "600", color: "#0f172a" }}>
      Welcome back {roleName}
    </div>
  );
}

/* =========================================================================
   TEMPORARILY COMMENTED OUT ORIGINAL DASHBOARD METRICS & WIDGETS
   =========================================================================
// const [summary, setSummary] = useState(null);
// const [alerts, setAlerts] = useState([]);
// const [loading, setLoading] = useState(true);
// const [error, setError] = useState("");
      // const [alerts, setAlerts] = useState([]);
      // const [loading, setLoading] = useState(true);
      // const [error, setError] = useState("");
      //
      // const loadData = async () => {
      //   setLoading(true);
      //   setError("");
      //   try {
      //     const [sumRes, alertRes] = await Promise.allSettled([
      //       dashboardApi.getSummary(),
      //       alertApi.getAll()
      //     ]);
      //     if (sumRes.status === "fulfilled") setSummary(sumRes.value.data);
      //     if (alertRes.status === "fulfilled") setAlerts(alertRes.value.data || []);
      //   } catch (err) {
      //     setError(getErrorMessage(err));
      //   } finally {
      //     setLoading(false);
      //   }
      // };
      //
      // useEffect(() => {
      //   loadData();
      // }, []);
      //
      // const chartData = [
      //   { month: "May", StockOnHand: 320, Dispensed: 180 },
      //   { month: "Jun", StockOnHand: 410, Dispensed: 220 },
      //   { month: "Jul", StockOnHand: 390, Dispensed: 260 },
      //   { month: "Aug", StockOnHand: 520, Dispensed: 310 },
      //   { month: "Sep", StockOnHand: 480, Dispensed: 290 },
      //   {
      //     month: "Oct",
      //     StockOnHand: summary?.totalMedicines ? summary.totalMedicines * 25 : 560,
      //     Dispensed: 340
      //   }
      // ];
      //
      // {loading ? (
      //   <Loader message="Loading dashboard metrics..." />
      // ) : (
      //   <>
      //     {userRole === "Pharmacist" && (
      //       <div className="cards-row">
      //         <StatCard title="Expired Stock" value={summary?.expiredCount ?? 0} />
      //         <StatCard title="Near Expiry (90 Days)" value={summary?.nearExpiryCount ?? 0} />
      //         <StatCard title="Low Stock Items" value={summary?.lowStockCount ?? 0} />
      //         <StatCard title="Batches in Stock" value={summary?.totalBatches ?? 0} />
      //       </div>
      //     )}
      //     {userRole === "StoreManager" && (
      //       <div className="cards-row">
      //         <StatCard title="Low Stock Items" value={summary?.lowStockCount ?? 0} />
      //         <StatCard title="Total Purchases" value={formatCurrency(summary?.totalPurchaseAmount ?? 0)} />
      //         <StatCard title="Total Batches" value={summary?.totalBatches ?? 0} />
      //         <StatCard title="Active Suppliers" value={summary?.totalSuppliers ?? 0} />
      //       </div>
      //     )}
      //     {userRole === "Admin" && (
      //       <div className="cards-row admin-cards-grid">
      //         <StatCard title="Total Medicines" value={summary?.totalMedicines ?? 0} />
      //         <StatCard title="Categories" value={summary?.totalCategories ?? 0} />
      //         <StatCard title="Suppliers" value={summary?.totalSuppliers ?? 0} />
      //         <StatCard title="Total Batches" value={summary?.totalBatches ?? 0} />
      //       </div>
      //     )}
      //     <ExpiryChart data={chartData} title="Monthly Stock In vs Dispensed Movement" />
      //   </>
      // )}
*/

