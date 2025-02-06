import { useState, useEffect, useCallback } from "react";
import { IoClose } from "react-icons/io5";

const ProductInputModal = ({ isOpen, onClose, onSubmit, productoTemporal }) => {
  const [formData, setFormData] = useState({
    catalogo: "",
    nombre: "",
    modelo: "",
    cantidad: "",
    precio: 0,
  });

  useEffect(() => {
    if (productoTemporal) {
      setFormData({
        catalogo: productoTemporal.catalogo,
        nombre: productoTemporal.producto,
        modelo: productoTemporal.modelo,
        cantidad: productoTemporal.cantidad,
        precio: productoTemporal.price,
      });
    }
  }, [productoTemporal]);

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nombre.trim()) {
      newErrors.nombre = "La descripción es requerida";
    }
    if (!formData.modelo.trim()) {
      newErrors.modelo = "El modelo es requerido";
    }
    if (!formData.cantidad || parseInt(formData.cantidad) <= 0) {
      newErrors.cantidad = "La cantidad debe ser un número positivo";
    }
    if (!formData.precio || parseFloat(formData.precio) <= 0) {
      newErrors.precio = "El precio debe ser un número positivo";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (validateForm()) {
      try {
        await onSubmit(formData);
        setFormData({
          catalogo: "",
          nombre: "",
          modelo: "",
          cantidad: "",
          precio: "",
        });
        onClose();
      } catch (error) {
        console.error("Submit error:", error);
      }
    }
    setIsSubmitting(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleCLose = (e) => {
    e.preventDefault();
    if (productoTemporal) {
      setFormData({
        catalogo: productoTemporal.catalogo,
        nombre: productoTemporal.producto,
        modelo: productoTemporal.modelo,
        cantidad: productoTemporal.cantidad,
        precio: productoTemporal.price,
      });
      handleSubmit(e);
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="relative w-full max-w-md p-4">
        <div className="relative rounded-lg bg-white shadow-xl">
          <div className="flex items-center justify-between rounded-t border-b p-4 dark:border-gray-600">
            <h3 className="text-xl font-semibold text-gray-900">
              {productoTemporal ? "Editar Producto" : "Nuevo Producto"}
            </h3>
            <button
              onClick={(e) => {
                handleCLose(e);
              }}
              className="ml-auto inline-flex items-center rounded-lg bg-transparent p-1.5 text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900"
            >
              <IoClose className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-900">
                Descripción
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className={`w-full rounded-lg border p-2.5 text-sm ${
                  errors.nombre ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Descripción del producto"
              />
              {errors.nombre && (
                <p className="mt-1 text-sm text-red-500">{errors.nombre}</p>
              )}
            </div>

            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-900">
                Modelo
              </label>
              <input
                type="text"
                name="modelo"
                value={formData.modelo}
                onChange={handleChange}
                className={`w-full rounded-lg border p-2.5 text-sm ${
                  errors.modelo ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Modelo del producto"
              />
              {errors.modelo && (
                <p className="mt-1 text-sm text-red-500">{errors.modelo}</p>
              )}
            </div>

            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-900">
                Cantidad
              </label>
              <input
                type="number"
                name="cantidad"
                value={formData.cantidad}
                onChange={handleChange}
                className={`w-full rounded-lg border p-2.5 text-sm ${
                  errors.cantidad ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Cantidad"
                min="1"
              />
              {errors.cantidad && (
                <p className="mt-1 text-sm text-red-500">{errors.cantidad}</p>
              )}
            </div>

            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-gray-900">
                Precio
              </label>
              <input
                type="number"
                name="precio"
                value={formData.precio}
                onChange={handleChange}
                className={`w-full rounded-lg border p-2.5 text-sm ${
                  errors.precio ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Price"
                step="0.01"
                min="0"
              />
              {errors.precio && (
                <p className="mt-1 text-sm text-red-500">{errors.precio}</p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={(e) => {
                  handleCLose(e);
                }}
                className="flex-1 rounded-lg bg-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:bg-blue-400"
              >
                {isSubmitting
                  ? "Añadiendo..."
                  : productoTemporal !== ""
                  ? "Añadir Producto"
                  : "Editar producto"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductInputModal;
