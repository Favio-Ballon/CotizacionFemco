import { useState, useEffect, useCallback } from "react";
import { IoClose } from "react-icons/io5";

const ExcelInputModal = ({ isOpen, onClose, onSubmit }) => {
  const [excel, setExcel] = useState(null);

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
    if (!excel) {
      newErrors.excel = "El archivo es requerido";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (validateForm()) {
      try {
        await onSubmit(excel);
        setExcel(null);
        onClose();
      } catch (error) {
        console.error("Submit error:", error);
      }
    }
    setIsSubmitting(false);
  };

  const handleChange = (e) => {
    setExcel(e.target.files[0]);
  };

  const handleCLose = (e) => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="relative w-full max-w-md p-4">
        <div className="relative rounded-lg bg-white shadow-xl">
          <div className="flex items-center justify-between rounded-t border-b p-4 dark:border-gray-600">
            <h3 className="text-xl font-semibold text-gray-900">
              Subir archivo de Excel
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
                Archivo
              </label>
              <input
                type="file"
                name="excel"
                onChange={handleChange}
                className={`w-full rounded-lg border p-2.5 text-sm ${
                  errors.nombre ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Subir excel"
                accept=".xls,.xlsx"
              />
              {errors.nombre && (
                <p className="mt-1 text-sm text-red-500">{errors.nombre}</p>
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
                  : "Subir archivo"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ExcelInputModal;
