// app/not-found.tsx
"use client";

import { useRouter } from "next/navigation";
import { Construction, ArrowLeft } from "lucide-react";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center bg-gray-50">
      <Construction className="w-16 h-16 text-blue-600 mb-4" />
      <h1 className="text-3xl md:text-4xl text-black font-bold mb-3">
        This page is under construction
      </h1>
      <p className="text-gray-600 mb-8 max-w-md">
        We’re working hard to get this page ready for you.  
        In the meantime, let’s take you back home.
      </p>
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Go Back
      </button>
    </div>
  );
}
