import React, { useEffect, useState } from "react";
import {
  TrendingUp,
  Search,
  Activity,
  CalendarClock,
  AlertTriangle,
  Play,
  TrendingDown,
  Info,
  CheckCircle,
  X,
  RefreshCw,
  Clock,
  Gauge
} from "lucide-react";
import {
  getPredictions,
  evaluateForecast,
  getMedicines,
  getBatches,
  errorMessage
} from "../api";
import Pagination from "../components/Pagination";

export default function PredictionsPage({ onSetToast }) {
  const [predictions, setPredictions] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [modal, setModal] = useState(false);
  const [evalMedicineId, setEvalMedicineId] = useState("");
  const [evalBatchId, setEvalBatchId] = useState("");
  const [evaluating, setEvaluating] = useState(false);
  const [evalResult, setEvalResult] = useState(null);

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const [predRes, medRes, batchRes] = await Promise.allSettled([
        getPredictions(),
        getMedicines({ page: 1, pageSize: 100 }),
        getBatches()
      ]);

      if (predRes.status === "fulfilled") setPredictions(predRes.value.data);
      if (medRes.status === "fulfilled") setMedicines(medRes.value.data);
      if (batchRes.status === "fulfilled") setBatches(batchRes.value.data);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function openEvaluate() {
    setEvalMedicineId(medicines[0]?.id?.toString() || "");
    setEvalBatchId("");
    setEvalResult(null);
    setModal(true);
  }

  async function handleEvaluate(e) {
    e.preventDefault();
    if (!evalMedicineId) {
      onSetToast("Please select a Medicine to evaluate.");
      return;
    }

    setEvaluating(true);
    setError("");
    try {
      const payload = {
        medicineId: parseInt(evalMedicineId, 10),
        batchId: evalBatchId ? parseInt(evalBatchId, 10) : null
      };

      const res = await evaluateForecast(payload);
      setEvalResult(res);
      onSetToast("Stock intelligence evaluation generated.");
      loadData();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setEvaluating(false);
    }
  }

  const filteredPredictions = predictions.filter((p) => {
    const med = medicines.find((m) => m.id === p.medicineId)?.name || "";
    return (
      med.toLowerCase().includes(search.toLowerCase()) ||
      (p.explanation || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.predictionType || "").toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="page-content">
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            <span>STOCK & CONSUMPTION FORECASTING</span>
          </div>
          <h1>Stock Forecasts</h1>
          <p>
            Consumption velocity analysis, estimated days remaining, and expiry risk evaluation.
          </p>
        </div>
        <div className="heading-actions">
          <button className="btn btn-light" onClick={loadData}>
            <RefreshCw size={15} /> Refresh
          </button>
          <button className="btn btn-primary" onClick={openEvaluate}>
            <TrendingUp size={16} /> Evaluate Medicine
          </button>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <AlertTriangle size={18} />
          <span>{error}</span>
          <button onClick={loadData}>Retry</button>
        </div>
      )}

      {/* Advisory Explainer Banner */}
      <div className="ai-advisory-banner">
        <div className="advisory-icon-wrap">
          <TrendingUp size={20} />
        </div>
        <div className="advisory-content">
          <b>Consumption & Risk Modeling</b>
          <p>
            Forecasts are calculated from average daily consumption velocity and remaining shelf-life days to assist inventory replenishment decisions.
          </p>
        </div>
        <button className="btn btn-sm btn-light" onClick={openEvaluate}>
          <Play size={14} /> Evaluate Medicine
        </button>
      </div>

      {/* Search and Filters */}
      <div className="filter-bar">
        <div className="search-input-wrap">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search prediction models and clinical explanations..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
          {search && (
            <button className="clear-btn" onClick={() => { setSearch(""); setPage(1); }}>
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Predictions Table */}
      <section className="panel table-panel">
        <div className="panel-head">
          <div className="table-caption">
            Showing <b>{filteredPredictions.length}</b> forecast evaluations
          </div>
        </div>

        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>EVALUATED AT</th>
                <th>PRODUCT MEDICINE</th>
                <th>PREDICTION TYPE</th>
                <th>AVG. DAILY RATE</th>
                <th>EST. DAYS LEFT</th>
                <th>CONFIDENCE</th>
                <th>TRANSPARENT REASONING</th>
              </tr>
            </thead>
            <tbody>
              {filteredPredictions
                .slice((page - 1) * pageSize, page * pageSize)
                .map((p) => {
                const medName =
                  medicines.find((m) => m.id === p.medicineId)?.name ||
                  `Medicine #${p.medicineId}`;
                const days = Math.round(Number(p.estimatedDaysRemaining) || 0);
                const isUrgent = days <= 7;

                return (
                  <tr key={p.id}>
                    <td>
                      <div className="date-cell">
                        <Clock size={12} className="text-muted" />
                        <span>{new Date(p.predictedAt).toLocaleString("en-GB")}</span>
                      </div>
                    </td>
                    <td>
                      <b>{medName}</b>
                      {p.batchId && (
                        <span className="code-badge d-block mt-1">Lot #{p.batchId}</span>
                      )}
                    </td>
                    <td>
                      <span className="type-chip">{p.predictionType || "StockOut"}</span>
                    </td>
                    <td>
                      <b>{Number(p.averageDailyConsumption).toFixed(1)}</b> units/day
                    </td>
                    <td>
                      <span
                        className={`pill-status ${
                          days <= 3
                            ? "status-danger"
                            : days <= 10
                            ? "status-urgent"
                            : "status-safe"
                        }`}
                      >
                        {days <= 0 ? "Depleted" : `~${days} days`}
                      </span>
                    </td>
                    <td>
                      <span className="score-badge">
                        {Math.round(Number(p.predictionScore) * 100)}%
                      </span>
                    </td>
                    <td>
                      <span className="cell-message-full" title={p.explanation}>
                        {p.explanation || "Calculated based on standard velocity."}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {filteredPredictions.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="empty-table-cell">
                    <TrendingUp size={28} className="text-muted" />
                    <p>No evaluations recorded yet. Run an analysis above.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          page={page}
          pageSize={pageSize}
          totalCount={filteredPredictions.length}
          onPageChange={setPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setPage(1);
          }}
        />
      </section>

      {/* Run Evaluation Modal */}
      {modal && (
        <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && setModal(false)}>
          <div className="record-modal">
            <div className="modal-head">
              <div>
                <span className="eyebrow">FORECAST EVALUATION</span>
                <h2>Evaluate Stock & Expiry Dynamics</h2>
              </div>
              <button className="icon-btn" onClick={() => setModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEvaluate}>
              <div className="form-grid">
                <label className="form-field">
                  <span>Product Medicine to Evaluate *</span>
                  <select
                    required
                    value={evalMedicineId}
                    onChange={(e) => {
                      setEvalMedicineId(e.target.value);
                      setEvalBatchId("");
                    }}
                  >
                    <option value="">Select Medicine</option>
                    {medicines.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.medicineCode})
                      </option>
                    ))}
                  </select>
                </label>

                <label className="form-field">
                  <span>Specific Batch Lot (Optional)</span>
                  <select
                    value={evalBatchId}
                    onChange={(e) => setEvalBatchId(e.target.value)}
                  >
                    <option value="">All Active Batches for Medicine</option>
                    {batches
                      .filter((b) => b.medicineId?.toString() === evalMedicineId)
                      .map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.batchNumber} ({b.remainingQuantity} units on hand)
                        </option>
                      ))}
                  </select>
                </label>
              </div>

              {evalResult && (
                <div className="eval-result-card">
                  <div className="eval-result-header">
                    <CheckCircle size={18} className="text-success" />
                    <b>Evaluation Outcome</b>
                  </div>
                  <div className="eval-metrics-grid">
                    <div>
                      <small>Est. Days Remaining</small>
                      <strong>~{Math.round(evalResult.estimatedDaysRemaining)} days</strong>
                    </div>
                    <div>
                      <small>Daily Velocity</small>
                      <strong>{Number(evalResult.averageDailyConsumption).toFixed(1)} units/day</strong>
                    </div>
                    <div>
                      <small>Confidence Score</small>
                      <strong>{Math.round(Number(evalResult.predictionScore) * 100)}%</strong>
                    </div>
                  </div>
                  <p className="eval-explanation">{evalResult.explanation}</p>
                </div>
              )}

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-light"
                  onClick={() => setModal(false)}
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={evaluating}
                >
                  <TrendingUp size={16} />
                  {evaluating ? "Evaluating..." : "Run Evaluation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
