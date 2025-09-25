'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import Cookies from 'js-cookie';
import { GoogleLogin } from "@react-oauth/google";

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  });

  const [isVerifying, setIsVerifying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleBackToSignup = () => {
    setIsVerifying(false);
    setError(null);
    Cookies.remove('user_email');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
      console.error('API base URL is not defined');
      setError('Server configuration error. Please try again later.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/user/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      console.log('Signup response:', { status: res.status, data });

      if (res.status === 200) {
        Cookies.set('user_email', form.email);
        setIsVerifying(true); // Show magic link confirmation
      } else {
        setError(data?.message || 'Sign-up failed');
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError('Failed to connect to the server. Please check your connection and try again.');
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
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/user/google-signup`,
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
      <div className="flex w-full max-w-7xl mx-auto items-center flex-col lg:flex-row">
        {/* Sidebar for lg screens */}
        <div className="hidden lg:block lg:w-1/2 pr-12">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <h2 className="text-4xl font-extrabold text-gray-900">
              Welcome to <span className="text-[#03E525]">Zeevo</span>
            </h2>
            <p className="text-lg text-gray-600">
              Zeevo is your ultimate e-commerce store builder and inventory management platform. We empower businesses to create stunning online stores and manage their inventory with ease, helping you grow your online presence effortlessly.
            </p>
            <ul className="space-y-4 text-gray-600">
              <li className="flex items-center gap-2">
                <span className="text-[#03E525]">✓</span> Build beautiful online stores
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#03E525]">✓</span> Streamlined inventory management
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#03E525]">✓</span> Boost your online presence
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Form Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-gray-100 sm:mx-auto"
        >
          {!isVerifying ? (
            <>
              <h1 className="text-3xl sm:text-2xl font-extrabold text-gray-900 text-center mb-6">
                Create Your <span className="text-[#03E525]">Zeevo</span> Account
              </h1>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block mb-1 text-sm sm:text-xs font-medium text-gray-700">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#037834] 0 focus:outline-none bg-white text-base sm:text-sm text-gray-900 placeholder-gray-400"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm sm:text-xs font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#037834] focus:outline-none bg-white text-base sm:text-sm text-gray-900 placeholder-gray-400"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm sm:text-xs font-medium text-gray-700">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#037834] focus:outline-none bg-white text-base sm:text-sm text-gray-900 placeholder-gray-400"
                    placeholder="••••••••"
                  />
                </div>

                {error && (
                  <p className="text-sm sm:text-xs text-red-600 font-medium text-center">{error}</p>
                )}

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#037834] text-white py-2 rounded-full hover:bg-[#037834]/90 transition disabled:opacity-50 flex items-center justify-center gap-2 text-lg sm:text-base font-medium"
                  >
                    {loading ? 'Creating Account...' : 'Create Account'}
                    {!loading && <ArrowRight className="w-4 h-4" />}
                  </button>
                </motion.div>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-xs sm:text-xs text-gray-600">
                  <span className="bg-white/80 px-2">or</span>
                </div>
              </div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <GoogleLogin
                   onSuccess={handleGoogleSignIn}
                   onError={() => setError("Google login failed")}
                  />
              </motion.div>

              <p className="mt-4 text-center text-sm sm:text-xs text-gray-600">
                Already have an account?{' '}
                <Link href="/auth/login" className="text-[#037834] font-medium hover:text-[#037834]/50 transition">
                  Sign In
                </Link>
              </p>
            </>
          ) : (
            <>
              <h1 className="text-3xl sm:text-2xl font-extrabold text-gray-900 text-center mb-6">
                Check Your Email for <span className="text-indigo-600">Zeevo</span> Magic Link
              </h1>
              <p className="text-center text-sm text-gray-600 mb-6">
                We sent a magic link to {form.email}. Click the link in your email to verify your account and access your dashboard.
              </p>

              {error && (
                <p className="text-sm sm:text-xs text-red-600 font-medium text-center">{error}</p>
              )}

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <button
                  type="button"
                  onClick={handleBackToSignup}
                  disabled={loading}
                  className="w-full bg-gray-200 text-gray-900 py-2 rounded-full hover:bg-gray-300 transition disabled:opacity-50 flex items-center justify-center gap-2 text-lg sm:text-base font-medium"
                >
                  Back to Sign Up
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </motion.div>
            </>
          )}
        </motion.div>
      </div>
    </main>
  );
}