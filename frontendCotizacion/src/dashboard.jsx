import { useState, useEffect, useMemo } from "react";
import {
  FaChartLine,
  FaFileInvoiceDollar,
  FaCalendarAlt,
  FaDownload,
} from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { format, addDays, subDays, isWithinInterval } from "date-fns";
import { BACKEND_URL } from "./main.jsx";

const QuoteMetricsDashboard = () => {
  const token = localStorage.getItem("token");
  const [dateRange, setDateRange] = useState([
    subDays(new Date(), 7),
    new Date(),
  ]);
  const [startDate, endDate] = dateRange;
  const [isLoading, setIsLoading] = useState(false);
  const [quoteData, setQuoteData] = useState([]);

  // Función para obtener los datos de la API
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${BACKEND_URL}/cotizacion`, {
          headers: {
            Authorization: `Bearer ${token}`, // Reemplaza con tu token Bearer
          },
        });
        const data = await response.json();
        setQuoteData(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Función para generar un rango de fechas
  const generateDateRange = (startDate, endDate) => {
    const dates = [];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      dates.push(format(currentDate, "yyyy-MM-dd"));
      currentDate = addDays(currentDate, 1);
    }

    return dates;
  };

  // Transformar los datos de la API para el gráfico
  const transformedData = useMemo(() => {
    const dataByDate = {};

    quoteData.forEach((quote) => {
      const date = format(new Date(quote.fecha), "yyyy-MM-dd");

      if (!dataByDate[date]) {
        dataByDate[date] = {
          date,
          cantidadCotizado: 0,
          valorCotizado: 0,
        };
      }

      dataByDate[date].cantidadCotizado += 1; // Sumar una cotización por día
      dataByDate[date].valorCotizado += quote.total; // Sumar el valor cotizado por día
    });

    // Rellenar días faltantes con 0
    const dateRange = generateDateRange(startDate, endDate);
    return dateRange.map((date) => ({
      date,
      cantidadCotizado: dataByDate[date]?.cantidadCotizado || 0,
      valorCotizado: dataByDate[date]?.valorCotizado || 0,
    }));
  }, [quoteData, startDate, endDate]);

  // Filtrar los datos según el rango de fechas seleccionado
  const filteredData = useMemo(() => {
    return transformedData.filter((item) => {
      const itemDate = new Date(item.date);
      return isWithinInterval(itemDate, { start: startDate, end: endDate });
    });
  }, [transformedData, startDate, endDate]);

  // Calcular métricas
  const metrics = useMemo(() => {
    const totalQuotes = filteredData.reduce(
      (sum, item) => sum + item.cantidadCotizado,
      0
    );
    const totalValue = filteredData.reduce(
      (sum, item) => sum + item.valorCotizado,
      0
    );
    return { totalQuotes, totalValue };
  }, [filteredData]);

  const handleDateRangeSelect = (range) => {
    setIsLoading(true);
    setDateRange(range);
    setTimeout(() => setIsLoading(false), 500);
  };

  const predefinedRanges = [
    { label: "Últimos 7 días", range: [subDays(new Date(), 7), new Date()] },
    { label: "Últimos 30 días", range: [subDays(new Date(), 30), new Date()] },
    { label: "Últimos 90 días", range: [subDays(new Date(), 90), new Date()] },
  ];

  const MetricCard = ({ title, value, icon: Icon, className }) => (
    <div
      className={`p-6 rounded-lg shadow-lg ${className} transition-transform hover:scale-105`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
        <Icon className="text-2xl text-gray-600" />
      </div>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );

  return (
    <div className="lg:ml-20">
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              Gráfico de Cotizaciones
            </h1>

            <div className="flex flex-wrap gap-4 items-center mb-6">
              <div className="flex-1 min-w-[300px]">
                <DatePicker
                  selectsRange
                  startDate={startDate}
                  endDate={endDate}
                  onChange={handleDateRangeSelect}
                  className="w-full p-2 border rounded-md"
                  dateFormat="MMM dd, yyyy"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {predefinedRanges.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => handleDateRangeSelect(item.range)}
                    className="px-4 py-2 bg-white border rounded-md hover:bg-gray-50 transition-colors"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <MetricCard
              title="Total de Cotizaciones"
              value={isLoading ? "Cargando..." : metrics.totalQuotes}
              icon={FaFileInvoiceDollar}
              className="bg-white"
            />
            <MetricCard
              title="Valor Total"
              value={
                isLoading
                  ? "Cargando..."
                  : `BS ${metrics.totalValue.toLocaleString()}`
              }
              icon={FaChartLine}
              className="bg-white"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold mb-4">
                Tendencia de Cotizaciones
              </h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={filteredData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="cantidadCotizado"
                      stroke="#4F46E5"
                      fill="#818CF8"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold mb-4">
                Valores de Cotizaciones
              </h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={filteredData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="valorCotizado" fill="#4F46E5" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={() => console.log("Exportar datos")}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              <FaDownload /> Exportar Datos
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuoteMetricsDashboard;
