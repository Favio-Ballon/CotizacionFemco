import React, { useState } from "react";
import { FaPrint } from "react-icons/fa";
import { format } from "date-fns";

const QuotationDocument = () => {
  const [currentDate] = useState(new Date());

  const companyDetails = {
    name: "FEMCO",
    address: "123 Business Avenue, La Paz, Bolivia",
    email: "contact@femco.com",
    phone: "+591 2 1234567"
  };

  const clientInfo = {
    name: "John Smith Industries",
    location: "Santa Cruz, Bolivia",
    quotedBy: "Carlos Rodriguez"
  };

  const products = [
    {
      itemNo: "001",
      catalogNo: "CAT-2024-001",
      model: "Industrial Pump X100",
      description: "High-performance industrial water pump",
      quantity: 2,
      unitPrice: 1500.00,
      totalPrice: 3000.00
    },
    {
      itemNo: "002",
      catalogNo: "CAT-2024-002",
      model: "Filter System Pro",
      description: "Advanced filtration system with dual cores",
      quantity: 1,
      unitPrice: 2500.00,
      totalPrice: 2500.00
    }
  ];

  const conditions = [
    "Prices quoted in Bolivianos (Bs.)",
    "Delivery time: 15-20 working days",
    "Payment terms: 50% advance, 50% before delivery",
    "Offer valid for 30 days",
    "Transportation not included in price"
  ];

  const handlePrint = () => {
    window.print();
  };

  const HeaderComponent = () => (
    <div className="bg-[#1b1464] text-white p-6 rounded-t-lg">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">{companyDetails.name}</h1>
          <div className="text-sm space-y-1">
            <p>{companyDetails.address}</p>
            <p>Email: {companyDetails.email}</p>
            <p>Phone: {companyDetails.phone}</p>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-semibold">QUOTATION</h2>
          <p className="text-sm mt-2">#{Math.floor(Math.random() * 10000).toString().padStart(4, "0")}</p>
        </div>
      </div>
    </div>
  );

  const ClientInfoComponent = () => (
    <div className="bg-gray-50 p-6 border-b">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="font-semibold mb-2">Client Information</h3>
          <p className="text-gray-700">Name: {clientInfo.name}</p>
          <p className="text-gray-700">Location: {clientInfo.location}</p>
        </div>
        <div className="text-right">
          <p className="text-gray-700">Date: {format(currentDate, "dd/MM/yyyy")}</p>
          <p className="text-gray-700">Quoted By: {clientInfo.quotedBy}</p>
        </div>
      </div>
    </div>
  );

  const ProductTableComponent = () => (
    <div className="p-6 overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-3 text-left">Item No.</th>
            <th className="p-3 text-left">Catalog No.</th>
            <th className="p-3 text-left">Model</th>
            <th className="p-3 text-left">Description</th>
            <th className="p-3 text-right">Quantity</th>
            <th className="p-3 text-right">Unit Price (Bs.)</th>
            <th className="p-3 text-right">Total Price (Bs.)</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.itemNo} className="border-b hover:bg-gray-50 transition-colors">
              <td className="p-3">{product.itemNo}</td>
              <td className="p-3">{product.catalogNo}</td>
              <td className="p-3">{product.model}</td>
              <td className="p-3">{product.description}</td>
              <td className="p-3 text-right">{product.quantity}</td>
              <td className="p-3 text-right">{product.unitPrice.toFixed(2)}</td>
              <td className="p-3 text-right">{product.totalPrice.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const TotalComponent = () => {
    const total = products.reduce((sum, product) => sum + product.totalPrice, 0);
    return (
      <div className="p-6 bg-gray-50">
        <div className="flex justify-end items-center">
          <div className="text-right">
            <p className="text-lg font-semibold">Total Amount:</p>
            <p className="text-3xl font-bold text-[#1b1464]">Bs. {total.toFixed(2)}</p>
          </div>
        </div>
      </div>
    );
  };

  const ConditionsComponent = () => (
    <div className="p-6 bg-white">
      <h3 className="font-semibold mb-4">Terms and Conditions</h3>
      <ul className="list-disc list-inside space-y-2 text-gray-700">
        {conditions.map((condition, index) => (
          <li key={index}>{condition}</li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto my-8 bg-white rounded-lg shadow-lg print:shadow-none">
      <div className="print:hidden mb-4 flex justify-end">
        <button
          onClick={handlePrint}
          className="bg-[#1b1464] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-opacity-90 transition-colors"
        >
          <FaPrint />
          Print Document
        </button>
      </div>
      <HeaderComponent />
      <ClientInfoComponent />
      <ProductTableComponent />
      <TotalComponent />
      <ConditionsComponent />
    </div>
  );
};

export default QuotationDocument;