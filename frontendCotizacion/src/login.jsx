import { useState } from "react";
import { FaUser, FaLock } from "react-icons/fa";
import { BiLoaderAlt } from "react-icons/bi";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username.trim()) {
      newErrors.username = "El usuario es requerido";
    }
    if (!formData.password.trim()) {
      newErrors.password = "La contraseña es requerida";
    } else if (formData.password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setLoginError("");

    try {
      // endpoint to login
      await new Promise(
        fetch("https://jsonplaceholder.typicode.com/posts", {
            method: "POST",
            body: JSON.stringify(formData),
            headers: {
                "Content-Type": "application/json",
            },
            })
      );
      // Add actual login logic here
      throw new Error("Contraseña o usuario incorrecto");
    } catch (error) {
      setLoginError(error.message);
      setFormData((prev) => ({ ...prev, password: "" }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-900 to-gray-900 p-4">
      <div className="absolute inset-0 bg-black opacity-50"></div>
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-8 relative z-10">
        <div className="flex justify-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Login</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <div className="relative">
              <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Usuario"
                className={`w-full pl-10 pr-4 py-2 border ${
                  errors.username ? "border-red-500" : "border-gray-300"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200`}
                aria-label="Usuario"
              />
            </div>
            {errors.username && (
              <p className="mt-1 text-sm text-red-500">{errors.username}</p>
            )}
          </div>

          <div>
            <div className="relative">
              <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Contraseña"
                className={`w-full pl-10 pr-4 py-2 border ${
                  errors.password ? "border-red-500" : "border-gray-300"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200`}
                aria-label="Contraseña"
              />
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-500">{errors.password}</p>
            )}
          </div>

          {loginError && (
            <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
              {loginError}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !formData.username || !formData.password}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
          >
            {isLoading ? (
              <BiLoaderAlt className="animate-spin h-5 w-5" />
            ) : (
              "Sign In"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;