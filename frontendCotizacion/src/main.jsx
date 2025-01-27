import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import QuotationForm from "./App.jsx";
import "./index.css";
import QuotationDocument from "./pdfPeview.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element:<QuotationForm />,
  },
  {
    path: "/cotizar",
    element:<QuotationForm />
  },
  {
    path: "/cotizacion/:id/preview",
    element:<QuotationDocument />
  }
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
