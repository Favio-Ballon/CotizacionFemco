import React, { useState, useEffect } from "react";
import { FaTrash, FaEdit, FaPrint, FaSave, FaPlus } from "react-icons/fa";
import Sidebar from "./components/sidebar";

const QuotationForm = () => {
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    reference: "",
  });

  const [productEntry, setProductEntry] = useState({
    catalogo: "",
    modelo: "",
    producto: "",
    cantidad: "",
    precio: "",
  });

  const [products, setProducts] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [errors, setErrors] = useState({});
  const [datosModelo, setDatosModelo] = useState({});
  const [datosProducto, setDatosProducto] = useState({});
  const [seleccionarProducto, setSeleccionarProducto] = useState([]);

  useEffect(() => {
    checkModeloInSession();
    checkProductoInSession();
  }, []);

  async function checkModeloInSession() {
    // Check if data is already stored in sessionStorage
    const storedData = sessionStorage.getItem("modeloData");
    if (storedData) {
      console.log("Data already stored in sessionStorage");
      setDatosModelo(JSON.parse(storedData));
      return;
    }

    // If data is not stored, fetch and store it
    await fetchModeloAndStoreInSession();
  }

  async function checkProductoInSession() {
    // Check if data is already stored in sessionStorage
    const storedData = sessionStorage.getItem("productoData");
    if (storedData) {
      console.log("Data already stored in sessionStorage");
      setDatosProducto(JSON.parse(storedData));
      return;
    }

    // If data is not stored, fetch and store it
    await fetchProductoAndStoreInSession();
  }

  async function fetchProductoAndStoreInSession() {
    try {
      const response = await fetch("http://localhost:3000/producto");
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }

      const data = await response.json();

      // Save the data in sessionStorage
      sessionStorage.setItem("productoData", JSON.stringify(data));
      console.log("Data stored successfully in sessionStorage");
      setDatosProducto(data);
    } catch (error) {
      console.error("Error fetching and storing data:", error);
    }
  }

  async function fetchModeloAndStoreInSession() {
    try {
      const response = await fetch("http://localhost:3000/modelo");
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }

      const data = await response.json();

      // Save the data in sessionStorage
      sessionStorage.setItem("modeloData", JSON.stringify(data));
      console.log("Data stored successfully in sessionStorage");
      setDatosModelo(data);
    } catch (error) {
      console.error("Error fetching and storing data:", error);
    }
  }

  const calculateSubtotal = () => {
    return products.reduce(
      (sum, producto) => sum + producto.price * producto.cantidad,
      0
    );
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    return subtotal - (subtotal * discount) / 100;
  };

  const validateProduct = () => {
    const newErrors = {};
    if (!productEntry.catalogo) newErrors.catalogo = "El catalogo es requerido";
    if (!productEntry.modelo) newErrors.modelo = "El modelo es requerido";
    if (!productEntry.producto) newErrors.producto = "El producto es requerido";
    if (!productEntry.cantidad || productEntry.cantidad <= 0)
      newErrors.cantidad = "Ingrese una cantidad válida";
    if (!productEntry.price || productEntry.price <= 0)
      newErrors.precio = "Valid price is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddProduct = () => {
    if (validateProduct()) {
      const existingProduct = products.find(
        (p) =>
          p.modelo === productEntry.modelo &&
          p.producto === productEntry.producto
      );

      if (existingProduct) {
        setErrors({ duplicate: "Producto already exists" });
        return;
      }

      setProducts([...products, { ...productEntry, id: Date.now() }]);
      setProductEntry({ modelo: "", producto: "", cantidad: "", price: "" });
      setSeleccionarProducto([]);
      setErrors({});
    }
  };

  const handleRemoveProduct = (id) => {
    setProducts(products.filter((producto) => producto.id !== id));
  };

  const handleEditProduct = (id) => {
    const producto = products.find((p) => p.id === id);
    setProductEntry(producto);
    handleRemoveProduct(id);

    setSeleccionarProducto([
      {
        catalogo: producto.catalogo,
        name: producto.producto,
      },
    ]);
  };

  const handleCatalago = (e) => {
    setProductEntry({
      ...productEntry,
      catalogo: e.target.value,
    });
    const producto = datosProducto.find(
      (p) => p.catalogo === Number(e.target.value)
    );

    console.log(producto);

    if (!producto) {
      setErrors({ catalogo: "Catalogo no encontrado" });
      return;
    } else if (producto) {
      //get modelo from datosModelo
      const modelo = datosModelo.find((m) => m.id === producto.modeloId);

      setProductEntry({
        ...productEntry,
        catalogo: producto.catalogo,
        modelo: modelo.nombre,
        producto: producto.nombre,
        price: producto.precio,
      });
      setErrors({});

      const productoSeleccionado = {
        catalogo: producto.catalogo,
        name: producto.nombre,
      };
      setSeleccionarProducto([productoSeleccionado]);
    }
  };

  const handleModelo = (e) => {
    const inputValue = e.target.value.toLowerCase();
    setProductEntry({
      ...productEntry,
      modelo: e.target.value,
    });
    const modelo = datosModelo.find(
      (m) => m.nombre.toLowerCase() === inputValue
    );

    console.log(modelo);

    if (!modelo) {
      setErrors({ modelo: "Modelo no encontrado" });
      return;
    } else if (modelo) {
      setProductEntry({
        ...productEntry,
        modelo: modelo.nombre,
      });
      setErrors({});
      setSeleccionarProducto(
        modelo.productos.map((p) => ({
          catalogo: p.catalogo,
          name: p.nombre,
        }))
      );
    }
  };

  const handleProducto = (e) => {
    setProductEntry({
      ...productEntry,
      catalogo: e.target.value,
    });
    const producto = datosProducto.find((p) => p.nombre === e.target.value);
    setProductEntry({
      ...productEntry,
      producto: producto.nombre,
      catalogo: producto.catalogo,
      price: producto.precio,
    });
    setErrors({});
  };

  const handleGuardarCotizacion = async () => {
    //crear pdf
  };

  const handleImprimirCotizacion = () => {
  };

  return (
    <>
      <Sidebar />
      <div className="min-h-screen ml-20 bg-gray-100 p-6">
        <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-lg">
          <div className="p-6 grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left Column - Form */}
            <div className="lg:col-span-2 space-y-6 ">
              <h2 className="text-2xl font-bold text-gray-800">
                Informacion del cliente
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Nombre
                  </label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={customerInfo.name}
                    onChange={(e) =>
                      setCustomerInfo({ ...customerInfo, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Referencia
                  </label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={customerInfo.reference}
                    onChange={(e) =>
                      setCustomerInfo({
                        ...customerInfo,
                        reference: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-800 mt-8">
                Producto
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Catalogo
                  </label>
                  <input
                    type="text"
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                      errors.catalogo ? "border-red-500" : ""
                    }`}
                    value={productEntry.catalogo || ""}
                    onChange={(e) => handleCatalago(e)}
                  />
                  {errors.catalogo && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.catalogo}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Modelo
                  </label>
                  <input
                    type="text"
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                      errors.modelo ? "border-red-500" : ""
                    }`}
                    value={productEntry.modelo || ""}
                    onChange={(e) => handleModelo(e)}
                  />
                  {errors.modelo && (
                    <p className="text-red-500 text-sm mt-1">{errors.modelo}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Producto
                  </label>
                  <select
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                      errors.producto ? "border-red-500" : ""
                    }`}
                    value={productEntry.producto || ""}
                    onChange={(e) => handleProducto(e)}
                  >
                    <option value="">Seleccionar Producto</option>
                    {seleccionarProducto.map((producto) => (
                      <option key={producto.catalogo} value={producto.name}>
                        {producto.name}
                      </option>
                    ))}
                  </select>
                  {errors.producto && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.producto}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Cantidad
                  </label>
                  <input
                    type="number"
                    min="1"
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                      errors.cantidad ? "border-red-500" : ""
                    }`}
                    value={productEntry.cantidad || ""}
                    onChange={(e) =>
                      setProductEntry({
                        ...productEntry,
                        cantidad: e.target.value,
                      })
                    }
                  />
                  {errors.cantidad && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.cantidad}
                    </p>
                  )}
                </div>
                <button
                  onClick={handleAddProduct}
                  className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 flex items-center justify-center gap-2"
                >
                  <FaPlus /> Add Producto
                </button>
                {errors.duplicate && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.duplicate}
                  </p>
                )}
              </div>
            </div>

            {/* Right Column - Summary */}
            <div className="lg:col-span-3 space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">Productos</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Catalogo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Modelo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Producto
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Precio
                      </th>
                      <th className="px-1 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cantidad
                      </th>
                      <th className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.map((producto) => (
                      <tr key={producto.id}>
                        <td className="px-6 py-4 text-center  whitespace-nowrap">
                          {producto.catalogo}
                        </td>
                        <td className="px-2 text-center py-4 whitespace-wrap">
                          {producto.modelo}
                        </td>
                        <td className="px-1 text-center py-4 whitespace-wrap">
                          {producto.producto}
                        </td>
                        <td className="px-2 text-center py-4 whitespace-nowrap">
                          {producto.price} Bs
                        </td>
                        <td className="px-1 text-center py-4 whitespace-nowrap">
                          {producto.cantidad}
                        </td>
                        <td className="px-2 py-4 whitespace-nowrap">
                          {(producto.price * producto.cantidad).toFixed(2)} Bs
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditProduct(producto.id)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleRemoveProduct(producto.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="font-medium">Subtotal:</span>
                    <span>{calculateSubtotal().toFixed(2)} Bs</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-medium">Descuento (%):</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      className="w-24 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      value={discount}
                      onChange={(e) =>
                        setDiscount(Math.min(100, Math.max(0, e.target.value)))
                      }
                    />
                  </div>
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>{calculateTotal().toFixed(2)} Bs</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button className="flex-1 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 flex items-center justify-center gap-2">
                  <FaSave /> Guardar Cotizacion
                </button>
                <button className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 flex items-center justify-center gap-2">
                  <FaPrint /> Imprimir Cotizacion
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default QuotationForm;
