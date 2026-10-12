import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Pill,
  Boxes,
  Activity,
  CalendarClock,
  AlertOctagon,
  ShoppingCart,
  Users,
  Plus,
  RefreshCw,
  ChevronRight,
  AlertTriangle,
  Bell,
  CheckCircle2
} from "lucide-react";
import InventoryLineChart from "./InventoryLineChart";
import MedicineCell from "../MedicineCell";

export default function AdminDashboard({
  summary,
  medicines = [],
  batches = [],
  alerts = [],
  nearExpiryBatches = [],
  lowStockMedicines = [],
  trendData = [],
  loading = false,
  onRefresh
}) {
  const navigate = useNavigate();

  const unreadAlertsCount =
    summary?.unreadAlertsCount ?? alerts.filter((a) => !a.isRead).length;

  const formatPKR = (num) =>
    new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      maximumFractionDigits: 0
    }).format(Number(num || 0));

  const statCards = [
    {
      title: "Active Medicines",
      value: summary?.totalMedicines ?? medicines.length,
      desc: "Registered pharmaceutical products",
      icon: Pill,
      color: "brand",
      onClick: () => navigate("/medicines")
    },
    {
      title: "Batches in Stock",
      value: summary?.totalBatches ?? batches.length,
      desc: "Tracked manufacturing lots",
      icon: Boxes,
      color: "blue",
      onClick: () => navigate("/batches")
    },
    {
      title: "Low Stock Items",
      value: summary?.lowStockCount ?? lowStockMedicines.length,
      desc: "Items at or below reorder threshold",
      icon: Activity,
      color: "orange",
      urgent: (summary?.lowStockCount ?? lowStockMedicines.length) > 0,
      onClick: () => navigate("/medicines")
    },
    {
      title: "Near Expiry Batches",
      value: summary?.nearExpiryCount ?? nearExpiryBatches.length,
      desc: "Batches expiring within 90 days",
      icon: CalendarClock,
      color: "purple",
      urgent: (summary?.nearExpiryCount ?? nearExpiryBatches.length) > 0,
      onClick: () => navigate("/batches")
    },
    {
      title: "Expired Stock",
      value: summary?.expiredCount ?? 0,
      desc: "Batches past expiration date",
      icon: AlertOctagon,
      color: "red",
      urgent: (summary?.expiredCount ?? 0) > 0,
      onClick: () => navigate("/batches")
    },
    {
      title: "Total Purchases",
      value: formatPKR(summary?.totalPurchaseAmount ?? 0),
      desc: "Cumulative supplier orders value",
      icon: ShoppingCart,
      color: "emerald",
      onClick: () => navigate("/purchases")
    }
  ];

  return (
    <>
      {/* Header */}
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            <span>SYSTEM ADMINISTRATION & OVERVIEW</span>
          </div>
          <h1>Executive Dashboard</h1>
          <p>
            Complete operational oversight across inventory, batches, procurement, and system users.
          </p>
        </div>

        <div className="heading-actions">
          <button
            className="btn btn-light"
            onClick={onRefresh}
            disabled={loading}
          >
            <RefreshCw size={15} className={loading ? "spin" : ""} />
            Sync Data
          </button>
          <button
            className="btn btn-light"
            onClick={() => navigate("/users")}
          >
            <Users size={15} />
            Users & Roles
          </button>
          <button
            className="btn btn-primary"
            onClick={() => navigate("/batches")}
          >
            <Plus size={15} />
            Receive Batch
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="dashboard-metrics-grid">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`metric-card ${card.color} ${
                card.urgent ? "has-urgent" : ""
              }`}
              onClick={card.onClick}
              role="button"
              tabIndex={0}
            >
              <div className="metric-header">
                <span className="metric-title">{card.title}</span>
                <div className={`metric-icon-box ${card.color}`}>
                  <Icon size={17} />
                </div>
              </div>
              <div className="metric-value">{card.value}</div>
              <div className="metric-footer">
                <span>{card.desc}</span>
                <ChevronRight size={14} className="metric-arrow" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Middle Grid: Line Chart + System Attention */}
      <div className="dashboard-grid-columns">
        <InventoryLineChart
          title="Inventory Flow & Dispensation"
          subtitle="Monthly distribution snapshot across inventory"
          data={trendData}
          onViewLedger={() => navigate("/transactions")}
        />

        <section className="panel attention-panel">
          <div className="panel-head">
            <div>
              <h2>Immediate Attention</h2>
              <p>Critical inventory risks requiring action</p>
            </div>
            <button
              className="link-button"
              onClick={() => navigate("/alerts")}
            >
              All Alerts <ChevronRight size={13} />
            </button>
          </div>

          <div className="attention-items-list">
            <div
              className="attention-row warning"
              onClick={() => navigate("/batches")}
              role="button"
            >
              <div className="attention-icon orange">
                <CalendarClock size={18} />
              </div>
              <div className="attention-info">
                <b>Near Expiry Watchlist</b>
                <small>
                  {nearExpiryBatches.length} batches within 90-day threshold
                </small>
              </div>
              <span className="attention-badge orange">
                {nearExpiryBatches.length}
              </span>
              <ChevronRight size={15} />
            </div>

            <div
              className="attention-row alert"
              onClick={() => navigate("/medicines")}
              role="button"
            >
              <div className="attention-icon red">
                <AlertTriangle size={18} />
              </div>
              <div className="attention-info">
                <b>Replenishment Needed</b>
                <small>
                  {lowStockMedicines.length} medicines below reorder level
                </small>
              </div>
              <span className="attention-badge red">
                {lowStockMedicines.length}
              </span>
              <ChevronRight size={15} />
            </div>

            <div
              className="attention-row notice"
              onClick={() => navigate("/alerts")}
              role="button"
            >
              <div className="attention-icon purple">
                <Bell size={18} />
              </div>
              <div className="attention-info">
                <b>Unread System Alerts</b>
                <small>
                  {unreadAlertsCount} notifications pending review
                </small>
              </div>
              <span className="attention-badge purple">
                {unreadAlertsCount}
              </span>
              <ChevronRight size={15} />
            </div>
          </div>
        </section>
      </div>

      {/* Bottom Tables */}
      <div className="dashboard-grid-columns bottom-tables">
        {/* Table 1: Near-Expiry Batches (Watchlist) */}
        <section className="panel">
          <div className="panel-head">
            <div>
              <h2>Near-Expiry Batches (Watchlist)</h2>
              <p>Top batches requiring immediate FEFO rotation</p>
            </div>
            <button
              className="link-button"
              onClick={() => navigate("/batches")}
            >
              View Batches <ChevronRight size={13} />
            </button>
          </div>

          <div className="table-responsive">
            <table className="compact-table">
              <thead>
                <tr>
                  <th>BATCH #</th>
                  <th>MEDICINE</th>
                  <th>EXPIRY</th>
                  <th>REMAINING</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {nearExpiryBatches.slice(0, 5).map((b) => {
                  const now = new Date();
                  const daysLeft = Math.ceil(
                    (new Date(b.expiryDate) - now) / (1000 * 60 * 60 * 24)
                  );
                  const isExpired = daysLeft < 0;
                  const isCritical = daysLeft <= 30;

                  return (
                    <tr key={b.id}>
                      <td>
                        <strong className="code-badge">
                          {b.batchNumber}
                        </strong>
                      </td>
                      <td>
                        <b>{b.medicineName || `Medicine #${b.medicineId}`}</b>
                      </td>
                      <td>
                        {new Date(b.expiryDate).toLocaleDateString("en-GB")}
                      </td>
                      <td>
                        <b>{b.remainingQuantity}</b> units
                      </td>
                      <td>
                        <span
                          className={`pill-status ${
                            isExpired
                              ? "status-danger"
                              : isCritical
                              ? "status-urgent"
                              : "status-warning"
                          }`}
                        >
                          {isExpired ? "EXPIRED" : `${daysLeft}d left`}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {nearExpiryBatches.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-4 text-muted">
                      <CheckCircle2
                        size={16}
                        className="inline-icon text-success"
                      />{" "}
                      All active batches are safely within shelf-life thresholds.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Table 2: Low Stock Alert Items */}
        <section className="panel">
          <div className="panel-head">
            <div>
              <h2>Low Stock Alert Items</h2>
              <p>Medicines requiring replenishment from suppliers</p>
            </div>
            <button
              className="link-button"
              onClick={() => navigate("/medicines")}
            >
              Catalog <ChevronRight size={13} />
            </button>
          </div>

          <div className="table-responsive">
            <table className="compact-table">
              <thead>
                <tr>
                  <th>CODE</th>
                  <th>MEDICINE</th>
                  <th>CURRENT STOCK</th>
                  <th>REORDER AT</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {lowStockMedicines.slice(0, 5).map((m) => (
                  <tr key={m.id}>
                    <td>
                      <span className="code-badge">{m.medicineCode}</span>
                    </td>
                    <td>
                      <MedicineCell
                        name={m.name}
                        genericName={m.genericName}
                      />
                    </td>
                    <td>
                      <span className="text-danger font-bold">
                        {m.currentStock || 0}
                      </span>{" "}
                      units
                    </td>
                    <td>{m.reorderLevel} units</td>
                    <td>
                      <button
                        className="btn btn-xs btn-primary"
                        onClick={() => navigate("/purchases")}
                      >
                        Order
                      </button>
                    </td>
                  </tr>
                ))}
                {lowStockMedicines.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-4 text-muted">
                      <CheckCircle2
                        size={16}
                        className="inline-icon text-success"
                      />{" "}
                      Stock levels for all catalog medicines are above reorder thresholds.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  );
}
