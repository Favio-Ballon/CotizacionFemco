import { useEffect, useState } from "react";
import { FiEdit, FiPrinter, FiDownload, FiSearch } from "react-icons/fi";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Sidebar from "./components/sidebar";
import { useNavigate } from "react-router-dom";

const QuotationList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [cotizaciones, setCotizaciones] = useState([]);

  useEffect(() => {
    fetchCotizaciones();
  }, []);

  const fetchCotizaciones = async () => {
    const response = await fetch("http://localhost:3000/cotizacion");
    const data = await response.json();
    setCotizaciones(data);
  };

  const mockData = [
    {
      id: 1,
      clientName: "John Smith",
      referenceNumber: "QT-2024-001",
      date: "2024-01-15",
    },
    {
      id: 2,
      clientName: "Emma Johnson",
      referenceNumber: "QT-2024-002",
      date: "2024-01-16",
    },
    {
      id: 3,
      clientName: "Michael Brown",
      referenceNumber: "QT-2024-003",
      date: "2024-01-17",
    },
    {
      id: 4,
      clientName: "Sarah Davis",
      referenceNumber: "QT-2024-004",
      date: "2024-01-18",
    },
    {
      id: 5,
      clientName: "James Wilson",
      referenceNumber: "QT-2024-005",
      date: "2024-01-19",
    },
    {
      id: 6,
      clientName: "Lisa Anderson",
      referenceNumber: "QT-2024-006",
      date: "2024-01-20",
    },
  ];

  const filteredData = cotizaciones.filter((quote) => {
    const matchesSearch =
      quote.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.referencia.toLowerCase().includes(searchTerm.toLowerCase());

    const quoteDate = new Date(quote.fecha);

    const isWithinDateRange =
      (!startDate || quoteDate >= startDate) &&
      (!endDate || quoteDate <= endDate);

    return matchesSearch && isWithinDateRange;
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handleEdit = (id) => {
    navigate(`/cotizacion/${id}`);
  };

  const handlePrint = (id) => {
    navigate(`/cotizacion/${id}/preview`);
  };

  const formatDate = (sqlDate) => {
    const date = new Date(sqlDate);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  return (
    <>
      <div className="container mx-auto px-4 py-8 lg:ml-20">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Cotizaciones</h1>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="relative">
              <FiSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por cliente o referencia"
                className="pl-10 w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <DatePicker
                selected={startDate}
                onChange={setStartDate}
                placeholderText="Fecha de inicio"
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <DatePicker
                selected={endDate}
                onChange={setEndDate}
                placeholderText="Fecha de fin"
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre del cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Referencia
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedData.map((quote) => (
                  <tr key={quote.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">{quote.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {quote.nombre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {quote.referencia}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {formatDate(quote.fecha)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(quote.id)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                          aria-label="Edit quotation"
                        >
                          <FiEdit />
                        </button>
                        <button
                          onClick={() => handlePrint(quote.id)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                          aria-label="Print quotation"
                        >
                          <FiPrinter />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-700">
              Showing {startIndex + 1} to{" "}
              {Math.min(startIndex + itemsPerPage, filteredData.length)} of{" "}
              {filteredData.length} entries
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default QuotationList;
