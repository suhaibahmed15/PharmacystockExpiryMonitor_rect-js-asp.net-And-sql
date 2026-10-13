import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import purchaseApi from "../../api/purchaseApi";
import { getErrorMessage } from "../../api/axiosClient";
import Loader from "../../components/common/Loader";
import { formatCurrency, formatDate } from "../../utils/formatters";

export default function PurchaseDetailPage({ id: propId }) {
  const { id: paramId } = useParams();
  const id = propId || paramId;

  const [purchase, setPurchase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPurchase = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await purchaseApi.getById(id);
        setPurchase(res.data);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPurchase();
    }
  }, [id]);

  if (loading) {
    return <Loader message="Loading purchase order details..." />;
  }

  if (error || !purchase) {
    return (
      <div className="container">
        <div className="back-link-bar">
          <Link to="/purchases" className="btn-secondary btn-small">
            &larr; Back to Purchases
          </Link>
        </div>
        <div className="message-error">{error || "Purchase order not found."}</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="back-link-bar">
        <Link to="/purchases" className="btn-secondary btn-small">
          &larr; Back to Purchases List
        </Link>
      </div>

      <div className="page-header">
        <div>
          <h1>Purchase Order #{purchase.purchaseNumber}</h1>
          <p className="page-subtitle">
            Supplier: <strong>{purchase.supplierName || `Supplier #${purchase.supplierId}`}</strong> &bull; Date:{" "}
            <strong>{formatDate(purchase.purchaseDate)}</strong>
          </p>
        </div>
        <div className="header-total-badge">
          <span>Total:</span>
          <strong>{formatCurrency(purchase.totalAmount)}</strong>
        </div>
      </div>

      {purchase.notes && (
        <div className="notice-box notice-neutral" style={{ marginBottom: "20px" }}>
          <strong>Order Notes:</strong> {purchase.notes}
        </div>
      )}

      <div className="simple-box">
        <h3>Purchased Items Breakdown</h3>
        <div className="table-container">
          <table className="simple-table">
            <thead>
              <tr>
                <th>Medicine ID</th>
                <th>Medicine Item</th>
                <th>Quantity</th>
                <th>Unit Cost</th>
                <th>Line Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {(purchase.purchaseItems || []).map((item, idx) => (
                <tr key={idx}>
                  <td>#{item.medicineId}</td>
                  <td>
                    <strong>{item.medicineName || `Medicine #${item.medicineId}`}</strong>
                  </td>
                  <td>{item.quantity}</td>
                  <td>{formatCurrency(item.unitPrice)}</td>
                  <td>
                    <strong>{formatCurrency((item.quantity || 0) * (item.unitPrice || 0))}</strong>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
