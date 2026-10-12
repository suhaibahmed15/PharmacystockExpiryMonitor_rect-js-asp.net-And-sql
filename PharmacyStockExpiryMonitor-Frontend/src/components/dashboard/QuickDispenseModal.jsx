import React, { useState, useEffect } from "react";
import { X, AlertTriangle, RefreshCw } from "lucide-react";
import { dispenseMedicine, errorMessage } from "../../api";

export default function QuickDispenseModal({
  isOpen,
  onClose,
  batch,
  onSuccess,
  onSetToast
}) {
  const [qty, setQty] = useState(1);
  const [reason, setReason] = useState("Prescription dispensation");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (batch) {
      setQty(1);
      setReason("Prescription dispensation");
      setError("");
    }
  }, [batch]);

  if (!isOpen || !batch) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    const quantity = parseInt(qty, 10);
    if (isNaN(quantity) || quantity <= 0) {
      setError("Please enter a valid quantity of at least 1.");
      return;
    }
    if (quantity > (batch.remainingQuantity || 0)) {
      setError(`Quantity exceeds available stock (${batch.remainingQuantity} units).`);
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      await dispenseMedicine({
        batchId: batch.id,
        quantity,
        reason: (reason || "").trim() || "Prescription dispensation"
      });
      onSetToast?.(`Dispensed ${quantity} units of ${batch.medicineName || "medicine"} successfully.`);
      onClose();
      onSuccess?.();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="modal-backdrop"
      onClick={() => !submitting && onClose()}
    >
      <div className="record-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <h2>FEFO Quick Dispense</h2>
            <p className="text-muted" style={{ margin: "4px 0 0", fontSize: "12px" }}>
              Dispense units from earliest-expiring batch according to FEFO safety protocol.
            </p>
          </div>
          <button
            className="icon-btn"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="error-banner" style={{ marginBottom: "16px" }}>
            <AlertTriangle size={16} />
            <span>{error}</span>
          </div>
        )}

        <div
          style={{
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            padding: "12px 14px",
            marginBottom: "16px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
            gap: "10px",
            fontSize: "12px"
          }}
        >
          <div>
            <span style={{ fontSize: "10px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Batch #</span>
            <div style={{ fontWeight: "700", marginTop: "2px" }}>
              <span className="code-badge">{batch.batchNumber}</span>
            </div>
          </div>
          <div>
            <span style={{ fontSize: "10px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Medicine</span>
            <div style={{ fontWeight: "700", marginTop: "2px", color: "var(--navy-deep)" }}>
              {batch.medicineName}
            </div>
          </div>
          <div>
            <span style={{ fontSize: "10px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Expiry Date</span>
            <div style={{ fontWeight: "600", marginTop: "2px" }}>
              {batch.expiryDate ? new Date(batch.expiryDate).toLocaleDateString("en-GB") : "—"}
            </div>
          </div>
          <div>
            <span style={{ fontSize: "10px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Available</span>
            <div style={{ fontWeight: "800", marginTop: "2px", color: "#0ea5e9" }}>
              {batch.remainingQuantity} units
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid" style={{ marginBottom: "16px" }}>
            <div className="form-field" style={{ gridColumn: "span 2" }}>
              <span>Dispense Quantity (Units) *</span>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <input
                  type="number"
                  min="1"
                  max={batch.remainingQuantity || 9999}
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  required
                  style={{ flex: 1 }}
                />
                {[1, 5, 10].map((num) => (
                  <button
                    key={num}
                    type="button"
                    className="btn btn-light"
                    style={{ padding: "8px 12px", fontSize: "11px" }}
                    onClick={() =>
                      setQty(Math.min(num, batch.remainingQuantity || num))
                    }
                  >
                    +{num}
                  </button>
                ))}
              </div>
              <small style={{ color: "#64748b", fontSize: "11px", marginTop: "4px" }}>
                Maximum available in this lot: {batch.remainingQuantity} units
              </small>
            </div>

            <div className="form-field" style={{ gridColumn: "span 2" }}>
              <span>Dispensing Reason / Prescription Ref</span>
              <input
                type="text"
                placeholder="e.g. Rx-10492 / Outpatient prescription"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-light"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting || !qty || Number(qty) <= 0}
            >
              {submitting ? (
                <>
                  <RefreshCw size={14} className="spin" /> Dispensing...
                </>
              ) : (
                "Confirm Dispensation"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
