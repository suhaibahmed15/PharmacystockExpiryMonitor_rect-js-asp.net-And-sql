import React, { useEffect, useState } from "react";
import intelligenceApi from "../../api/intelligenceApi";
import medicineApi from "../../api/medicineApi";
import batchApi from "../../api/batchApi";
import { getErrorMessage } from "../../api/axiosClient";
import DataTable from "../../components/common/DataTable";
import FormField from "../../components/common/FormField";
import Loader from "../../components/common/Loader";
import { formatDate } from "../../utils/formatters";

export default function IntelligencePage() {
  const [predictions, setPredictions] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Form State
  const [showEvalForm, setShowEvalForm] = useState(true);
  const [selectedMedicineId, setSelectedMedicineId] = useState("");
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [evaluating, setEvaluating] = useState(false);
  const [latestResult, setLatestResult] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [predRes, medRes, batchRes] = await Promise.all([
        intelligenceApi.getAll(),
        medicineApi.getAll({ page: 1, pageSize: 100 }),
        batchApi.getAll()
      ]);
      setPredictions(predRes.data || []);
      const meds = medRes.data.items || medRes.data || [];
      setMedicines(meds);
      if (meds.length > 0 && !selectedMedicineId) {
        setSelectedMedicineId(meds[0].id);
      }
      setBatches(batchRes.data || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const availableBatches = batches.filter(
    (b) => Number(b.medicineId) === Number(selectedMedicineId)
  );

  const handleMedicineChange = (e) => {
    setSelectedMedicineId(e.target.value);
    setSelectedBatchId("");
    setError("");
  };

  const handleRunEvaluation = async (e) => {
    e.preventDefault();
    if (!selectedMedicineId) {
      setError("Please select a medicine to evaluate.");
      return;
    }

    setEvaluating(true);
    setError("");
    setSuccess("");
    try {
      const payload = {
        medicineId: Number(selectedMedicineId),
        batchId: selectedBatchId ? Number(selectedBatchId) : null
      };

      const res = await intelligenceApi.evaluate(payload);
      setLatestResult(res.data);
      setSuccess("AI Forecast successfully evaluated by backend prediction engine.");
      loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setEvaluating(false);
    }
  };

  const getMedicineName = (medId) => {
    const found = medicines.find((m) => Number(m.id) === Number(medId));
    return found ? `${found.name} (${found.medicineCode})` : `Medicine #${medId}`;
  };

  const columns = [
    { key: "id", header: "ID", width: "60px" },
    {
      key: "medicineName",
      header: "Medicine Formulation",
      render: (row) => <strong>{getMedicineName(row.medicineId)}</strong>
    },
    {
      key: "batchId",
      header: "Target Batch",
      render: (row) => row.batchId ? <code>Batch #{row.batchId}</code> : "Entire Inventory"
    },
    {
      key: "averageDailyConsumption",
      header: "Daily Consumption",
      render: (row) => `${Number(row.averageDailyConsumption).toFixed(2)} units/day`
    },
    {
      key: "estimatedDaysRemaining",
      header: "Est. Days Remaining",
      render: (row) => {
        const days = Number(row.estimatedDaysRemaining);
        const isCritical = days <= 30;
        return (
          <span style={{ color: isCritical ? "#dc2626" : "#16a34a", fontWeight: "700" }}>
            {days.toFixed(0)} days {isCritical && "(Urgent)"}
          </span>
        );
      }
    },
    {
      key: "predictionScore",
      header: "Risk Score",
      render: (row) => <strong>{Number(row.predictionScore).toFixed(2)}</strong>
    },
    {
      key: "predictionType",
      header: "Assessment",
      render: (row) => (
        <span className="badge-neutral" style={{ padding: "3px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "600" }}>
          {row.predictionType || "Stock Health"}
        </span>
      )
    },
    {
      key: "explanation",
      header: "Advisory / Recommendation",
      render: (row) => <span style={{ fontSize: "12px" }}>{row.explanation || "-"}</span>
    },
    {
      key: "predictedAt",
      header: "Evaluated On",
      render: (row) => formatDate(row.predictedAt)
    }
  ];

  const pagedData = predictions.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h1>AI Demand &amp; Depletion Forecasts</h1>
          <p className="page-subtitle">
            Machine learning forecasting of daily burn rate, stockout dates, and predictive reorder warnings.
          </p>
        </div>
        <button
          type="button"
          className="btn-primary"
          onClick={() => setShowEvalForm(!showEvalForm)}
        >
          {showEvalForm ? "Hide Evaluation Panel" : "+ Run AI Evaluation"}
        </button>
      </div>

      {error && <div className="message-error">{error}</div>}
      {success && <div className="message-success">{success}</div>}

      {/* Evaluate Form Panel */}
      {showEvalForm && (
        <div className="simple-box" style={{ marginBottom: "24px" }}>
          <h3 style={{ marginTop: 0 }}>Run Predictive Evaluation</h3>
          <p style={{ margin: "4px 0 16px 0", fontSize: "13px", color: "#64748b" }}>
            Select a medicine catalog item and optionally an individual batch to compute depletion velocity.
          </p>

          <form onSubmit={handleRunEvaluation}>
            <div className="form-row">
              <FormField label="Target Medicine" required>
                <select
                  value={selectedMedicineId}
                  onChange={handleMedicineChange}
                  required
                  className="form-control"
                >
                  <option value="">-- Choose Medicine --</option>
                  {medicines.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.medicineCode}) &bull; Stock: {m.currentStock}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField
                label="Target Batch Lot (Optional)"
                hint={selectedMedicineId && availableBatches.length === 0 ? "No active batch for this medicine. Runs across total stock." : ""}
              >
                <select
                  value={selectedBatchId}
                  onChange={(e) => setSelectedBatchId(e.target.value)}
                  className="form-control"
                >
                  <option value="">-- Entire Medicine Stock (All Batches) --</option>
                  {availableBatches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.batchNumber} (Expires: {formatDate(b.expiryDate)}, Rem: {b.remainingQuantity})
                    </option>
                  ))}
                </select>
              </FormField>
            </div>

            <div className="form-actions" style={{ marginTop: "12px" }}>
              <button
                type="submit"
                className="btn-primary"
                disabled={evaluating || !selectedMedicineId}
              >
                {evaluating ? "Evaluating AI Prediction..." : "Run AI Forecast Engine"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Latest Evaluation Result Banner */}
      {latestResult && (
        <div className="prediction-result-banner">
          <div className="result-banner-header">
            <h3>Forecast Evaluation: {getMedicineName(latestResult.medicineId)}</h3>
            <span className="timestamp-chip">Calculated Just Now</span>
          </div>

          <div className="result-metric-grid">
            <div className="result-metric-card">
              <div className="metric-label">Avg Daily Burn Rate</div>
              <div className="metric-val primary">
                {Number(latestResult.averageDailyConsumption).toFixed(2)} units/day
              </div>
            </div>

            <div className="result-metric-card">
              <div className="metric-label">Est. Days Until Stockout</div>
              <div className="metric-val success">
                {Number(latestResult.estimatedDaysRemaining).toFixed(0)} days
              </div>
            </div>

            <div className="result-metric-card">
              <div className="metric-label">Risk Probability Score</div>
              <div className="metric-val warning">
                {Number(latestResult.predictionScore).toFixed(2)}
              </div>
            </div>

            <div className="result-metric-card">
              <div className="metric-label">Stock Status Classification</div>
              <div className="metric-val text-dark">
                {latestResult.predictionType || "Consumption"}
              </div>
            </div>
          </div>

          <div className="advisory-box">
            <strong>AI Recommendation: </strong>
            <span>{latestResult.explanation || "Stock levels are trending within normal consumption thresholds."}</span>
          </div>
        </div>
      )}

      {/* Predictions Table */}
      <div className="page-header" style={{ marginTop: "24px", marginBottom: "12px" }}>
        <h2>Historical AI Prediction Forecasts</h2>
      </div>

      <DataTable
        columns={columns}
        data={pagedData}
        loading={loading}
        emptyMessage="No historical prediction records found. Run an evaluation above to generate insights."
        pagination={{
          page,
          pageSize,
          totalCount: predictions.length,
          onPageChange: (p) => setPage(p),
          onPageSizeChange: (sz) => {
            setPageSize(sz);
            setPage(1);
          }
        }}
      />
    </div>
  );
}
