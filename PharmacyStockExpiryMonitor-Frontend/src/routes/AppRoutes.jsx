import React from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";

// Layouts
import AuthLayout from "../layouts/AuthLayout";
import MainLayout from "../layouts/MainLayout";

// Route guards
import ProtectedRoute from "./ProtectedRoute";
// import RoleRoute from "./RoleRoute"; // Temporarily commented out

// Pages
import LoginPage from "../pages/Login/LoginPage";
import DashboardPage from "../pages/Dashboard/DashboardPage";

// --- Temporarily commented out all other pages ---
// import MedicineListPage from "../pages/Medicines/MedicineListPage";
// import MedicineForm from "../pages/Medicines/MedicineForm";
// import MedicineBatchesPage from "../pages/Batches/MedicineBatchesPage";
// import CategoryListPage from "../pages/Categories/CategoryListPage";
// import CategoryForm from "../pages/Categories/CategoryForm";
// import SupplierListPage from "../pages/Suppliers/SupplierListPage";
// import SupplierForm from "../pages/Suppliers/SupplierForm";
// import BatchListPage from "../pages/Batches/BatchListPage";
// import BatchForm from "../pages/Batches/BatchForm";
// import PurchaseListPage from "../pages/Purchases/PurchaseListPage";
// import PurchaseCreatePage from "../pages/Purchases/PurchaseCreatePage";
// import PurchaseDetailPage from "../pages/Purchases/PurchaseDetailPage";
// import StockTransactionListPage from "../pages/StockTransactions/StockTransactionListPage";
// import StockTransactionForm from "../pages/StockTransactions/StockTransactionForm";
// import AlertListPage from "../pages/Alerts/AlertListPage";
// import IntelligencePage from "../pages/Intelligence/IntelligencePage";
// import UserListPage from "../pages/Users/UserListPage";
// import UserForm from "../pages/Users/UserForm";
// import RoleListPage from "../pages/Roles/RoleListPage";
// import NotFoundPage from "../pages/NotFoundPage";

export const router = createBrowserRouter([
  // Public Auth Route
  {
    element: <AuthLayout />,
    children: [
      {
        path: "/login",
        element: <LoginPage />
      }
    ]
  },

  // Protected Routes - Only Dashboard active for all 3 roles
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          {
            path: "/",
            element: <DashboardPage />
          }
          /*
          // Temporarily commented out:
          // Medicines
          {
            path: "/medicines",
            element: <MedicineListPage />
          },
          {
            path: "/medicines/new",
            element: <MedicineForm />
          },
          {
            path: "/medicines/:id/edit",
            element: <MedicineForm />
          },
          {
            path: "/medicines/:id/batches",
            element: <MedicineBatchesPage />
          },

          // Categories
          {
            path: "/categories",
            element: <CategoryListPage />
          },
          {
            path: "/categories/new",
            element: <CategoryForm />
          },
          {
            path: "/categories/:id/edit",
            element: <CategoryForm />
          },

          // Suppliers
          {
            path: "/suppliers",
            element: <SupplierListPage />
          },
          {
            path: "/suppliers/new",
            element: <SupplierForm />
          },
          {
            path: "/suppliers/:id/edit",
            element: <SupplierForm />
          },

          // Batches
          {
            path: "/batches",
            element: <BatchListPage />
          },
          {
            path: "/batches/new",
            element: <BatchForm />
          },
          {
            path: "/batches/:id/edit",
            element: <BatchForm />
          },

          // Purchases
          {
            path: "/purchases",
            element: <PurchaseListPage />
          },
          {
            path: "/purchases/new",
            element: <PurchaseCreatePage />
          },
          {
            path: "/purchases/:id",
            element: <PurchaseDetailPage />
          },

          // Stock Transactions
          {
            path: "/transactions",
            element: <StockTransactionListPage />
          },
          {
            path: "/transactions/new",
            element: <StockTransactionForm />
          },

          // Alerts
          {
            path: "/alerts",
            element: <AlertListPage />
          },

          // Intelligence & Predictions
          {
            path: "/intelligence",
            element: <IntelligencePage />
          },
          {
            path: "/predictions",
            element: <IntelligencePage />
          },

          // Admin-only Routes
          {
            element: <RoleRoute allowedRoles={["Admin"]} />,
            children: [
              {
                path: "/users",
                element: <UserListPage />
              },
              {
                path: "/users/new",
                element: <UserForm />
              },
              {
                path: "/roles",
                element: <RoleListPage />
              }
            ]
          },

          // Access restriction / 404
          {
            path: "/unauthorized",
            element: <NotFoundPage isUnauthorized />
          },
          {
            path: "/archive",
            element: <NotFoundPage />
          },
          {
            path: "*",
            element: <NotFoundPage />
          }
          */
        ]
      }
    ]
  },

  // Fallback Catch-all
  {
    path: "*",
    element: <Navigate to="/" replace />
  }
]);

export default router;
