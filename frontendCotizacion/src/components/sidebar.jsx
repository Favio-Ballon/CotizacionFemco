import { useState, useEffect, useMemo } from "react";
import {
  FiMenu,
  FiChevronLeft,
  FiUser,
  FiBookOpen,
  FiPackage,
  FiArchive,
  FiInfo,
  FiLogOut,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const Sidebar = () => {
  const token = localStorage.getItem("token");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeLink, setActiveLink] = useState("");
  const [showText, setShowText] = useState(false);
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      const isNowMobile = window.innerWidth <= 767;
      setIsMobile(isNowMobile);
      if (isNowMobile) setIsExpanded(false);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    //check the link to set the active link
    const path = window.location.pathname;
    if (path.includes("cotizar") || path.includes("cotizacion/")) {
      setActiveLink("cotizacion/new");
    } else if (path.includes("productos")) {
      setActiveLink("productos");
    } else if (path.includes("cotizaciones")) {
      setActiveLink("cotizaciones");
    } else if (path.includes("dashboard")) {
      setActiveLink("dashboard");
    }

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isExpanded) {
      const timeout = setTimeout(() => setShowText(true), 100);
      return () => clearTimeout(timeout);
    } else {
      setShowText(false);
    }
  }, [isExpanded]);

  useEffect(() => {
    verifyToken();
  }, []);

  const verifyToken = () => {
    if (!token) {
      navigate("/login");
    }
    try {
      const decodedToken = jwtDecode(token);
      const currentTime = Date.now() / 1000; // current time in seconds
      setNombre(decodedToken.nombre);
      setCorreo(decodedToken.correo);
      if (decodedToken.exp < currentTime) {
        console.error("Token expired");
        localStorage.removeItem("token");
        navigate("/login");
      }
    } catch (error) {
      console.error("Invalid token:", error);
      navigate("/login");
    }
  };

  const navigationItems = useMemo(
    () => [
      { id: "cotizacion/new", label: "Cotizar", icon: FiBookOpen },
      { id: "productos", label: "Productos", icon: FiPackage },
      { id: "cotizaciones", label: "Cotizaciones", icon: FiArchive },
      { id: "dashboard", label: "Dashboard", icon: FiInfo },
      { id: "logout", label: "Cerrar sesión", icon: FiLogOut },
    ],
    []
  );

  const NavItem = ({ id, label, icon: Icon }) => {
    return (
      <div
        className={`flex items-center cursor-pointer px-3 py-2 my-2 rounded-lg transition-all duration-300 ${
          isExpanded ? "" : "justify-center"
        } ${activeLink === id ? "bg-gray-700" : "hover:bg-gray-700"}`}
        onClick={() => {
          setActiveLink(id);
          if (id === "logout") {
            localStorage.removeItem("token");
            navigate("/login");
          } else {
            navigate(`/${id}`);
          }
        }}
        role="button"
        tabIndex={0}
        aria-label={label}
      >
        <Icon className="w-6 h-6 min-w-[24px]" />
        {showText && isExpanded && (
          <span className="ml-3 overflow-hidden whitespace-nowrap transition-all duration-300">
            {label}
          </span>
        )}
      </div>
    );
  };

  return (
    <>
      {isMobile && !isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="fixed top-4 left-4 z-50 p-2 bg-gray-800 rounded-lg text-white"
          aria-label="Open sidebar"
        >
          <FiMenu className="w-6 h-6" />
        </button>
      )}

      <div
        className={`fixed top-0 left-0 h-screen bg-gray-800 text-gray-100 transition-all duration-300 ease-in-out ${
          isExpanded ? "w-64" : "w-20"
        } ${
          isMobile && !isExpanded ? "-translate-x-full" : "translate-x-0"
        } z-40`}
        onMouseEnter={() => !isMobile && setIsExpanded(true)}
        onMouseLeave={() => !isMobile && setIsExpanded(false)}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <div className="flex items-center">
              {showText && isExpanded ? (
                <span className="ml-3 text-3xl font-semibold">Femco</span>
              ) : (
                <span className="ml-3 text-3xl font-semibold">F</span>
              )}
            </div>
            {isMobile && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
                aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
              >
                <FiChevronLeft
                  className={`w-5 h-5 transition-transform duration-300 ${
                    isExpanded ? "" : "rotate-180"
                  }`}
                />
              </button>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {navigationItems.map((item) => (
              <NavItem key={item.id} {...item} />
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-700">
            <div className="flex items-center cursor-pointer p-2 rounded-lg hover:bg-gray-700 transition-colors">
              <FiUser className="w-6 h-6" />
              {showText && isExpanded && (
                <div className="ml-3">
                  <p className="text-sm font-medium">{nombre ?? ""}</p>
                  <p className="text-xs text-gray-400">{correo ?? ""}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {isMobile && isExpanded && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsExpanded(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
