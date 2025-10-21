'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Cookies from 'js-cookie';
import { Info, CheckCircle, XCircle } from 'lucide-react';

const VerifyKYC: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    nin: '',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setResult(null);
    
    const payload = {
      nin: formData.nin,
    };

    try {
      const token = Cookies.get('token');

      const endpoint = 'verify/nin';
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/user/kyc/${endpoint}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Verification failed');
      }
      
      setResult(data);
    } catch (err: any) {
      setResult({
        error: err.message || 'Verification failed',
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nin: '',
    });
    setResult(null);
  };

  return (
    <div className="fixed bottom-4 right-4 md:bottom-10 md:right-6 z-50">
      {/* Toggle Button with Pulse Animation */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="relative px-4 py-2 md:px-5 md:py-2.5 bg-emerald-600 text-white rounded-full shadow-lg hover:bg-emerald-700 transition-all duration-200 font-medium text-sm md:text-base"
        animate={!isOpen ? {
          scale: [1, 1.05, 1],
        } : {}}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {!isOpen && (
          <motion.span
            className="absolute inset-0 rounded-full bg-emerald-600 opacity-75"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.75, 0, 0.75],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}
        <span className="relative z-10">
          {isOpen ? 'Close' : 'Complete KYC to recieve payments'}
        </span>
      </motion.button>

      {/* Backdrop Blur */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm"
            style={{ zIndex: -1 }}
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Slide-up Form */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed bottom-16 left-4 right-4 md:bottom-24 md:left-auto md:right-6 md:w-96 bg-white border border-gray-200 rounded-2xl shadow-2xl p-4 md:p-5 z-50 max-h-[85vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="mb-4">
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-1">
                KYC Verification
              </h3>
              <p className="text-xs md:text-sm text-gray-600">
                Verify your identity to start collecting payments in your store
              </p>
            </div>

            {/* Verification Type Tabs */}
            <div className="mb-4 bg-emerald-50 border border-emerald-200 p-3 rounded-lg">
              <p className="text-xs text-emerald-800 font-medium flex items-center gap-2">
                <Info className="w-4 h-4" />
                Verification Method: <span className="font-bold">NIN (National Identity Number)</span>
              </p>
            </div>

            {/* Form Fields */}
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  NIN Number
                </label>
                <input
                  type="text"
                  name="nin"
                  placeholder="Enter your 11-digit NIN"
                  value={formData.nin}
                  onChange={handleChange}
                  maxLength={11}
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-base md:text-base focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              <button
                disabled={loading}
                onClick={handleSubmit}
                className={`w-full mt-2 py-3 rounded-lg text-white font-semibold text-sm md:text-base ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-700 active:scale-98'
                } transition-all duration-200`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Verifying...
                  </span>
                ) : (
                  'Verify & Continue'
                )}
              </button>
            </div>

            {/* Result Display */}
            {result && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4"
              >
                {result.error ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-xs md:text-sm text-red-800 font-medium flex items-center gap-2">
                      <XCircle className="w-4 h-4 flex-shrink-0" />
                      {result.error}
                    </p>
                  </div>
                ) : (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                    <p className="text-xs md:text-sm text-emerald-800 font-medium mb-2 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 flex-shrink-0" />
                      Verification Successful
                    </p>
                    <pre className="bg-white p-2 rounded-md text-xs overflow-auto max-h-32 text-gray-700">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VerifyKYC;