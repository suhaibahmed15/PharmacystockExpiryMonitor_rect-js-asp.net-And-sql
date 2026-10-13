import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import batchApi from "../../api/batchApi";
import medicineApi from "../../api/medicineApi";
import { getErrorMessage } from "../../api/axiosClient";
import DataTable from "../../components/common/DataTable";
import StatusBadge from "../../components/common/StatusBadge";
import Modal from "../../components/common/Modal";
import Loader from "../../components/common/Loader";
import BatchForm from "./BatchForm";
import { getExpiryStatus } from "../../utils/expiry";
import { formatCurrency, formatDate } from "../../utils/formatters";

export default function MedicineBatchesPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [medicine, setMedicine] = useState(null);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [isAddOpen, setIsAddOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [medRes, batchRes] = await Promise.all([
        medicineApi.getById(id),
        batchApi.getByMedicineId(id)
      ]);
      setMedicine(medRes.data);
      setBatches(batchRes.data || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const totalRemainingStock = batches.reduce(
    (sum, b) => sum + (Number(b.remainingQuantity) || 0),
    0
  );

  const columns = [
    { key: "id", header: "Batch ID", width: "90px" },
    {
      key: "batchNumber",
      header: "Batch Lot Number",
      render: (row) => <strong>{row.batchNumber}</strong>
    },
    {
      key: "manufacturingDate",
      header: "Mfg Date",
      render: (row) => formatDate(row.manufacturingDate)
    },
    {
      key: "expiryDate",
      header: "Expiry Date",
      render: (row) => formatDate(row.expiryDate)
    },
    {
      key: "expiryStatus",
      header: "Expiry Status",
      render: (row) => {
        const info = getExpiryStatus(row.expiryDate);
        return (
          <StatusBadge
            variant={info.variant}
            label={info.label}
          />
        );
      }
    },
    {
      key: "initialQuantity",
      header: "Initial Qty",
      render: (row) => row.initialQuantity ?? "-"
    },
    {
      key: "remainingQuantity",
      header: "Remaining Qty",
      render: (row) => <strong>{row.remainingQuantity}</strong>
    },
    {
      key: "unitCost",
      header: "Unit Cost",
      render: (row) => formatCurrency(row.unitCost)
    }
  ];

  if (loading) {
    return <Loader message="Loading medicine batch inventory..." />;
  }

  return (
    <div className="container">
      <div className="back-link-bar">
        <Link to="/medicines" className="btn-secondary btn-small">
          &larr; Back to Medicines List
        </Link>
      </div>

      <div className="page-header">
        <div>
          <h1>Batches for {medicine?.name || `Medicine #${id}`}</h1>
          <p className="page-subtitle">
            Code: <strong>{medicine?.medicineCode}</strong> &bull; Generic:{" "}
            <strong>{medicine?.genericName || "N/A"}</strong> &bull; Current Aggregate Stock:{" "}
            <strong>{totalRemainingStock} units</strong>
          </p>
        </div>
        <button
          type="button"
          className="btn-primary"
          onClick={() => setIsAddOpen(true)}
        >
          + Add Batch For This Medicine
        </button>
      </div>

      {error && <div className="message-error">{error}</div>}
      {success && <div className="message-success">{success}</div>}

      {/* Summary card */}
      <div className="batch-summary-card">
        <div className="summary-item">
          <span className="summary-label">Total Batches:</span>
          <span className="summary-val">{batches.length}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Cumulative Units:</span>
          <span className="summary-val">{totalRemainingStock}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Reorder Level:</span>
          <span className="summary-val">{medicine?.reorderLevel} units</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Stock Status:</span>
          <span className="summary-val">
            <StatusBadge
              status={totalRemainingStock > (medicine?.reorderLevel || 0) ? "Active" : "Low Stock"}
              label={
                totalRemainingStock > (medicine?.reorderLevel || 0)
                  ? "Healthy Stock"
                  : "Below Reorder Level"
              }
            />
          </span>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={batches}
        loading={false}
        emptyMessage={`No batches currently registered for ${medicine?.name || "this medicine"}.`}
      />

      {/* Modal to add new batch specifically for this medicine */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title={`Add Batch to ${medicine?.name}`}
        maxWidth="620px"
      >
        <BatchForm
          preselectedMedicineId={id}
          onSuccess={() => {
            setIsAddOpen(false);
            setSuccess("New batch added successfully.");
            loadData();
          }}
          onCancel={() => setIsAddOpen(false)}
        />
      </Modal>
    </div>
  );
}
