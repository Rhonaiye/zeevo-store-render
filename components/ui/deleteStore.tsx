import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2 } from 'lucide-react';
import { FC, useState, useEffect } from 'react';

interface DeleteStoreConfirmationProps {
  isOpen: boolean;
  storeName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteStoreConfirmation: FC<DeleteStoreConfirmationProps> = ({
  isOpen,
  storeName,
  onConfirm,
  onCancel,
}) => {
  const [confirmationText, setConfirmationText] = useState('');

  // Reset input when modal closes
  useEffect(() => {
    if (!isOpen) {
      setConfirmationText('');
    }
  }, [isOpen]);

  const isConfirmEnabled = confirmationText.trim().toLowerCase() === 'delete';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={onCancel}
          role="dialog"
          aria-labelledby="delete-store-title"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-white/95  rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-100/50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <Trash2 className="w-6 h-6 text-red-500" />
                <h2
                  id="delete-store-title"
                  className="text-xl font-bold text-gray-900 tracking-tight"
                >
                  Delete Store
                </h2>
              </div>
              <button
                onClick={onCancel}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-200/50 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4 leading-relaxed font-medium">
              To permanently delete <span className="font-semibold text-gray-900">"{storeName}"</span>, 
              please type <span className="font-semibold text-red-600">delete</span> in the box below.
            </p>

            <input
              type="text"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              className="w-full px-4 py-2 mb-6 rounded-lg border text-black border-gray-300 focus:ring-2 focus:ring-red-500 focus:outline-none text-sm"
              placeholder="Type 'delete' to confirm"
            />

            <div className="flex justify-end gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onCancel}
                className="px-5 py-2.5 bg-gray-200 text-gray-800 rounded-xl text-sm font-semibold hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 shadow-sm"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: isConfirmEnabled ? 1.02 : 1 }}
                whileTap={{ scale: isConfirmEnabled ? 0.98 : 1 }}
                onClick={onConfirm}
                disabled={!isConfirmEnabled}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all focus:outline-none focus:ring-2 shadow-sm ${
                  isConfirmEnabled
                    ? 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 focus:ring-red-500'
                    : 'bg-red-100 text-red-400 cursor-not-allowed'
                }`}
              >
                Delete Store
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DeleteStoreConfirmation;
