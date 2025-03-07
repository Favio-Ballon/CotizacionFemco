import { useState, useEffect, useMemo } from "react";
import { FaChartLine, FaFileInvoiceDollar, FaDownload } from "react-icons/fa";
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
import { format, addDays, subDays, isWithinInterval, set } from "date-fns";
import { BACKEND_URL } from "./main.jsx";
import { ca } from "date-fns/locale";
import { use } from "react";

const BillMetricsDashboard = () => {
  const token = localStorage.getItem("token");
  const PHPSESSID = localStorage.getItem("PHPSESSID");
  const [dateRange, setDateRange] = useState([
    subDays(new Date(), 7),
    new Date(),
  ]);
  const [startDate, endDate] = dateRange;
  const [isLoading, setIsLoading] = useState(false);
  const [billData, setBillData] = useState([]);
  const [sucursales, setSucursales] = useState([
    { id: 3, nombre: "Fabrica" },
    { id: 11, nombre: "SP" },
    { id: 17, nombre: "LU" },
    { id: 10, nombre: "SM" },
    { id: 15, nombre: "LP" },
    { id: 16, nombre: "LM" },
    { id: 18, nombre: "LS" },
    { id: 5, nombre: "S/N" },
    { id: 6, nombre: "CH" },
    { id: 14, nombre: "S/N" },
    { id: 20, nombre: "S/N" },
    { id: 21, nombre: "LA" },
    { id: 22, nombre: "S/N" },
  ]);
  const [sucursal, setSucursal] = useState(11);

  // Función para obtener los datos de la API
  useEffect(() => {
    fetchData();
  }, [dateRange, token, PHPSESSID, sucursal]);

  useEffect(() => {
    if (!PHPSESSID) {
      loginFemco();
    } else {
      fetchData();
    }
  }, [PHPSESSID]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${BACKEND_URL}/cotizacion/dashboard/facturas`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            usuario: sucursal,
            inicio: format(startDate, "yyyy-MM-dd"),
            fin: format(endDate, "yyyy-MM-dd"),
            PHPSESSID: PHPSESSID,
          }),
        }
      );
      const data = await response.json();
      console.log(data);
      setBillData(data.respuesta.respuesta);
    } catch (error) {
      loginFemco();
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const loginFemco = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${BACKEND_URL}/usuario/dashboard`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          usuario: "11",
        }),
      });
      const data = await response.json();
      const PHPSESSID = data.PHPSESSID;
      console.log(PHPSESSID);
      localStorage.setItem("PHPSESSID", PHPSESSID);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

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

  // Transformar los datos de la API para el gráfico y calcular métricas adicionales
  const transformedData = useMemo(() => {
    if (!billData) return { dataByDate: [], topClient: null };
    const dataByDate = {};
    const clientPurchases = {};
    const topQuantity = {};

    billData.forEach((bill) => {
      const date = format(new Date(bill.DocDate), "yyyy-MM-dd");
      const clientName = bill.CardName;
      const totalValue = parseFloat(bill.DocTotal);

      // Acumular datos por fecha
      if (!dataByDate[date]) {
        dataByDate[date] = {
          date,
          cantidadFacturas: 0,
          valorFacturado: 0,
        };
      }
      dataByDate[date].cantidadFacturas += 1;
      dataByDate[date].valorFacturado += totalValue;

      // Acumular compras por cliente
      if (!clientPurchases[clientName]) {
        clientPurchases[clientName] = 0;
      }
      if (!topQuantity[clientName]) {
        topQuantity[clientName] = 0;
      }
      clientPurchases[clientName] += totalValue;
      topQuantity[clientName] += 1;
    });

    // Encontrar al cliente que más compró
    let topClient = null;
    let maxPurchase = 0;
    for (const client in clientPurchases) {
      if (clientPurchases[client] > maxPurchase) {
        maxPurchase = clientPurchases[client];
        topClient = client;
      }
    }

    //Encontrar al cliente que mas facturo
    let topClientQuantity = null;
    let maxQuantity = 0;
    for (const client in topQuantity) {
      if (topQuantity[client] > maxQuantity) {
        maxQuantity = topQuantity[client];
        topClientQuantity = client;
      }
    }

    // Rellenar días faltantes con 0
    const dateRange = generateDateRange(startDate, endDate);

    return {
      dataByDate: dateRange.map((date) => ({
        date,
        cantidadFacturas: dataByDate[date]?.cantidadFacturas || 0,
        valorFacturado: dataByDate[date]?.valorFacturado || 0,
      })),
      topClient: topClient ? { name: topClient, total: maxPurchase } : null, // Cliente que más compró
      topClientQuantity: topClientQuantity
        ? { name: topClientQuantity, total: maxQuantity }
        : null, // Cliente que mas facturo
    };
  }, [billData, startDate, endDate]);

  // Filtrar los datos según el rango de fechas seleccionado
  const filteredData = useMemo(() => {
    console.log(transformedData);
    return transformedData.dataByDate?.filter((item) => {
      const itemDate = new Date(item.date);
      return isWithinInterval(itemDate, { start: startDate, end: endDate });
    });
  }, [transformedData, startDate, endDate]);

  // Calcular métricas
  const metrics = useMemo(() => {
    const totalBills = filteredData.reduce(
      (sum, item) => sum + item.cantidadFacturas,
      0
    );
    const totalValue = filteredData.reduce(
      (sum, item) => sum + item.valorFacturado,
      0
    );
    const estimatedProfit = totalValue * 0.08; // 8% del valor total
    setIsLoading(false);
    return {
      totalBills,
      totalValue,
      estimatedProfit,
      topClient: transformedData.topClient,
      topClientQuantity: transformedData.topClientQuantity,
    };
  }, [
    filteredData,
    transformedData.topClient,
    transformedData.topClientQuantity,
  ]);

  const handleDateRangeSelect = (range) => {
    setIsLoading(true);
    setDateRange(range);
  };

  const predefinedRanges = [
    { label: "Últimos 7 días", range: [subDays(new Date(), 7), new Date()] },
    { label: "Últimos 30 días", range: [subDays(new Date(), 30), new Date()] },
    { label: "Últimos 90 días", range: [subDays(new Date(), 90), new Date()] },
    { label: "Último Año", range: [subDays(new Date(), 365), new Date()] },
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
            <div className="flex gap-2 mb-4 ">
              <h1 className="text-3xl font-bold text-gray-800 mb-4">
                Gráfico de Facturas
              </h1>
              {/* select of sucursal */}
              <select
                name="sucursal"
                id="sucursal"
                className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={sucursal}
                onChange={(e) => setSucursal(e.target.value)}
              >
                {sucursales.map((sucursal) => (
                  <option key={sucursal.id} value={sucursal.id}>
                    {sucursal.nombre}
                  </option>
                ))}
              </select>
            </div>
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

          <div className="grid grid-cols-1 md:grid-rows-2 md:grid-cols-6 gap-6 mb-8">
            <MetricCard
              title="Total de Facturas"
              value={isLoading ? "Cargando..." : metrics.totalBills}
              icon={FaFileInvoiceDollar}
              className="bg-white col-span-2"
            />
            <MetricCard
              title="Valor Total"
              value={
                isLoading
                  ? "Cargando..."
                  : `BS ${metrics.totalValue.toLocaleString()}`
              }
              icon={FaChartLine}
              className="bg-white col-span-2"
            />
            <MetricCard
              title="Ganancia Estimada (8%)"
              value={
                isLoading
                  ? "Cargando..."
                  : `BS ${metrics.estimatedProfit.toLocaleString()}`
              }
              icon={FaChartLine}
              className="bg-white col-span-2"
            />
            <MetricCard
              title="Cliente que más compró"
              value={
                isLoading
                  ? "Cargando..."
                  : metrics.topClient
                  ? `${
                      metrics.topClient.name
                    } (${metrics.topClient.total.toLocaleString()} Bs)`
                  : "No hay datos"
              }
              icon={FaChartLine}
              className="bg-white col-span-3"
            />
            <MetricCard
              title="Cliente que más facturas emitió"
              value={
                isLoading
                  ? "Cargando..."
                  : metrics.topClientQuantity
                  ? `${
                      metrics.topClientQuantity?.name
                    } (${metrics.topClientQuantity?.total.toLocaleString()})`
                  : "No hay datos"
              }
              icon={FaChartLine}
              className="bg-white col-span-3"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold mb-4">
                Tendencia de Facturas
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
                      dataKey="cantidadFacturas"
                      stroke="#4F46E5"
                      fill="#818CF8"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold mb-4">
                Valores de Facturas
              </h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={filteredData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="valorFacturado" fill="#4F46E5" />
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

export default BillMetricsDashboard;
