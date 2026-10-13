import React from "react";
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

export default function ExpiryChart({ data = [], height = 240, title = "Monthly Stock Movement" }) {
  const defaultData = [
    { month: "May", StockOnHand: 320, Dispensed: 180 },
    { month: "Jun", StockOnHand: 410, Dispensed: 220 },
    { month: "Jul", StockOnHand: 390, Dispensed: 260 },
    { month: "Aug", StockOnHand: 520, Dispensed: 310 },
    { month: "Sep", StockOnHand: 480, Dispensed: 290 },
    { month: "Oct", StockOnHand: 560, Dispensed: 340 }
  ];

  const chartData = data && data.length > 0 ? data : defaultData;

  return (
    <div className="simple-box expiry-chart-box">
      <div className="chart-header">
        <h3 className="chart-title">{title}</h3>
        <p className="chart-subtitle">
          Warehouse stock on hand vs units dispensed to patients.
        </p>
      </div>
      <div style={{ width: "100%", height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 15, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#64748b" }} />
            <YAxis tick={{ fontSize: 12, fill: "#64748b" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "6px",
                fontSize: "12px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
              }}
            />
            <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
            <Bar dataKey="StockOnHand" name="Stock on Hand" fill="#0284c7" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Dispensed" name="Dispensed Units" fill="#16a34a" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
