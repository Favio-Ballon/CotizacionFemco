import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { FaTrash, FaEdit, FaPrint, FaSave, FaPlus } from "react-icons/fa";
import Sidebar from "./components/sidebar";

const QuotationForm = () => {
  const { id } = useParams();
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
  const [agregado, setAgregado] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [errors, setErrors] = useState({});
  const [datosModelo, setDatosModelo] = useState({});
  const [datosProducto, setDatosProducto] = useState({});
  const [seleccionarProducto, setSeleccionarProducto] = useState([]);
  const [optionalDetails, setOptionalDetails] = useState({
    tiempoEntrega: "3-5",
    formaPago: "100",
    observaciones: "",
    imagen: null,
    transporte: false,
  });

  useEffect(() => {
    checkModeloInSession();
    checkProductoInSession();
  }, []);

  useEffect(() => {
    checkModeloInSession();
    checkProductoInSession();
    if (id !== "new" && isNaN(Number(id))) {
      console.error("Invalid ID parameter");
      // Handle invalid ID, e.g., redirect or show an error message
      return;
    } else if (id === "new") {
      // Reset the form
      setCustomerInfo({ name: "", reference: "" });
      setProducts([]);
      setDiscount(0);
      return;
    }
  }, [id]);

  useEffect(() => {
    if (id !== "new") {
      // Fetch the quotation data from the server
      fetchQuotationData(id);
    }
  }, [datosModelo, id]);

  async function fetchQuotationData(id) {
    try {
      const response = await fetch(`http://localhost:3000/cotizacion/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }

      const data = await response.json();
      setCustomerInfo({ name: data.nombre, reference: data.referencia });
      var productos = [];
      for (const producto of data.productos) {
        productos.push({
          catalogo: producto.catalogo,
          cantidad: producto.producto_cotizacion.cantidad,
          price: producto.precio,
          modelo: producto.modelo.nombre,
          producto: producto.nombre,
        });
      }
      setOptionalDetails({
        tiempoEntrega: data.tiempoEntrega,
        formaPago: data.formaPago,
        observaciones: data.observaciones,
        imagen: data.imagen,
        transporte: data.transporte,
      });
      console.log(productos);
      setProducts(productos);
      setAgregado(data.agregado);
      setDiscount(data.descuento);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

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
    //clean the session storage
    sessionStorage.removeItem("productoData");
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
    //clean the session storage
    sessionStorage.removeItem("modeloData");
    try {
      const response = await fetch("http://localhost:3000/modelo");
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }

      const data = await response.json();

      const dataSize = new Blob([JSON.stringify(data)]).size;
      const maxSize = 5 * 1024 * 1024; // 5MB limit for sessionStorage

      if (dataSize > maxSize) {
        console.error("Data size exceeds the storage limit");
        // Handle the case where data is too large
        // For example, you can store only a part of the data or show an error message
        return;
      }

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
    const des = (subtotal * discount) / 100;
    const extra = (subtotal * agregado) / 100;

    return subtotal - des + extra;
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
        setErrors({ duplicate: "El producto ya existe" });
        return;
      }

      setProducts([...products, { ...productEntry, id: Date.now() }]);
      setProductEntry({ modelo: "", producto: "", cantidad: "", price: "" });
      setSeleccionarProducto([]);
      setErrors({});
    }
  };

  const handleRemoveProduct = (catalogo) => {
    setProducts(products.filter((producto) => producto.catalogo !== catalogo));
  };

  const handleEditProduct = (catalogo) => {
    const producto = products.find((p) => p.catalogo === catalogo);
    setProductEntry(producto);
    handleRemoveProduct(catalogo);

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

      setProductEntry({
        ...productEntry,
        catalogo: producto.catalogo,
        modelo: producto.modelo.nombre,
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
        datosProducto.filter((p) => p.modeloId === modelo.id)
      );
    }
  };

  const handleProducto = (e) => {
    const catalogo = e.target.value;
    setProductEntry({
      ...productEntry,
      catalogo: catalogo,
    });
    console.log(e.target.value);
    const producto = datosProducto.find((p) => p.catalogo === Number(catalogo));
    console.log(producto);
    setProductEntry({
      ...productEntry,
      producto: producto.nombre,
      catalogo: producto.catalogo,
      price: producto.precio,
    });
    setErrors({});
  };

  const validateGuardarCotizacion = () => {
    const newErrors = {};
    if (!customerInfo.name) newErrors.name = "Nombre es requerido";
    if (!customerInfo.reference)
      newErrors.reference = "Referencia es requerida";
    if (products.length < 1)
      newErrors.producto = "Agregue al menos un producto";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGuardarCotizacion = async () => {
    if (!validateGuardarCotizacion()) {
      return;
    }
    //endpoint para guardar la cotizacion http://localhost:3000/cotizacion
    const cotizacion = {
      nombre: customerInfo.name,
      formaPago: optionalDetails.formaPago,
      tiempoEntrega: optionalDetails.tiempoEntrega,
      transporte: optionalDetails.transporte,
      productos: [],
      descuento: discount ? discount : 0,
      total: calculateTotal(),
      subtotal: calculateSubtotal(),
      referencia: customerInfo.reference,
      observaciones: optionalDetails.observaciones || "",
      imagen: optionalDetails.imagen,
      agregado: agregado ? agregado : 0,
    };

    //add products to cotizacion first catalogo then quantity like [1,2]
    products.forEach((producto) => {
      cotizacion.productos.push([producto.catalogo, producto.cantidad]);
    });

    console.log(cotizacion);

    var link;
    var method;

    if (id !== "new") {
      link = `http://localhost:3000/cotizacion/${id}`;
      method = "PUT";
    } else {
      link = "http://localhost:3000/cotizacion";
      method = "POST";
    }

    //post request
    const response = await fetch(link, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(cotizacion),
    });

    if (response.ok) {
      const data = await response.json();
      console.log("Cotizacion guardada exitosamente");
      console.log(data);
      alert("Cotizacion guardada exitosamente");
      setProducts([]);
      setDiscount(0);
      window.location.href = `/cotizacion/${data.id}/preview`;
    }

    console.log(response);
  };

  const handleImprimirCotizacion = () => {
    window.location.href = `/cotizacion/${id}/preview`;
  };

  return (
    <>
      <Sidebar />
      <div className="min-h-screen lg:ml-20 bg-gray-100 p-6">
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
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                      errors.name ? "border-red-500" : ""
                    }`}
                    value={customerInfo.name}
                    onChange={(e) => {
                      setCustomerInfo({
                        ...customerInfo,
                        name: e.target.value,
                      });
                      setErrors({});
                    }}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Referencia
                  </label>
                  <input
                    type="text"
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                      errors.reference ? "border-red-500" : ""
                    }`}
                    value={customerInfo.reference}
                    onChange={(e) => {
                      setCustomerInfo({
                        ...customerInfo,
                        reference: e.target.value,
                      });
                      setErrors({});
                    }}
                  />
                  {errors.reference && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.reference}
                    </p>
                  )}
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
                    value={productEntry.catalogo || ""}
                    onChange={(e) => handleProducto(e)}
                  >
                    <option value="">Seleccionar Producto</option>
                    {seleccionarProducto.map((producto) => (
                      <option key={producto.catalogo} value={producto.catalogo}>
                        {producto.nombre}
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
              <div className="lg:col-span-2 space-y-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Detalles Opcionales
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Tiempo de Entrega
                    </label>
                    <select
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      value={optionalDetails.tiempoEntrega}
                      onChange={(e) =>
                        setOptionalDetails({
                          ...optionalDetails,
                          tiempoEntrega: e.target.value,
                        })
                      }
                    >
                      <option value="">Seleccionar</option>
                      <option value="inmediata">Entrega Inmediata</option>
                      <option value="3-5">3 a 5 dias</option>
                      <option value="15-20">15 a 20 dias</option>
                      <option value="20-30">20 a 30 dias</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Forma de Pago
                    </label>
                    <select
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      value={optionalDetails.formaPago}
                      onChange={(e) =>
                        setOptionalDetails({
                          ...optionalDetails,
                          formaPago: e.target.value,
                        })
                      }
                    >
                      <option value="">Seleccionar</option>
                      <option value="100">100%</option>
                      <option value="50">50%</option>
                      <option value="credito15">Credito 15 dias</option>
                      <option value="credito30">Credito 30 dias</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Observaciones
                    </label>
                    <textarea
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      value={optionalDetails.observaciones}
                      onChange={(e) =>
                        setOptionalDetails({
                          ...optionalDetails,
                          observaciones: e.target.value,
                        })
                      }
                    ></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Imagen
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      onChange={(e) =>
                        setOptionalDetails({
                          ...optionalDetails,
                          imagen: e.target.files[0],
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">
                      Transporte
                    </label>
                    <button
                      onClick={() =>
                        setOptionalDetails({
                          ...optionalDetails,
                          transporte: !optionalDetails.transporte,
                        })
                      }
                      className={`relative w-12 h-6 flex items-center rounded-full p-1 transition duration-300 ${
                        optionalDetails.transporte
                          ? "bg-blue-600"
                          : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`block w-5 h-5 bg-white rounded-full shadow-md transform transition duration-300 ${
                          optionalDetails.transporte ? "translate-x-6" : ""
                        }`}
                      />
                    </button>
                  </div>
                </div>
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
                      <tr key={producto.catalogo}>
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
                              onClick={() =>
                                handleEditProduct(producto.catalogo)
                              }
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() =>
                                handleRemoveProduct(producto.catalogo)
                              }
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
                  <div className="flex items-center gap-4">
                    <span className="font-medium">Agregar (%):</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      className="w-24 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      value={agregado}
                      onChange={(e) =>
                        setAgregado(Math.min(100, Math.max(0, e.target.value)))
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
                <button
                  className="flex-1 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 flex items-center justify-center gap-2"
                  onClick={handleGuardarCotizacion}
                >
                  <FaSave /> Guardar Cotizacion
                </button>
                <button
                  className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 flex items-center justify-center gap-2"
                  onClick={handleImprimirCotizacion}
                >
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
