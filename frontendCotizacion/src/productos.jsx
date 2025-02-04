import React, { useEffect, useState, useMemo } from "react";
import {
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiSearch,
  FiArrowUp,
  FiArrowDown,
} from "react-icons/fi";
import Sidebar from "./components/sidebar";

const ProductCatalog = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({
    catalogo: "",
    nombre: "",
    precio: "",
    modelo: "",
  });

  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [item, setItem] = useState([]);

  useEffect(() => {
    checkProductoInSession();
  }, []);

  async function checkProductoInSession() {
    const storedData = sessionStorage.getItem("productoData");
    if (storedData) {
      console.log("Data already stored in sessionStorage");
      setProducts(JSON.parse(storedData));
      setLoading(false);
      return;
    }

    await fetchProductoAndStoreInSession();
  }

  async function fetchProductoAndStoreInSession() {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:3000/producto");
      const data = await response.json();
      sessionStorage.setItem("productoData", JSON.stringify(data));
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(1); // Reset to first page on new search
  };

  const filteredProducts = useMemo(() => {
    return products.filter(
      (product) =>
        product.catalogo
          ?.toString()
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        product.modelo?.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
  }, [filteredProducts, sortConfig]);

  useEffect(() => {
    const totalItems = sortedProducts.length;
    setTotalItems(totalItems);
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    setTotalPages(totalPages);
  }, [sortedProducts, itemsPerPage]);

  useEffect(() => {
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    setItem(sortedProducts.slice(start, end));
  }, [page, itemsPerPage, sortedProducts]);

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setFormData({ catalogo: "", nombre: "", precio: "", modelo: "" });
    setIsModalOpen(true);
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setFormData({
      catalogo: product.catalogo,
      nombre: product.nombre,
      precio: product.precio,
      modelo: product.modelo?.nombre ?? "",
    });
    setIsModalOpen(true);
  };

  const handleDeleteClick = (product) => {
    setSelectedProduct(product);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setProducts(
      products.filter((p) => p.catalogo !== selectedProduct.catalogo)
    );

    //endpoint localhost:3000/producto/:catalogo
    fetch(`http://localhost:3000/producto/${selectedProduct.catalogo}`, {
      method: "DELETE",
    });

    //quitar producto de sessionStorage
    const storedData = JSON.parse(sessionStorage.getItem("productoData"));
    const newData = storedData.filter(
      (p) => p.catalogo !== selectedProduct.catalogo
    );
    sessionStorage.setItem("productoData", JSON.stringify(newData));

    setIsDeleteModalOpen(false);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (selectedProduct) {
      const producto = {
        catalogo: formData.catalogo,
        nombre: formData.nombre,
        precio: formData.precio,
        modelo: formData.modelo,
      };
      try {
        const response = await fetch(
          `http://localhost:3000/producto/update/${selectedProduct.catalogo}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(producto),
          }
        );

        if (response.ok) {
          const data = await response.json().catch(() => {
            throw new Error("Invalid JSON response");
          });

          const updatedProducts = products.map((p) =>
            p.catalogo === selectedProduct.catalogo ? data : p
          );

          setProducts(updatedProducts);

          console.log("Product updated successfully");

          //actualizar producto en sessionStorage
          const storedData = JSON.parse(sessionStorage.getItem("productoData"));
          const newData = storedData.map((p) =>
            p.catalogo === selectedProduct.catalogo ? data : p
          );
          sessionStorage.setItem("productoData", JSON.stringify(newData));
        } else {
          console.error("Error updating product");
        }
      } catch (error) {
        console.error("Error fetching and storing data:", error);
      }
    } else {
      //endpoint localhost:3000/producto/create

      const producto = {
        catalogo: formData.catalogo,
        nombre: formData.nombre,
        precio: formData.precio,
        modelo: formData.modelo,
      };

      try {
        const response = await fetch("http://localhost:3000/producto/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(producto),
        });

        if (response.ok) {
          const data = await response.json().catch(() => {
            throw new Error("Invalid JSON response");
          });

          //organize products by catalogo in ascending order
          const newProducts = [
            ...products,
            {
              catalogo: data.catalogo,
              nombre: data.nombre,
              precio: data.precio,
              modelo: data.modelo,
            },
          ];

          newProducts.sort((a, b) => a.catalogo - b.catalogo);

          setProducts(newProducts);

          console.log("Product added successfully");

          //agregar producto a sessionStorage
          const storedData =
            JSON.parse(sessionStorage.getItem("productoData")) || [];
          const newData = [...storedData, data];
          //organize newData by catalogo in ascending order
          newData.sort((a, b) => a.catalogo - b.catalogo);
          sessionStorage.setItem("productoData", JSON.stringify(newData));
        } else {
          console.error("Error adding product");
        }
      } catch (error) {
        console.error("Error fetching and storing data:", error);
      }
    }
    setIsModalOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <>
      <Sidebar />
      {!loading && (
        <div className="md:ml-20">
          <div className="p-6 max-w-7xl mx-auto">
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pl-10 lg:pl-0">
              <div className="relative flex-1 max-w-md">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por modelo o catálogo..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
              <button
                onClick={handleAddProduct}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FiPlus /> Agregar Producto
              </button>
            </div>

            <div className="overflow-x-auto bg-white rounded-lg shadow">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("catalogo")}
                    >
                      <div className="flex items-center">
                        Catálogo
                        {sortConfig.key === "catalogo" &&
                          (sortConfig.direction === "asc" ? (
                            <FiArrowUp className="ml-1" />
                          ) : (
                            <FiArrowDown className="ml-1" />
                          ))}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("nombre")}
                    >
                      <div className="flex items-center">
                        Nombre
                        {sortConfig.key === "nombre" &&
                          (sortConfig.direction === "asc" ? (
                            <FiArrowUp className="ml-1" />
                          ) : (
                            <FiArrowDown className="ml-1" />
                          ))}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("precio")}
                    >
                      <div className="flex items-center">
                        Precio
                        {sortConfig.key === "precio" &&
                          (sortConfig.direction === "asc" ? (
                            <FiArrowUp className="ml-1" />
                          ) : (
                            <FiArrowDown className="ml-1" />
                          ))}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("modelo")}
                    >
                      <div className="flex items-center">
                        Modelo
                        {sortConfig.key === "modelo" &&
                          (sortConfig.direction === "asc" ? (
                            <FiArrowUp className="ml-1" />
                          ) : (
                            <FiArrowDown className="ml-1" />
                          ))}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {item.map((product) => (
                    <tr key={product.catalogo} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {product.catalogo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {product.nombre}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {product.precio} Bs
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {product.modelo?.nombre}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <FiEdit2 />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(product)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-4">
              <div>
                <span className="text-sm text-gray-700">
                  Mostrando {item.length} de {totalItems} productos
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Anterior
                </button>
                <span className="px-4 py-2 text-sm text-gray-700">
                  Página {page} de {totalPages}
                </span>
                <button
                  onClick={() =>
                    setPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={page === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Siguiente
                </button>
              </div>
            </div>

            {/* Add/Edit Modal */}
            {isModalOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg p-6 w-full max-w-md">
                  <h2 className="text-xl font-semibold mb-4">
                    {selectedProduct ? "Editar Producto" : "Agregar Producto"}
                  </h2>
                  <form onSubmit={handleFormSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Catálogo
                      </label>
                      <input
                        type="text"
                        name="catalogo"
                        value={formData.catalogo}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Nombre
                      </label>
                      <input
                        type="text"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Precio
                      </label>
                      <input
                        type="number"
                        name="precio"
                        value={formData.precio}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Modelo
                      </label>
                      <input
                        type="text"
                        name="modelo"
                        value={formData.modelo}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                      <button
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        {selectedProduct ? "Guardar Cambios" : "Agregar"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg p-6 w-full max-w-sm">
                  <h2 className="text-xl font-semibold mb-4">
                    Confirmar Eliminación
                  </h2>
                  <p className="text-gray-600 mb-6">
                    ¿Está seguro de que desea eliminar este producto?
                  </p>
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setIsDeleteModalOpen(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleDeleteConfirm}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ProductCatalog;
