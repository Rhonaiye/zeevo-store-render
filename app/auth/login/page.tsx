"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ Redirect if already logged in
  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      router.replace("/dashboard");
    }
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/user/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data?.message || "Login failed");
      } else {
        Cookies.set("token", data.data.token);
        Cookies.set("user", JSON.stringify(data.user));
        router.replace("/dashboard");
      }
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async (credentialResponse: any) => {
    setLoading(true);
    setError(null);

    try {
      if (!credentialResponse || typeof credentialResponse.credential !== "string") {
        throw new Error("Google credential not ready yet");
      }

      const idToken = credentialResponse.credential;

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/user/google-login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Google login failed");
      }

      Cookies.set("token", data.token);
      Cookies.set("user", JSON.stringify(data.user));

      router.replace("/dashboard");
    } catch (err: any) {
      console.error("Google Sign-In Error:", err);
      setError(err.message || "Google Sign-In failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#DCFEDE] px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-gray-100"
      >
        <h2 className="text-3xl sm:text-2xl font-extrabold text-gray-900 text-center mb-6">
          Sign In to <span className="text-[#03E525]">Zeevo</span>
        </h2>

        {/* Email + Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              name="email"
              type="email"
              onChange={handleChange}
              value={formData.email}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#037834] focus:outline-none"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              name="password"
              type="password"
              onChange={handleChange}
              value={formData.password}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#037834] focus:outline-none"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 font-medium text-center">{error}</p>
          )}

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#037834] text-white py-2 rounded-full hover:bg-[#037834]/90 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? "Logging in..." : "Sign In"}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </motion.div>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm text-gray-600">
            <span className="bg-white/80 px-2">or</span>
          </div>
        </div>

        {/* Google Login Button */}
        <GoogleLogin
          onSuccess={handleGoogleSignIn}
          onError={() => setError("Google login failed")}
        />

        <p className="mt-4 text-center text-sm text-gray-600">
          Don’t have an account?{" "}
          <Link
            href="/auth/sign-up"
            className="text-[#037834] font-medium hover:text-[#037834]/70 transition"
          >
            Sign Up
          </Link>
        </p>
      </motion.div>
    </main>
  );
}
