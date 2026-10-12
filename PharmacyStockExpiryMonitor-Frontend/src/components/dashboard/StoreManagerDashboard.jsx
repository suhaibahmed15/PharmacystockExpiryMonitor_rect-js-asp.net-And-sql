import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Boxes,
  Activity,
  ShoppingCart,
  AlertOctagon,
  CalendarClock,
  Pill,
  RefreshCw,
  ChevronRight,
  AlertTriangle,
  CheckCircle2
} from "lucide-react";
import InventoryLineChart from "./InventoryLineChart";
import MedicineCell from "../MedicineCell";

export default function StoreManagerDashboard({
  summary,
  medicines = [],
  batches = [],
  nearExpiryBatches = [],
  lowStockMedicines = [],
  trendData = [],
  loading = false,
  onRefresh
}) {
  const navigate = useNavigate();

  const formatPKR = (num) =>
    new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      maximumFractionDigits: 0
    }).format(Number(num || 0));

  const statCards = [
    {
      title: "Batches in Stock",
      value: summary?.totalBatches ?? batches.length,
      desc: "Tracked inventory lots in warehouse",
      icon: Boxes,
      color: "blue",
      onClick: () => navigate("/batches")
    },
    {
      title: "Replenishment Needed",
      value: summary?.lowStockCount ?? lowStockMedicines.length,
      desc: "Medicines below reorder threshold",
      icon: Activity,
      color: "orange",
      urgent: (summary?.lowStockCount ?? lowStockMedicines.length) > 0,
      onClick: () => navigate("/medicines")
    },
    {
      title: "Procurement Spend",
      value: formatPKR(summary?.totalPurchaseAmount ?? 0),
      desc: "Total supplier purchase order spend",
      icon: ShoppingCart,
      color: "emerald",
      onClick: () => navigate("/purchases")
    },
    {
      title: "Expired Batches",
      value: summary?.expiredCount ?? 0,
      desc: "Batches for vendor return / write-off",
      icon: AlertOctagon,
      color: "red",
      urgent: (summary?.expiredCount ?? 0) > 0,
      onClick: () => navigate("/batches")
    },
    {
      title: "Near Expiry Lots (90d)",
      value: summary?.nearExpiryCount ?? nearExpiryBatches.length,
      desc: "Batches nearing 90-day threshold",
      icon: CalendarClock,
      color: "purple",
      urgent: (summary?.nearExpiryCount ?? nearExpiryBatches.length) > 0,
      onClick: () => navigate("/batches")
    },
    {
      title: "Catalogued Medicines",
      value: summary?.totalMedicines ?? medicines.length,
      desc: "Active registered pharmaceuticals",
      icon: Pill,
      color: "brand",
      onClick: () => navigate("/medicines")
    }
  ];

  return (
    <>
      {/* Header */}
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            <span>STORE & INVENTORY PROCUREMENT</span>
          </div>
          <h1>Store Manager Dashboard</h1>
          <p>
            Warehouse stock levels, replenishment orders, supplier contracts, and receiving lots.
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
            onClick={() => navigate("/batches")}
          >
            <Boxes size={15} />
            Batches
          </button>
          <button
            className="btn btn-primary"
            onClick={() => navigate("/purchases")}
          >
            <ShoppingCart size={15} />
            New Purchase Order
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

      {/* Middle Grid: Line Chart + Procurement Actions */}
      <div className="dashboard-grid-columns">
        <InventoryLineChart
          title="Inventory Balance & Dispensation Rate"
          subtitle="Stock on hand volume vs monthly customer consumption"
          data={trendData}
          onViewLedger={() => navigate("/transactions")}
        />

        <section className="panel attention-panel">
          <div className="panel-head">
            <div>
              <h2>Procurement & Reorder Action List</h2>
              <p>Reorder indicators and upcoming inventory risks</p>
            </div>
            <button
              className="link-button"
              onClick={() => navigate("/purchases")}
            >
              New Purchase <ChevronRight size={13} />
            </button>
          </div>

          <div className="attention-items-list">
            <div
              className="attention-row alert"
              onClick={() => navigate("/medicines")}
              role="button"
            >
              <div className="attention-icon red">
                <AlertTriangle size={18} />
              </div>
              <div className="attention-info">
                <b>Replenishment Reorder Queue</b>
                <small>
                  {lowStockMedicines.length} medicines below safe threshold
                </small>
              </div>
              <span className="attention-badge red">
                {lowStockMedicines.length}
              </span>
              <ChevronRight size={15} />
            </div>

            <div
              className="attention-row warning"
              onClick={() => navigate("/batches")}
              role="button"
            >
              <div className="attention-icon orange">
                <CalendarClock size={18} />
              </div>
              <div className="attention-info">
                <b>Batches Approaching Expiry</b>
                <small>
                  {nearExpiryBatches.length} lots to review before replenishment
                </small>
              </div>
              <span className="attention-badge orange">
                {nearExpiryBatches.length}
              </span>
              <ChevronRight size={15} />
            </div>

            <div
              className="attention-row notice"
              onClick={() => navigate("/purchases")}
              role="button"
            >
              <div className="attention-icon blue">
                <ShoppingCart size={18} />
              </div>
              <div className="attention-info">
                <b>Supplier Purchase Orders</b>
                <small>Review purchase orders and vendor receipts</small>
              </div>
              <span className="attention-badge blue">Orders</span>
              <ChevronRight size={15} />
            </div>
          </div>
        </section>
      </div>

      {/* Bottom Tables */}
      <div className="dashboard-grid-columns bottom-tables">
        {/* Table 1: Replenishment Reorder Queue */}
        <section className="panel">
          <div className="panel-head">
            <div>
              <h2>Replenishment Reorder Queue</h2>
              <p>Medicines below safe inventory threshold needing reorder</p>
            </div>
            <button
              className="link-button"
              onClick={() => navigate("/medicines")}
            >
              View All Catalog <ChevronRight size={13} />
            </button>
          </div>

          <div className="table-responsive">
            <table className="compact-table">
              <thead>
                <tr>
                  <th>CODE</th>
                  <th>MEDICINE</th>
                  <th>ON HAND</th>
                  <th>REORDER AT</th>
                  <th>DEFICIT</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {lowStockMedicines.slice(0, 5).map((m) => {
                  const current = Number(m.currentStock || 0);
                  const reorder = Number(m.reorderLevel || 0);
                  const deficit = Math.max(0, reorder - current);
                  return (
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
                          {current}
                        </span>{" "}
                        units
                      </td>
                      <td>{reorder} units</td>
                      <td>
                        <strong className="text-danger">+{deficit}</strong>
                      </td>
                      <td>
                        <button
                          className="btn btn-xs btn-primary"
                          onClick={() => navigate("/purchases")}
                          title="Create purchase order for this item"
                        >
                          <ShoppingCart size={11} /> Reorder
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {lowStockMedicines.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-4 text-muted">
                      <CheckCircle2
                        size={16}
                        className="inline-icon text-success"
                      />{" "}
                      All catalog items are currently above safe reorder thresholds.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Table 2: Warehouse Batch Expiry Watchlist */}
        <section className="panel">
          <div className="panel-head">
            <div>
              <h2>Warehouse Batch Expiry Watchlist</h2>
              <p>Expiring inventory lots to coordinate returns or discounts</p>
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
                      All warehouse lots have healthy shelf-life dates.
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
