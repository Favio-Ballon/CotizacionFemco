import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import "./index.css";
import QuotationForm from "./App.jsx";
import "./index.css";
import QuotationDocument from "./pdfPeview.jsx";
import ProductManagement from "./productos.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element:<Navigate to="/cotizacion/new" replace/>,
  },
  {
    path: "/cotizacion/:id",
    element:<QuotationForm />
  },
  {
    path: "/cotizacion/:id/preview",
    element:<QuotationDocument />
  },
  {
    path: "/productos",
    element: <ProductManagement />,
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
