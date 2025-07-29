import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, AlertCircle } from 'lucide-react';
import { FC, useEffect } from 'react';

interface NotificationProps {
  isOpen: boolean;
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
  duration?: number; // Auto-dismiss duration in milliseconds
}

const Notification: FC<NotificationProps> = ({
  isOpen,
  message,
  type,
  onClose,
  duration = 5000,
}) => {
  // Auto-dismiss after duration
  useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -10 }}
          transition={{ 
            type: "spring",
            stiffness: 500,
            damping: 30,
            mass: 0.8
          }}
          className={`fixed top-6 left-1/2 -translate-x-1/2 md:left-auto md:right-6 md:translate-x-0 w-80 max-w-xs mx-4 md:mx-0 z-50 group`}
          role="alert"
          aria-live="assertive"
        >
          <div className="relative overflow-hidden rounded-2xl backdrop-blur-xl border border-gray-200/50 bg-white/90 shadow-2xl">
            {/* Content */}
            <div className="relative px-5 py-3.5">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 p-1 rounded-full bg-gray-100/80">
                  {type === 'success' ? (
                    <Bell className="w-3 h-3 text-gray-600" />
                  ) : (
                    <AlertCircle className="w-3 h-3 text-gray-600" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 leading-relaxed">
                    {message}
                  </p>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="flex-shrink-0 text-gray-400 hover:text-gray-600 rounded-full hover:bg-white/60 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300/50 focus:ring-offset-1 focus:ring-offset-transparent"
                  aria-label="Close notification"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>
              
              {/* Progress bar for auto-dismiss */}
              {duration > 0 && (
                <motion.div
                  className={`absolute bottom-0 left-0 h-1 rounded-b-2xl
                    ${type === 'success' 
                      ? 'bg-gradient-to-r from-emerald-400 to-green-500' 
                      : 'bg-gradient-to-r from-red-400 to-rose-500'
                    }`}
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: duration / 1000, ease: 'linear' }}
                />
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Notification;