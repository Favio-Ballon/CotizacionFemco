import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import "./index.css";
import QuotationForm from "./App.jsx";
import "./index.css";
import QuotationDocument from "./pdfPeview.jsx";
import ProductManagement from "./productos.jsx";
import QuotationList from "./cotizaciones.jsx";
import Sidebar from "./components/sidebar.jsx";

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
    path: "*",
    element: <Navigate to="/cotizacion/new" replace />,
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
