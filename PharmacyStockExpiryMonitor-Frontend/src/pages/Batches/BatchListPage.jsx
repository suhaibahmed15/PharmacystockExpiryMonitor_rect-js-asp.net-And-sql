import React, { useEffect, useState } from "react";
import batchApi from "../../api/batchApi";
import { getErrorMessage } from "../../api/axiosClient";
import DataTable from "../../components/common/DataTable";
import StatusBadge from "../../components/common/StatusBadge";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import Modal from "../../components/common/Modal";
import BatchForm from "./BatchForm";
import { getExpiryStatus } from "../../utils/expiry";
import { formatCurrency, formatDate } from "../../utils/formatters";

export default function BatchListPage() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [expiryFilter, setExpiryFilter] = useState("all"); // 'all' | 'expired' | 'near-expiry' | 'safe'

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState(null);

  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadBatches = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await batchApi.getAll();
      setBatches(res.data || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBatches();
  }, []);

  const handleOpenAdd = () => {
    setEditingBatch(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (b) => {
    setEditingBatch(b);
    setIsModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;
    setDeleting(true);
    setError("");
    try {
      await batchApi.delete(deleteTargetId);
      setSuccess("Batch deleted successfully.");
      setDeleteTargetId(null);
      loadBatches();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  const filteredBatches = batches.filter((b) => {
    const matchesSearch =
      !search ||
      b.batchNumber?.toLowerCase().includes(search.toLowerCase()) ||
      b.medicineName?.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (expiryFilter !== "all") {
      const status = getExpiryStatus(b.expiryDate);
      if (status.status !== expiryFilter) return false;
    }

    return true;
  });

  const columns = [
    { key: "id", header: "ID", width: "60px" },
    {
      key: "batchNumber",
      header: "Batch Lot #",
      render: (row) => <strong>{row.batchNumber}</strong>
    },
    {
      key: "medicineName",
      header: "Medicine",
      render: (row) => row.medicineName || `Medicine #${row.medicineId}`
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
      key: "remainingQuantity",
      header: "Remaining Qty",
      render: (row) => <strong>{row.remainingQuantity}</strong>
    },
    {
      key: "unitCost",
      header: "Unit Cost",
      render: (row) => formatCurrency(row.unitCost)
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <div className="table-actions">
          <button
            type="button"
            className="btn-secondary btn-small"
            onClick={() => handleOpenEdit(row)}
          >
            Edit
          </button>
          <button
            type="button"
            className="btn-danger btn-small"
            onClick={() => setDeleteTargetId(row.id)}
          >
            Delete
          </button>
        </div>
      )
    }
  ];

  const pagedData = filteredBatches.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h1>Batch &amp; Expiry Management</h1>
          <p className="page-subtitle">
            Track pharmaceutical manufacturing lots, stock shelf expiry countdowns, and unit costs.
          </p>
        </div>
        <button type="button" className="btn-primary" onClick={handleOpenAdd}>
          + Add Batch
        </button>
      </div>

      {error && <div className="message-error">{error}</div>}
      {success && <div className="message-success">{success}</div>}

      <div className="top-action-bar">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search batch or medicine name..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="search-input"
          />

          <select
            value={expiryFilter}
            onChange={(e) => {
              setExpiryFilter(e.target.value);
              setPage(1);
            }}
            className="filter-select"
          >
            <option value="all">All Expiry States</option>
            <option value="safe">Safe (&gt;90 days)</option>
            <option value="near-expiry">Expiring Soon (≤90 days)</option>
            <option value="expired">Expired (Quarantined)</option>
          </select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={pagedData}
        loading={loading}
        emptyMessage="No batches found matching filter."
        pagination={{
          page,
          pageSize,
          totalCount: filteredBatches.length,
          onPageChange: (p) => setPage(p),
          onPageSizeChange: (sz) => {
            setPageSize(sz);
            setPage(1);
          }
        }}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBatch ? "Edit Batch Record" : "Add New Batch"}
        maxWidth="620px"
      >
        <BatchForm
          editId={editingBatch?.id}
          initialData={editingBatch}
          onSuccess={() => {
            setIsModalOpen(false);
            loadBatches();
          }}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(deleteTargetId)}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Batch"
        message="Are you sure you want to delete this batch record? Dispensing audits linked to it may be affected."
        confirmText="Yes, Delete"
        loading={deleting}
      />
    </div>
  );
}
