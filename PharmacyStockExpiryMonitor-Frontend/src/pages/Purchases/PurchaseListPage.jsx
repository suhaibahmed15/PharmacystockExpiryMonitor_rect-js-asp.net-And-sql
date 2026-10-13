import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import purchaseApi from "../../api/purchaseApi";
import { getErrorMessage } from "../../api/axiosClient";
import DataTable from "../../components/common/DataTable";
import Modal from "../../components/common/Modal";
import { formatCurrency, formatDate } from "../../utils/formatters";

export default function PurchaseListPage() {
  const navigate = useNavigate();

  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");

  const [viewDetails, setViewDetails] = useState(null);

  const loadPurchases = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await purchaseApi.getAll();
      setPurchases(res.data || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPurchases();
  }, []);

  const filteredPurchases = purchases.filter((p) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      p.purchaseNumber?.toLowerCase().includes(term) ||
      p.supplierName?.toLowerCase().includes(term)
    );
  });

  const columns = [
    { key: "id", header: "ID", width: "60px" },
    {
      key: "purchaseNumber",
      header: "Invoice / PO #",
      render: (row) => <strong>{row.purchaseNumber}</strong>
    },
    {
      key: "supplierName",
      header: "Supplier",
      render: (row) => row.supplierName || `Supplier #${row.supplierId}`
    },
    {
      key: "purchaseDate",
      header: "Date",
      render: (row) => formatDate(row.purchaseDate)
    },
    {
      key: "totalAmount",
      header: "Grand Total",
      render: (row) => <strong>{formatCurrency(row.totalAmount)}</strong>
    },
    {
      key: "notes",
      header: "Notes",
      render: (row) => row.notes || <span style={{ color: "#94a3b8" }}>-</span>
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <div className="table-actions">
          <Link
            to={`/purchases/${row.id}`}
            className="btn-secondary btn-small"
          >
            Details ({(row.purchaseItems || []).length} items)
          </Link>
          <button
            type="button"
            className="btn-secondary btn-small"
            onClick={() => setViewDetails(row)}
          >
            Quick View
          </button>
        </div>
      )
    }
  ];

  const pagedData = filteredPurchases.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h1>Purchase Management</h1>
          <p className="page-subtitle">
            Track procurement invoices, bulk receipts from suppliers, and order payment values.
          </p>
        </div>
        <Link to="/purchases/new" className="btn-primary">
          + Create Purchase Order
        </Link>
      </div>

      {error && <div className="message-error">{error}</div>}

      <div className="top-action-bar">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search invoice number or supplier..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="search-input"
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={pagedData}
        loading={loading}
        emptyMessage="No purchases recorded yet."
        pagination={{
          page,
          pageSize,
          totalCount: filteredPurchases.length,
          onPageChange: (p) => setPage(p),
          onPageSizeChange: (sz) => {
            setPageSize(sz);
            setPage(1);
          }
        }}
      />

      {/* Quick View Modal */}
      <Modal
        isOpen={Boolean(viewDetails)}
        onClose={() => setViewDetails(null)}
        title={`Purchase: ${viewDetails?.purchaseNumber}`}
        maxWidth="680px"
      >
        {viewDetails && (
          <div>
            <div className="modal-summary-grid">
              <div>
                <strong>Supplier: </strong>
                {viewDetails.supplierName || `Supplier #${viewDetails.supplierId}`}
              </div>
              <div>
                <strong>Date: </strong>
                {formatDate(viewDetails.purchaseDate)}
              </div>
              <div>
                <strong>Total Amount: </strong>
                <span style={{ color: "#16a34a", fontWeight: "700" }}>
                  {formatCurrency(viewDetails.totalAmount)}
                </span>
              </div>
            </div>

            {viewDetails.notes && (
              <p style={{ margin: "10px 0", fontSize: "13px", color: "#64748b" }}>
                <strong>Notes:</strong> {viewDetails.notes}
              </p>
            )}

            <h4 style={{ margin: "16px 0 8px 0" }}>Items In This Order</h4>
            <div className="table-container">
              <table className="simple-table">
                <thead>
                  <tr>
                    <th>Medicine</th>
                    <th>Quantity</th>
                    <th>Unit Price</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {(viewDetails.purchaseItems || []).map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.medicineName || `Medicine #${item.medicineId}`}</td>
                      <td>{item.quantity}</td>
                      <td>{formatCurrency(item.unitPrice)}</td>
                      <td>{formatCurrency((item.quantity || 0) * (item.unitPrice || 0))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: "16px", textAlign: "right" }}>
              <Link to={`/purchases/${viewDetails.id}`} className="btn-primary btn-small">
                Open Full Order Page &rarr;
              </Link>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
