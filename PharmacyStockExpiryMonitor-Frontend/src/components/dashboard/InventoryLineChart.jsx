import React from "react";
import { ChevronRight } from "lucide-react";
import {
  LineChart,
  Line,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

export default function InventoryLineChart({
  title = "Inventory Flow & Dispensation",
  subtitle = "Monthly distribution snapshot across inventory",
  data = [],
  onViewLedger
}) {
  return (
    <section className="panel chart-panel">
      <div className="panel-head">
        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
      </div>

      <div className="chart-box">
        <ResponsiveContainer width="100%" height={240}>
          <LineChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#f1f5f9"
            />
            <XAxis
              dataKey="month"
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 12 }}
            />
            <YAxis
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#ffffff",
                borderColor: "#e2e8f0",
                borderRadius: "6px",
                color: "#1e293b",
                fontSize: "12px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
              }}
            />
            <Line
              type="monotone"
              dataKey="stock"
              name="Stock On Hand"
              stroke="#0ea5e9"
              strokeWidth={2.5}
              dot={{ r: 3, fill: "#0ea5e9", strokeWidth: 0 }}
              activeDot={{ r: 5 }}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="dispensed"
              name="Dispensed Units"
              stroke="#10b981"
              strokeWidth={2.5}
              dot={{ r: 3, fill: "#10b981", strokeWidth: 0 }}
              activeDot={{ r: 5 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-footer-legend">
        <div>
          <span className="legend-indicator blue" /> Stock Units
        </div>
        <div>
          <span className="legend-indicator green" /> Dispensed Units
        </div>
        {onViewLedger && (
          <button className="link-text-btn" onClick={onViewLedger}>
            View Ledger <ChevronRight size={13} />
          </button>
        )}
      </div>
    </section>
  );
}
