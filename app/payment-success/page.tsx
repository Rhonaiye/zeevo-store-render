"use client";

import Image from "next/image";
import Link from "next/link";

export default function PaymentSuccessPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 via-gray-50 to-green-50 px-6">
      {/* Main Card */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl shadow-green-100/50 p-12 text-center border border-green-50">
        
        {/* Success Icon */}
        <div className="inline-flex w-20 h-20 bg-gradient-to-br from-green-400 to-green-500 rounded-full items-center justify-center mb-6 shadow-lg shadow-green-200/60">
          <svg 
            className="w-10 h-10 text-white" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path 
              strokeWidth={3.5} 
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">
          Payment Successful
        </h1>
        
        {/* Description */}
        <p className="text-gray-600 mb-10 leading-relaxed">
          Your payment has been processed successfully. A confirmation email has been sent to your inbox.
        </p>

        {/* Button */}
        <Link
          href="/"
          className="block w-full px-6 py-4 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
        >
          Back to Home
        </Link>

      </div>
    </div>
  );
}