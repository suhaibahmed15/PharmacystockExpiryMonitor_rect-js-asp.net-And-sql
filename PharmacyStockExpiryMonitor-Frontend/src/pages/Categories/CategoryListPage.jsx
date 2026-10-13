import React, { useEffect, useState } from "react";
import categoryApi from "../../api/categoryApi";
import { getErrorMessage } from "../../api/axiosClient";
import DataTable from "../../components/common/DataTable";
import StatusBadge from "../../components/common/StatusBadge";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import Modal from "../../components/common/Modal";
import CategoryForm from "./CategoryForm";

export default function CategoryListPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadCategories = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await categoryApi.getAll({
        page: 1,
        pageSize: 100,
        search: search.trim() || undefined,
        isActive: statusFilter !== "" ? statusFilter === "true" : undefined
      });
      const items = res.data.items || res.data || [];
      setCategories(items);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, [search, statusFilter]);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingCategory(cat);
    setIsModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;
    setDeleting(true);
    setError("");
    try {
      await categoryApi.delete(deleteTargetId);
      setSuccess("Category deleted successfully.");
      setDeleteTargetId(null);
      loadCategories();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    { key: "id", header: "ID", width: "70px" },
    {
      key: "name",
      header: "Category Name",
      render: (row) => <strong>{row.name}</strong>
    },
    {
      key: "description",
      header: "Description",
      render: (row) => row.description || <span style={{ color: "#94a3b8" }}>No description</span>
    },
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

  const pagedData = categories.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h1>Medicine Categories</h1>
          <p className="page-subtitle">
            Classify and organize pharmacological inventory by therapeutic purpose.
          </p>
        </div>
        <button type="button" className="btn-primary" onClick={handleOpenAdd}>
          + Add Category
        </button>
      </div>

      {error && <div className="message-error">{error}</div>}
      {success && <div className="message-success">{success}</div>}

      <div className="top-action-bar">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search category name..."
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
        emptyMessage="No medicine categories found."
        pagination={{
          page,
          pageSize,
          totalCount: categories.length,
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
        title={editingCategory ? "Edit Category" : "Add Category"}
        maxWidth="540px"
      >
        <CategoryForm
          editId={editingCategory?.id}
          initialData={editingCategory}
          onSuccess={() => {
            setIsModalOpen(false);
            loadCategories();
          }}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(deleteTargetId)}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Category"
        message="Are you sure you want to delete this category? Medicines associated with it may be impacted."
        confirmText="Yes, Delete"
        loading={deleting}
      />
    </div>
  );
}
