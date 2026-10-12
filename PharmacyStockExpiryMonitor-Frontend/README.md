# Pharmacy Stock & Expiry Monitor — React JSX Frontend

React + Vite frontend for the Pharmacy Stock & Expiry Monitor assignment. The interface uses a **navy blue and orange** theme and is responsive for desktop, tablet and mobile.

## Requirements
- Node.js 18 or newer
- The existing ASP.NET Core 8 API and SQL Server database
- Docker is not used

## Run locally (Windows PowerShell)
```powershell
cd PharmacyStockExpiryMonitor-Frontend
npm install
Copy-Item .env.example .env
npm run dev
```
Open the URL printed by Vite, normally `http://localhost:5173`.

To create a production build:
```powershell
npm run build
```

## Connect to the API
1. Start your ASP.NET Core API in Visual Studio.
2. Open Swagger and confirm the exact route names and request/response shapes.
3. Set `VITE_API_BASE_URL` in `.env` to the API URL ending in `/api`, for example `https://localhost:7092/api`.
4. Check `src/api.js`. It currently uses the singular route names used by the backend work discussed in this project (`/Medicine`, `/Category`, `/Supplier`, etc.). If your controllers use plural routes or different names, update the `routes` object there to match Swagger exactly.
5. Restart Vite after editing `.env`.

The frontend sends a JWT from `localStorage` as `Authorization: Bearer <token>` after login. The login form currently expects `POST /Auth/login` with `{ "email": "...", "password": "..." }` and a response containing a `token`, `accessToken`, or `jwt` property. Adjust `LoginPage` in `src/App.jsx` if the actual `AuthController` contract differs.

## Screens and assignment coverage
- Login and JWT bearer token handling
- Responsive dashboard summary cards and chart
- Medicine, category, supplier and batch management forms
- Purchases and stock transaction/ledger views
- Alerts and resolve action
- AI stock intelligence / advisory results
- User and role management screen
- Search, pagination controls, loading, empty, and API error states
- Confirmation before delete
- Sample/demo mode to preview the UI without a running API

## Important integration notes
The assignment document specifies `GET /api/dashboard/summary`, paginated medicine/category/supplier endpoints, CRUD, alerts and an AI evaluation endpoint such as `POST /api/intelligence/evaluate`. The current backend implementation may use singular controller routes and different DTO property names. This frontend uses the project’s known controller naming as defaults, but the exact route, role, stock-count, purchase-item, and prediction payloads must be verified in Swagger. The purchases screen is currently a record list/form scaffold; if the API requires nested `PurchaseItems`, add a line-item editor matching its `CreatePurchaseDto`. Likewise, use the exact payload required by the stock transaction service before enabling production stock changes.

Demo preview uses illustrative sample records; these are not data from your SQL Server and the demo mode is read-only.

## Structure
```text
src/
  App.jsx       Main layout, routes, screens and CRUD interactions
  api.js        Axios instance, JWT interceptor and API route map
  main.jsx      React entry point
  styles.css    Navy blue/orange responsive theme
```
