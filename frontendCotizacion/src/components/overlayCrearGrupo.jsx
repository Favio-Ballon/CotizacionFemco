import { useState, useEffect, useCallback, useMemo } from "react";
import { FiX, FiEdit2, FiTrash2, FiSearch, FiPlus } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { BACKEND_URL } from "../main";

const CrearGrupoOverlay = ({ isOpen, onClose, grupo }) => {
  const token = localStorage.getItem("token");
  const [productos, setProductos] = useState({});
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingProduct, setEditingProduct] = useState(null);
  const [error, setError] = useState("");
  const [groupName, setGroupName] = useState("");

  useEffect(() => {
    const storedData = sessionStorage.getItem("productoData");
    if (storedData) {
      setProductos(JSON.parse(storedData));
    } else {
      fetchProductoAndStoreInSession();
    }
  }, []);

  useEffect(() => {
    if (grupo) {
      setGroupName(grupo.nombre);
      getProductosGrupo();
    }
  }, [grupo, productos]);

  async function getProductosGrupo() {
    const producto = grupo.productos?.map((product) => {
      if (!productos) return;
      const foundProduct = productos.find(
        (p) => p.catalogo === product.catalogo
      );
      return {
        ...foundProduct,
        customName: product.producto_grupo?.nombre,
      };
    });
    setSelectedProducts(producto);
  }

  async function fetchProductoAndStoreInSession() {
    sessionStorage.removeItem("productoData");
    try {
      const response = await fetch(`${BACKEND_URL}/producto`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }

      const data = await response.json();
      sessionStorage.setItem("productoData", JSON.stringify(data));
      setProductos(data);
    } catch (error) {
      console.error("Error fetching and storing data:", error);
    }
  }

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleEscapeKey = useCallback(
    (e) => {
      if (e.key === "Escape") {
        close();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleEscapeKey);
    }
    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isOpen, handleEscapeKey]);

  const handleAddProduct = (product) => {
    if (selectedProducts.length >= 20) {
      setError("Maximum product limit reached (20)");
      return;
    }
    if (selectedProducts.some((p) => p.catalogo === product.catalogo)) {
      setError("Product already exists in the group");
      return;
    }
    setSelectedProducts([
      ...selectedProducts,
      { ...product, customName: product.nombre },
    ]);
    setError("");
  };

  const filteredProducts = useMemo(() => {
    if (!Array.isArray(productos)) {
      return [];
    }
    if (searchTerm.length > 2) {
      return productos.filter((product) =>
        product.catalogo
          .toString()
          .toLowerCase()
          .includes(searchTerm.toString().toLowerCase())
      );
    } else {
      return [];
    }
  }, [searchTerm, productos]);

  const handleRemoveProduct = (productId) => {
    setSelectedProducts(
      selectedProducts.filter((p) => p.catalogo !== productId)
    );
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
  };

  const handleUpdateProductName = (productId, newName) => {
    if (
      selectedProducts.some(
        (p) => p.customName === newName && p.catalogo !== productId
      )
    ) {
      setError("Custom name must be unique");
      return;
    }
    setSelectedProducts(
      selectedProducts.map((p) =>
        p.catalogo === productId ? { ...p, customName: newName } : p
      )
    );
    setEditingProduct(null);
    setError("");
  };

  const handleCreateGroup = () => {
    if (!groupName.trim()) {
      setError("Group name is required");
      return;
    }
    if (selectedProducts.length === 0) {
      setError("Please add at least one product");
      return;
    }
    console.log("Group created:", {
      name: groupName,
      products: selectedProducts,
    });

    //fetch request to create group post grupo/create
    var listProductos = [];

    selectedProducts.forEach((product) => {
      listProductos.push({
        nombre: product.nombre,
        catalogo: product.catalogo,
      });
    });

    var link = `${BACKEND_URL}/grupo/create`;
    var method = "POST";

    const body = {
      nombre: groupName,
      productos: listProductos,
    };

    if (grupo) {
      link = `${BACKEND_URL}/grupo/update/${grupo.id}`;
      method = "PUT";
    }

    fetch(link, {
      method: method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to create group");
        }
        return response.json();
      })
      .then(() => {
        close();
      })
      .catch((error) => {
        console.error("Error creating group:", error);
        setError("Failed to create group");
      });
  };

  const close = () => {
    setGroupName("");
    setSelectedProducts([]);
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={(e) => e.target === e.currentTarget && close()}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
          >
            <div className="p-6 flex flex-col flex-grow overflow-hidden">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Crear grupo de productos
                </h2>
                <button
                  onClick={() => close()}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                  {error}
                </div>
              )}

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del grupo
                </label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value.slice(0, 50))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter group name"
                  maxLength={50}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-grow overflow-y-auto">
                <div className="flex flex-col">
                  <h3 className="text-lg font-semibold mb-3">
                    Catalogo de Producto
                  </h3>
                  <div className="relative mb-3">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={Number(searchTerm) ? searchTerm : ""}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 p-2 border border-gray-300 rounded-md"
                      placeholder="Buscar productos..."
                    />
                  </div>
                  <div className="flex-grow overflow-y-auto">
                    {filteredProducts.map((product) => (
                      <div
                        key={product.catalogo}
                        className="flex items-center justify-between p-3 hover:bg-gray-50 border-b"
                      >
                        <div>
                          <p className="font-medium">{product.nombre}</p>
                          <p className="text-sm text-gray-500">
                            {product.catalogo}
                          </p>
                        </div>
                        <button
                          onClick={() => handleAddProduct(product)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                        >
                          <FiPlus className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col">
                  <h3 className="text-lg font-semibold mb-3">
                    Productos seleccionados
                  </h3>
                  <div className="flex-grow overflow-y-auto">
                    {selectedProducts.map((product) => (
                      <div
                        key={product.catalogo}
                        className="p-3 border-b last:border-b-0"
                      >
                        {editingProduct?.catalogo === product.catalogo ? (
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={editingProduct.customName}
                              onChange={(e) =>
                                setEditingProduct({
                                  ...editingProduct,
                                  customName: e.target.value,
                                })
                              }
                              className="flex-grow p-1 border rounded-md"
                            />
                            <button
                              onClick={() =>
                                handleUpdateProductName(
                                  product.catalogo,
                                  editingProduct.customName
                                )
                              }
                              className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                              Guardar
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">
                                {product.customName}
                              </p>
                              {product.customName !== product.nombre && (
                                <p className="text-sm text-gray-500">
                                  Original: {product.nombre}
                                </p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditProduct(product)}
                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
                              >
                                <FiEdit2 className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() =>
                                  handleRemoveProduct(product.catalogo)
                                }
                                className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                              >
                                <FiTrash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                <button
                  onClick={() => close()}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateGroup}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Crear Grupo
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CrearGrupoOverlay;
