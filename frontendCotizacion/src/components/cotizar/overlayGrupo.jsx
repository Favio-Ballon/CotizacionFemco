import { useState, useEffect, useCallback } from "react";
import { FiPlus, FiMinus, FiX, FiTrash } from "react-icons/fi";
import { FaTools, FaRuler, FaLayerGroup } from "react-icons/fa";
import { BACKEND_URL } from "../../main";
import CrearGrupoOverlay from "../overlayCrearGrupo";

const GrupoOverlay = ({
  isOpen,
  onClose,
  onSubmit,
  grupoDeProducto,
  isEdit,
}) => {
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [quantities, setQuantities] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [grupos, setGrupos] = useState({});
  const [showCrearGrupo, setShowCrearGrupo] = useState(false);
  const [showAddGroup, setShowAddGroup] = useState(false);
  const token = localStorage.getItem("token");
  const [editGroup, setEditGroup] = useState(null);

  useEffect(() => {
    if (grupoDeProducto) {
      setGrupos(grupoDeProducto);
    } else {
      fetchGrupos();
    }
  }, [grupoDeProducto]);

  const fetchGrupos = async () => {
    const response = await fetch(`${BACKEND_URL}/grupo`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    if (data && data.length > 0) {
      setGrupos(data);
    } else {
      setGrupos([]);
    }
  };

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
        onClose();
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

  const handleGroupSelect = (group) => {
    setSelectedGroup(group);
    if (isEdit) {
      setShowCrearGrupo(true);
    } else {
      setShowAddGroup(true);
    }
    setErrors({});
  };

  const handleQuantityChange = (itemId, value) => {
    const newValue = Math.max(0, parseInt(value) || 0);
    setQuantities((prev) => ({ ...prev, [itemId]: newValue }));
    if (errors[itemId]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[itemId];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    selectedGroup.productos.forEach((product) => {
      const qty = quantities[product.catalogo] || 0;
      if (qty > product.maxQty) {
        newErrors[product.catalogo] = `Maximum quantity is ${product.maxQty}`;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // setIsSubmitting(true);
    // setShowSuccess(true);
    onSubmit(quantities);
    // setShowSuccess(false);
    // setSelectedGroup(null);
    // setShowAddGroup(false);
    // setQuantities({});
    // setIsSubmitting(false);
  };

  const handleDeleteGroup = (groupId) => {
    if (window.confirm("Esta seguro que desea eliminar este grupo?")) {
      fetch(`${BACKEND_URL}/grupo/${groupId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).then(() => {
        fetchGrupos();
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {!showAddGroup ? (
          <div className="p-6">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">
                Seleccionar Grupo
              </h2>
              <button
                type="button"
                onClick={() => onClose()}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
              >
                <FiX className="w-6 h-6 text-gray-600" />
              </button>
            </div>
            {isEdit && (
              <button
                onClick={() => setShowCrearGrupo(true)}
                className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 flex items-center justify-center gap-2 mb-3"
              >
                Crear Grupo
              </button>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {grupos.length === 0 && (
                <div className="text-center text-gray-500">
                  No hay grupos de productos
                </div>
              )}
              {grupos.map((group) => (
                <button
                  key={group.id}
                  onClick={() => handleGroupSelect(group)}
                  className="p-6 border rounded-lg hover:border-blue-500 hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <div className="flex flex-row space-x-3 items-center justify-between">
                    <span className="text-lg font-medium text-gray-700">
                      {group.nombre}
                    </span>
                    {isEdit && (
                      <FiTrash
                        className="w-6 h-6 text-gray-600 cursor-pointer hover:text-red-500"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteGroup(group.id);
                        }}
                      />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {selectedGroup.nombre}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setSelectedGroup(null);
                  setShowAddGroup(false);
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
              >
                <FiX className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <div className="space-y-4">
              {selectedGroup.productos.map((product) => (
                <div key={product.catalogo} className="p-4 border rounded-lg">
                  <label className="flex items-center justify-between">
                    <span className="text-lg text-gray-700">
                      {product.nombre}
                    </span>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() =>
                          handleQuantityChange(
                            product.catalogo,
                            (quantities[product.catalogo] || 0) - 1
                          )
                        }
                        className="p-1 rounded-full hover:bg-gray-100"
                      >
                        <FiMinus className="w-5 h-5 text-gray-600" />
                      </button>
                      <input
                        type="number"
                        value={quantities[product.catalogo] || 0}
                        onChange={(e) =>
                          handleQuantityChange(product.catalogo, e.target.value)
                        }
                        className="w-20 text-center border rounded-md p-2"
                        min="0"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          handleQuantityChange(
                            product.catalogo,
                            (quantities[product.catalogo] || 0) + 1
                          )
                        }
                        className="p-1 rounded-full hover:bg-gray-100"
                      >
                        <FiPlus className="w-5 h-5 text-gray-600" />
                      </button>
                    </div>
                  </label>
                  {errors[product.catalogo] && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors[product.catalogo]}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => {
                  setSelectedGroup(null);
                  setShowAddGroup(false);
                }}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 disabled:opacity-50"
              >
                {isSubmitting ? "Processing..." : "Submit"}
              </button>
            </div>
          </form>
        )}

        {showSuccess && (
          <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg">
            Inventory updated successfully!
          </div>
        )}
      </div>
      <CrearGrupoOverlay
        isOpen={showCrearGrupo}
        onClose={() => {
          setShowCrearGrupo(false);
          fetchGrupos();
        }}
        grupo={selectedGroup}
      />
    </div>
  );
};

export default GrupoOverlay;
