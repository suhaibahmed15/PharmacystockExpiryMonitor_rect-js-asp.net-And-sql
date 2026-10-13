import React, { useEffect, useState } from "react";
import stockTransactionApi from "../../api/stockTransactionApi";
import { getErrorMessage } from "../../api/axiosClient";
import DataTable from "../../components/common/DataTable";
import Modal from "../../components/common/Modal";
import StockTransactionForm from "./StockTransactionForm";
import { TRANSACTION_TYPE_LABELS } from "../../utils/constants";
import { formatDateTime } from "../../utils/formatters";

export default function StockTransactionListPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [typeFilter, setTypeFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadTransactions = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await stockTransactionApi.getAll();
      setTransactions(res.data || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const filteredTransactions = transactions.filter((tx) => {
    if (typeFilter === "all") return true;
    return String(tx.transactionType) === String(typeFilter);
  });

  const getTransactionTypeClass = (type) => {
    switch (type) {
      case 1:
        return "type-in";
      case 2:
        return "type-out";
      case 3:
        return "type-adjust";
      default:
        return "";
    }
  };

  const columns = [
    { key: "id", header: "ID", width: "60px" },
    {
      key: "medicineName",
      header: "Medicine",
      render: (row) => row.medicineName || `Medicine #${row.medicineId}`
    },
    {
      key: "batchNumber",
      header: "Batch Lot",
      render: (row) => row.batchNumber ? <code>{row.batchNumber}</code> : "-"
    },
    {
      key: "transactionType",
      header: "Movement Type",
      render: (row) => (
        <span className={`transaction-tag ${getTransactionTypeClass(row.transactionType)}`}>
          {TRANSACTION_TYPE_LABELS[row.transactionType] || `Type #${row.transactionType}`}
        </span>
      )
    },
    {
      key: "quantity",
      header: "Quantity",
      render: (row) => <strong>{row.quantity}</strong>
    },
    { key: "previousQuantity", header: "Previous Stock" },
    { key: "newQuantity", header: "New Stock" },
    {
      key: "reason",
      header: "Audit Reason",
      render: (row) => row.reason || <span style={{ color: "#94a3b8" }}>-</span>
    },
    {
      key: "createdAt",
      header: "Timestamp",
      render: (row) => formatDateTime(row.createdAt)
    }
  ];

  const pagedData = filteredTransactions.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h1>Stock Transaction Ledger</h1>
          <p className="page-subtitle">
            Auditable double-entry history of dispensing, receipts, transfers, and inventory corrections.
          </p>
        </div>
        <button type="button" className="btn-primary" onClick={() => setIsModalOpen(true)}>
          + Record Stock Movement
        </button>
      </div>

      {error && <div className="message-error">{error}</div>}
      {success && <div className="message-success">{success}</div>}

      <div className="top-action-bar">
        <div className="filter-group-inline">
          <label style={{ fontSize: "13px", fontWeight: "600", marginRight: "8px" }}>
            Movement Filter:
          </label>
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
            className="filter-select"
          >
            <option value="all">All Movements</option>
            <option value="2">Stock Out / Dispensed</option>
            <option value="1">Stock In / Direct Receipt</option>
            <option value="3">Adjustments</option>
            <option value="4">Transfers</option>
          </select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={pagedData}
        loading={loading}
        emptyMessage="No stock transactions recorded matching filter."
        pagination={{
          page,
          pageSize,
          totalCount: filteredTransactions.length,
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
        title="Record Stock Movement / Dispensing"
        maxWidth="640px"
      >
        <StockTransactionForm
          onSuccess={() => {
            setIsModalOpen(false);
            setSuccess("Stock movement recorded successfully.");
            loadTransactions();
          }}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
