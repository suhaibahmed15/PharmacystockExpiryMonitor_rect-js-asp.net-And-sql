import React, { useEffect, useState } from "react";
import supplierApi from "../../api/supplierApi";
import { getErrorMessage } from "../../api/axiosClient";
import DataTable from "../../components/common/DataTable";
import StatusBadge from "../../components/common/StatusBadge";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import Modal from "../../components/common/Modal";
import SupplierForm from "./SupplierForm";

export default function SupplierListPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);

  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadSuppliers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await supplierApi.getAll({
        page: 1,
        pageSize: 100,
        search: search.trim() || undefined,
        isActive: statusFilter !== "" ? statusFilter === "true" : undefined
      });
      const items = res.data.items || res.data || [];
      setSuppliers(items);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, [search, statusFilter]);

  const handleOpenAdd = () => {
    setEditingSupplier(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (sup) => {
    setEditingSupplier(sup);
    setIsModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;
    setDeleting(true);
    setError("");
    try {
      await supplierApi.delete(deleteTargetId);
      setSuccess("Supplier deleted successfully.");
      setDeleteTargetId(null);
      loadSuppliers();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    { key: "id", header: "ID", width: "60px" },
    {
      key: "name",
      header: "Supplier Name",
      render: (row) => <strong>{row.name}</strong>
    },
    { key: "contactPerson", header: "Contact Person" },
    { key: "phone", header: "Phone" },
    { key: "email", header: "Email" },
    { key: "address", header: "Address" },
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

  const pagedData = suppliers.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h1>Suppliers Directory</h1>
          <p className="page-subtitle">
            Manage pharmaceutical wholesale vendors, distributors, and procurement contacts.
          </p>
        </div>
        <button type="button" className="btn-primary" onClick={handleOpenAdd}>
          + Add Supplier
        </button>
      </div>

      {error && <div className="message-error">{error}</div>}
      {success && <div className="message-success">{success}</div>}

      <div className="top-action-bar">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search supplier name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">All Statuses</option>
            <option value="true">Active Only</option>
            <option value="false">Inactive Only</option>
          </select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={pagedData}
        loading={loading}
        emptyMessage="No suppliers registered matching criteria."
        pagination={{
          page,
          pageSize,
          totalCount: suppliers.length,
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
        title={editingSupplier ? "Edit Supplier" : "Add Supplier"}
        maxWidth="600px"
      >
        <SupplierForm
          editId={editingSupplier?.id}
          initialData={editingSupplier}
          onSuccess={() => {
            setIsModalOpen(false);
            loadSuppliers();
          }}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(deleteTargetId)}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Supplier"
        message="Are you sure you want to delete this supplier record? Past purchase order history may link to this record."
        confirmText="Yes, Delete"
        loading={deleting}
      />
    </div>
  );
}
