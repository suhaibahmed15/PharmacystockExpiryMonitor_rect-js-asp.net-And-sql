import React, { useEffect, useState } from "react";
import {
  getPredictionsApi,
  evaluatePredictionApi,
  getMedicinesApi,
  getBatchesApi,
  getErrorMessage
} from "../services/api";
import Pagination from "../components/Pagination";
import "../styles/Predictions.css";

export default function PredictionsPage() {
  const [predictions, setPredictions] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Evaluation Form State
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
        getPredictionsApi(),
        getMedicinesApi({ page: 1, pageSize: 100 }),
        getBatchesApi()
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

  // Filter batches strictly by the selected medicine so an invalid batch is never submitted!
  const availableBatches = batches.filter(
    (b) => Number(b.medicineId) === Number(selectedMedicineId)
  );

  const handleMedicineChange = (e) => {
    const newMedId = e.target.value;
    setSelectedMedicineId(newMedId);
    // Reset batch selection whenever medicine changes to avoid cross-medicine batch mismatch!
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

      const res = await evaluatePredictionApi(payload);
      setLatestResult(res.data);
      setSuccess("AI Forecast evaluated successfully by backend.");
      loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setEvaluating(false);
    }
  };

  // Helper to find medicine name by ID
  const getMedicineName = (medId) => {
    const found = medicines.find((m) => Number(m.id) === Number(medId));
    return found ? `${found.name} (${found.medicineCode})` : `Medicine #${medId}`;
  };

  return (
    <div className="container">
      <h1>AI Forecasts & Stock Intelligence</h1>

      {error && <div className="message-error">{error}</div>}
      {success && <div className="message-success">{success}</div>}

      <div className="predictions-top-bar">
        <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>
          Predictive consumption rates, estimated days until stockout, and AI risk recommendations.
        </p>
        <button
          className="btn-primary"
          onClick={() => setShowEvalForm(!showEvalForm)}
        >
          {showEvalForm ? "Hide Evaluation Form" : "+ Evaluate Medicine Forecast"}
        </button>
      </div>

      {/* Evaluate Forecast Form */}
      {showEvalForm && (
        <form className="simple-form" onSubmit={handleRunEvaluation}>
          <h3>Evaluate Stock Forecast (Backend AI Engine)</h3>
          <p style={{ margin: "2px 0 14px 0", fontSize: "12px", color: "#64748b" }}>
            Select a medicine and optionally a specific batch belonging to that medicine.
          </p>

          <div className="form-row">
            <div className="form-group">
              <label>Select Medicine *</label>
              <select
                value={selectedMedicineId}
                onChange={handleMedicineChange}
                required
              >
                <option value="">-- Choose Medicine --</option>
                {medicines.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.medicineCode}) - Stock: {m.currentStock}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Select Batch (Optional)</label>
              <select
                value={selectedBatchId}
                onChange={(e) => setSelectedBatchId(e.target.value)}
              >
                <option value="">-- Entire Medicine Stock (All Batches) --</option>
                {availableBatches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.batchNumber} (Expires: {new Date(b.expiryDate).toLocaleDateString()}, Rem: {b.remainingQuantity})
                  </option>
                ))}
              </select>
              {selectedMedicineId && availableBatches.length === 0 && (
                <small style={{ color: "#64748b", display: "block", marginTop: "3px" }}>
                  * No active batch registered for this medicine. Evaluation will run across entire stock.
                </small>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="btn-primary"
              disabled={evaluating || !selectedMedicineId}
              style={{ marginRight: "10px" }}
            >
              {evaluating ? "Evaluating Prediction..." : "Run AI Forecast Evaluation"}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setShowEvalForm(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Latest Evaluation Result Box */}
      {latestResult && (
        <div
          style={{
            border: "1px solid #93c5fd",
            backgroundColor: "#eff6ff",
            padding: "16px",
            borderRadius: "6px",
            marginBottom: "20px"
          }}
        >
          <h3 style={{ margin: "0 0 10px 0", color: "#0369a1", fontSize: "15px" }}>
            Latest AI Prediction Result: {getMedicineName(latestResult.medicineId)}
          </h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: "10px",
              marginBottom: "12px"
            }}
          >
            <div style={{ background: "#ffffff", padding: "10px", borderRadius: "5px", border: "1px solid #bfdbfe" }}>
              <div style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase" }}>Avg Daily Consumption</div>
              <div style={{ fontSize: "18px", fontWeight: "700", color: "#0284c7" }}>
                {Number(latestResult.averageDailyConsumption).toFixed(2)} units/day
              </div>
            </div>

            <div style={{ background: "#ffffff", padding: "10px", borderRadius: "5px", border: "1px solid #bfdbfe" }}>
              <div style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase" }}>Est. Days Remaining</div>
              <div style={{ fontSize: "18px", fontWeight: "700", color: "#16a34a" }}>
                {Number(latestResult.estimatedDaysRemaining).toFixed(0)} days
              </div>
            </div>

            <div style={{ background: "#ffffff", padding: "10px", borderRadius: "5px", border: "1px solid #bfdbfe" }}>
              <div style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase" }}>Risk Score</div>
              <div style={{ fontSize: "18px", fontWeight: "700", color: "#d97706" }}>
                {Number(latestResult.predictionScore).toFixed(2)}
              </div>
            </div>

            <div style={{ background: "#ffffff", padding: "10px", borderRadius: "5px", border: "1px solid #bfdbfe" }}>
              <div style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase" }}>Assessment Type</div>
              <div style={{ fontSize: "15px", fontWeight: "600", color: "#1e293b", marginTop: "2px" }}>
                {latestResult.predictionType || "Stock Health"}
              </div>
            </div>
          </div>

          <div style={{ background: "#ffffff", padding: "12px", borderRadius: "5px", border: "1px solid #bfdbfe", fontSize: "13px" }}>
            <strong style={{ color: "#0369a1" }}>AI Advisory Explanation: </strong>
            {latestResult.explanation || "No explanation provided."}
          </div>
        </div>
      )}

      {/* Predictions Table */}
      <h2>Historical Forecast Evaluations</h2>
      {loading ? (
        <p>Loading prediction records...</p>
      ) : (
        <div className="table-container predictions-table-container">
          <table className="simple-table predictions-table">
            <thead>
              <tr>
                <th style={{ width: "5%" }}>ID</th>
                <th style={{ width: "15%" }}>Medicine</th>
                <th style={{ width: "10%" }}>Target Batch</th>
                <th style={{ width: "11%" }}>Avg Daily</th>
                <th style={{ width: "11%" }}>Est. Days Left</th>
                <th style={{ width: "8%" }}>Risk Score</th>
                <th style={{ width: "11%" }}>Assessment</th>
                <th style={{ width: "19%" }}>Recommendation / Reason</th>
                <th style={{ width: "10%" }}>Evaluated</th>
              </tr>
            </thead>
            <tbody>
              {predictions.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: "center", padding: "20px" }}>
                    No predictions found. Use the evaluation form above to run a forecast.
                  </td>
                </tr>
              ) : (
                predictions
                  .slice((page - 1) * pageSize, page * pageSize)
                  .map((p) => (
                    <tr key={p.id}>
                      <td>{p.id}</td>
                      <td>
                        <strong>{getMedicineName(p.medicineId)}</strong>
                      </td>
                      <td>{p.batchId ? `Batch #${p.batchId}` : "All Batches"}</td>
                      <td>{Number(p.averageDailyConsumption).toFixed(2)}/day</td>
                      <td>
                        <strong style={{ color: Number(p.estimatedDaysRemaining) <= 30 ? "#dc2626" : "#16a34a" }}>
                          {Number(p.estimatedDaysRemaining).toFixed(0)} days
                        </strong>
                      </td>
                      <td>{Number(p.predictionScore).toFixed(2)}</td>
                      <td>
                        <span className="badge badge-neutral">
                          {p.predictionType || "Consumption"}
                        </span>
                      </td>
                      <td style={{ fontSize: "11px" }}>
                        {p.explanation || "-"}
                      </td>
                      <td>{new Date(p.predictedAt).toLocaleDateString()}</td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <Pagination
            page={page}
            pageSize={pageSize}
            totalCount={predictions.length}
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
