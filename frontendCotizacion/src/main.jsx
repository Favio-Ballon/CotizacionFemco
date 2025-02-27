// http://localhost:3000  || https://api.cotizafemco.com
export const BACKEND_URL = "http://localhost:3000";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import "./index.css";
import QuotationForm from "./formCotizar.jsx";
import "./index.css";
import QuotationDocument from "./pdfPreview.jsx";
import ProductManagement from "./listProductos.jsx";
import QuotationList from "./listCotizaciones.jsx";
import Sidebar from "./components/sidebar.jsx";
import LoginPage from "./login.jsx";
import QuoteMetricsDashboard from "./dashboard.jsx";

const MainLayout = ({ children }) => (
  <div>
    <Sidebar /> {/* Always include the Sidebar */}
    <div className="content">{children}</div>
  </div>
);

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/cotizacion/new" replace />,
  },
  {
    path: "/cotizacion/:id",
    element: (
      <MainLayout>
        <QuotationForm />
      </MainLayout>
    ),
  },
  {
    path: "/cotizacion/new",
    element: (
      <MainLayout>
        <QuotationForm />
      </MainLayout>
    ),
  },
  {
    path: "/cotizacion/:id/preview",
    element: (
      <MainLayout>
        <QuotationDocument />
      </MainLayout>
    ),
  },
  {
    path: "/productos",
    element: (
      <MainLayout>
        <ProductManagement />
      </MainLayout>
    ),
  },
  {
    path: "/cotizaciones",
    element: (
      <MainLayout>
        <QuotationList />
      </MainLayout>
    ),
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/dashboard",
    element: (
      <MainLayout>
        <QuoteMetricsDashboard />
      </MainLayout>
    ),
  },
  {
    path: "*",
    element: <Navigate to="/cotizacion/new" replace />,
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
