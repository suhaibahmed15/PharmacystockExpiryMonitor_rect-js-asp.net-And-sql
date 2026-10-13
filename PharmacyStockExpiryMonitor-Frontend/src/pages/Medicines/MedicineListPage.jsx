import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import medicineApi from "../../api/medicineApi";
import categoryApi from "../../api/categoryApi";
import { getErrorMessage } from "../../api/axiosClient";
import DataTable from "../../components/common/DataTable";
import StatusBadge from "../../components/common/StatusBadge";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import Modal from "../../components/common/Modal";
import MedicineForm from "./MedicineForm";

export default function MedicineListPage() {
  const navigate = useNavigate();

  const [medicines, setMedicines] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Pagination & Filters
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(""); // "" | "true" | "false"
  const [categoryFilter, setCategoryFilter] = useState("");

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);

  // Delete Confirm State
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadCategories = async () => {
    try {
      const res = await categoryApi.getAll({ page: 1, pageSize: 100 });
      setCategories(res.data.items || res.data || []);
    } catch {
      // ignore
    }
  };

  const loadMedicines = async () => {
    setLoading(true);
    setError("");
    try {
      const params = {
        page,
        pageSize,
        search: search.trim() || undefined,
        isActive: statusFilter !== "" ? statusFilter === "true" : undefined,
        categoryId: categoryFilter ? Number(categoryFilter) : undefined
      };
      const res = await medicineApi.getAll(params);
      const items = res.data.items || [];
      setMedicines(items);
      setTotalCount(res.data.totalCount ?? res.data.totalItems ?? items.length);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadMedicines();
  }, [page, pageSize, statusFilter, categoryFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadMedicines();
  };

  const handleResetFilters = () => {
    setSearch("");
    setStatusFilter("");
    setCategoryFilter("");
    setPage(1);
    setTimeout(loadMedicines, 0);
  };

  const handleOpenAdd = () => {
    setEditingMedicine(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (med) => {
    setEditingMedicine(med);
    setIsModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;
    setDeleting(true);
    setError("");
    try {
      await medicineApi.delete(deleteTargetId);
      setSuccess("Medicine deleted successfully.");
      setDeleteTargetId(null);
      loadMedicines();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    { key: "id", header: "ID", width: "60px" },
    { key: "medicineCode", header: "Code", width: "110px" },
    {
      key: "name",
      header: "Medicine Name",
      render: (row) => (
        <div>
          <strong>{row.name}</strong>
          {row.genericName && (
            <div style={{ fontSize: "12px", color: "#64748b" }}>{row.genericName}</div>
          )}
        </div>
      )
    },
    {
      key: "categoryName",
      header: "Category",
      render: (row) => row.categoryName || `Category #${row.categoryId}`
    },
    {
      key: "currentStock",
      header: "Current Stock",
      render: (row) => {
        const isLow = Number(row.currentStock) <= Number(row.reorderLevel);
        return (
          <span className={isLow ? "stock-low" : "stock-normal"}>
            <strong>{row.currentStock}</strong> {isLow && <span className="low-tag">(Low Stock)</span>}
          </span>
        );
      }
    },
    { key: "reorderLevel", header: "Reorder Min" },
    {
      key: "isActive",
      header: "Status",
      render: (row) => (
        <StatusBadge
          status={row.isActive}
          label={row.isActive ? "Active" : "Inactive"}
        />
      )
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <div className="table-actions">
          <Link
            to={`/medicines/${row.id}/batches`}
            className="btn-secondary btn-small"
            title="View batch lots and expiry dates for this medicine"
          >
            Batches
          </Link>
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

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h1>Medicine Inventory Directory</h1>
          <p className="page-subtitle">
            Manage pharmaceutical formulas, dosage items, safety thresholds, and batch associations.
          </p>
        </div>
        <button type="button" className="btn-primary" onClick={handleOpenAdd}>
          + Add New Medicine
        </button>
      </div>

      {error && <div className="message-error">{error}</div>}
      {success && <div className="message-success">{success}</div>}

      {/* Filter and Search Bar */}
      <div className="top-action-bar">
        <form onSubmit={handleSearchSubmit} className="search-box">
          <input
            type="text"
            placeholder="Search by name or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="filter-select"
          >
            <option value="">All Statuses</option>
            <option value="true">Active Only</option>
            <option value="false">Inactive Only</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className="filter-select"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <button type="submit" className="btn-secondary">
            Filter
          </button>
          {(search || statusFilter || categoryFilter) && (
            <button type="button" className="btn-secondary" onClick={handleResetFilters}>
              Reset
            </button>
          )}
        </form>
      </div>

      {/* Medicines Table */}
      <DataTable
        columns={columns}
        data={medicines}
        loading={loading}
        emptyMessage="No medicines found matching the current search criteria."
        pagination={{
          page,
          pageSize,
          totalCount,
          onPageChange: (p) => setPage(p),
          onPageSizeChange: (sz) => {
            setPageSize(sz);
            setPage(1);
          }
        }}
      />

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingMedicine ? "Edit Medicine Record" : "Add New Medicine"}
        maxWidth="680px"
      >
        <MedicineForm
          editId={editingMedicine?.id}
          initialData={editingMedicine}
          onSuccess={() => {
            setIsModalOpen(false);
            loadMedicines();
          }}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteTargetId)}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Medicine"
        message="Are you sure you want to delete this medicine? This action cannot be undone if transaction logs depend on it."
        confirmText="Yes, Delete Medicine"
        loading={deleting}
      />
    </div>
  );
}
