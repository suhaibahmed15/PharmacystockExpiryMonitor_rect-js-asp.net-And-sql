import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarClock,
  RefreshCw,
  ClipboardList,
  AlertOctagon,
  AlertTriangle,
  Activity,
  Pill,
  Bell,
  ChevronRight,
  CheckCircle2
} from "lucide-react";
import InventoryLineChart from "./InventoryLineChart";
import QuickDispenseModal from "./QuickDispenseModal";
import MedicineCell from "../MedicineCell";

export default function PharmacistDashboard({
  summary,
  medicines = [],
  batches = [],
  alerts = [],
  nearExpiryBatches = [],
  criticalExpiryBatches = [],
  lowStockMedicines = [],
  trendData = [],
  loading = false,
  onRefresh,
  onSetToast
}) {
  const navigate = useNavigate();
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const safeStockCount = Math.max(0, medicines.length - lowStockMedicines.length);
  const unreadAlertsCount =
    summary?.unreadAlertsCount ?? alerts.filter((a) => !a.isRead).length;

  const statCards = [
    {
      title: "Critical Expiry (<= 30d)",
      value: criticalExpiryBatches.length,
      desc: "Batches expiring within 30 days",
      icon: AlertOctagon,
      color: "red",
      urgent: criticalExpiryBatches.length > 0,
      onClick: () => navigate("/batches")
    },
    {
      title: "Near Expiry (90d)",
      value: summary?.nearExpiryCount ?? nearExpiryBatches.length,
      desc: "Batches requiring FEFO rotation",
      icon: CalendarClock,
      color: "purple",
      urgent: (summary?.nearExpiryCount ?? nearExpiryBatches.length) > 0,
      onClick: () => navigate("/batches")
    },
    {
      title: "Expired Stock",
      value: summary?.expiredCount ?? 0,
      desc: "Expired - strictly DO NOT dispense",
      icon: AlertTriangle,
      color: "red",
      urgent: (summary?.expiredCount ?? 0) > 0,
      onClick: () => navigate("/batches")
    },
    {
      title: "Low Stock Shelf Items",
      value: summary?.lowStockCount ?? lowStockMedicines.length,
      desc: "Medicines with limited units",
      icon: Activity,
      color: "orange",
      urgent: (summary?.lowStockCount ?? lowStockMedicines.length) > 0,
      onClick: () => navigate("/medicines")
    },
    {
      title: "Adequate Shelf Stock",
      value: safeStockCount,
      desc: "Medicines above safety threshold",
      icon: Pill,
      color: "emerald",
      onClick: () => navigate("/medicines")
    },
    {
      title: "Unread Safety Alerts",
      value: unreadAlertsCount,
      desc: "Clinical & expiry notifications",
      icon: Bell,
      color: "blue",
      urgent: unreadAlertsCount > 0,
      onClick: () => navigate("/alerts")
    }
  ];

  function handleOpenDispense(batch) {
    setSelectedBatch(batch);
    setModalOpen(true);
  }

  return (
    <>
      {/* Header */}
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            <span>CLINICAL DISPENSING & EXPIRY SAFETY</span>
          </div>
          <h1>Pharmacist Dashboard</h1>
          <p>
            First-Expiry-First-Out (FEFO) dispensing queue, expiration safety, and shelf balances.
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
            <CalendarClock size={15} />
            Expiry Watchlist
          </button>
          <button
            className="btn btn-primary"
            onClick={() => navigate("/transactions")}
          >
            <ClipboardList size={15} />
            Dispense Medicine
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

      {/* Middle Grid: Line Chart + FEFO Dispensing Guard */}
      <div className="dashboard-grid-columns">
        <InventoryLineChart
          title="Dispensation Velocity & Consumption"
          subtitle="Monthly dispensed outflow compared to stock reserves"
          data={trendData}
          onViewLedger={() => navigate("/transactions")}
        />

        <section className="panel attention-panel">
          <div className="panel-head">
            <div>
              <h2>FEFO Dispensing Safety Guard</h2>
              <p>Prioritize early-expiring batches to minimize waste</p>
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
              className="attention-row alert"
              onClick={() => navigate("/batches")}
              role="button"
            >
              <div className="attention-icon red">
                <AlertOctagon size={18} />
              </div>
              <div className="attention-info">
                <b>Critical Expiry (Within 30 Days)</b>
                <small>
                  {criticalExpiryBatches.length} batches require immediate FEFO rotation
                </small>
              </div>
              <span className="attention-badge red">
                {criticalExpiryBatches.length}
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
                <b>Near Expiry Watchlist (90 Days)</b>
                <small>
                  {nearExpiryBatches.length} batches approaching threshold
                </small>
              </div>
              <span className="attention-badge orange">
                {nearExpiryBatches.length}
              </span>
              <ChevronRight size={15} />
            </div>

            <div
              className="attention-row notice"
              onClick={() => navigate("/medicines")}
              role="button"
            >
              <div className="attention-icon purple">
                <Activity size={18} />
              </div>
              <div className="attention-info">
                <b>Limited Shelf Reserve</b>
                <small>
                  {lowStockMedicines.length} medicines running low on stock
                </small>
              </div>
              <span className="attention-badge purple">
                {lowStockMedicines.length}
              </span>
              <ChevronRight size={15} />
            </div>
          </div>
        </section>
      </div>

      {/* Bottom Tables */}
      <div className="dashboard-grid-columns bottom-tables">
        {/* Table 1: FEFO Priority Dispensing Queue */}
        <section className="panel">
          <div className="panel-head">
            <div>
              <h2>FEFO Priority Dispensing Queue</h2>
              <p>Earliest expiring batches — prioritize for active dispensing</p>
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
                  <th>ACTION</th>
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
                      <td>
                        <button
                          className="btn btn-xs btn-primary"
                          onClick={() => handleOpenDispense(b)}
                          title="Quick dispense from this batch"
                          disabled={b.remainingQuantity <= 0}
                        >
                          Dispense
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {nearExpiryBatches.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-4 text-muted">
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

        {/* Table 2: Medicines Stock Availability */}
        <section className="panel">
          <div className="panel-head">
            <div>
              <h2>Medicines Stock Availability</h2>
              <p>Current shelf stock levels for patient prescriptions</p>
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
                  <th>MEDICINE</th>
                  <th>SHELF STOCK</th>
                  <th>REORDER AT</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {medicines.slice(0, 5).map((m) => {
                  const current = Number(m.currentStock || 0);
                  const reorder = Number(m.reorderLevel || 0);
                  const isOut = current <= 0;
                  const isLow = current <= reorder;

                  return (
                    <tr key={m.id}>
                      <td>
                        <MedicineCell
                          code={m.medicineCode}
                          name={m.name}
                          genericName={m.genericName}
                        />
                      </td>
                      <td>
                        <span
                          className={
                            isOut
                              ? "text-danger font-bold"
                              : isLow
                              ? "text-warning font-bold"
                              : "font-bold"
                          }
                        >
                          {current}
                        </span>{" "}
                        units
                      </td>
                      <td>{reorder} units</td>
                      <td>
                        <span
                          className={`pill-status ${
                            isOut
                              ? "status-danger"
                              : isLow
                              ? "status-warning"
                              : "status-safe"
                          }`}
                        >
                          {isOut
                            ? "OUT OF STOCK"
                            : isLow
                            ? "LOW STOCK"
                            : "AVAILABLE"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {medicines.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-4 text-muted">
                      No medicines catalogued yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* FEFO Quick Dispense Modal */}
      <QuickDispenseModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        batch={selectedBatch}
        onSuccess={onRefresh}
        onSetToast={onSetToast}
      />
    </>
  );
}
