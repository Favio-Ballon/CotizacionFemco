/* eslint-disable react/prop-types */
import { useEffect } from "react";
import { motion } from "framer-motion";

const OverlayLoading = ({
  message,
  additionalMessage,
  size = "medium",
  backgroundColor = "rgba(0, 0, 0, 0.5)",
  textColor = "text-white",
  isOpen,
}) => {
  const sizeClasses = {
    small: "w-8 h-8",
    medium: "w-12 h-12",
    large: "w-16 h-16",
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

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor }}
          role="alert"
          aria-busy="true"
          aria-live="polite"
        >
          <div className="flex flex-col items-center space-y-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "linear",
              }}
              className={`${sizeClasses[size]} rounded-full border-t-4 border-b-4 border-primary-500`}
            >
              <div className="w-full h-full rounded-full border-t-4 border-b-4 border-white opacity-30 animate-pulse" />
            </motion.div>

            <div className="flex flex-col space-y-2">
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`text-center ${textColor} font-medium text-lg`}
              >
                {message}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className={`text-center ${textColor} font-normal text-sm opacity-80`}
              >
                {additionalMessage}
              </motion.div>
            </div>

            <div className="flex space-x-2">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1, 0] }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: "easeInOut",
                  }}
                  className="w-2 h-2 bg-white rounded-full"
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OverlayLoading;
