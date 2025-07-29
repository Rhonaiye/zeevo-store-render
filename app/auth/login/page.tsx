'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/user/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const Resdata = await res.json();

      if (!res.ok) {
        setError(Resdata?.message || 'Login failed');
      } else {
        Cookies.set('token', Resdata.data.token);
        Cookies.set('user', JSON.stringify(Resdata.user));
        setFormData({ email: '', password: '' });
        setError(null);
        setLoading(false);
        router.push('/dashboard');
      }
    } catch (err) {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      // Placeholder for Google OAuth logic (e.g., using Firebase or another provider)
      console.log('Google Sign-In initiated');
      router.push('/dashboard'); // Redirect after successful sign-in (to be implemented)
    } catch (err) {
      setError('Google Sign-In failed');
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-white px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-gray-100"
      >
        <h2 className="text-3xl sm:text-2xl font-extrabold text-gray-900 text-center mb-6">
          Sign In to <span className="text-indigo-600">Zeevo</span>
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm sm:text-xs font-medium text-gray-700">Email</label>
            <input
              name="email"
              type="email"
              onChange={handleChange}
              value={formData.email}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:outline-none bg-white text-base sm:text-sm text-gray-900 placeholder-gray-400"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-sm sm:text-xs font-medium text-gray-700">Password</label>
            <input
              name="password"
              type="password"
              onChange={handleChange}
              value={formData.password}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:outline-none bg-white text-base sm:text-sm text-gray-900 placeholder-gray-400"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <p className="text-sm sm:text-xs text-red-600 font-medium text-center">{error}</p>
          )}

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-2 rounded-full hover:bg-indigo-700 transition disabled:opacity-50 flex items-center justify-center gap-2 text-lg sm:text-base font-medium"
            >
              {loading ? 'Logging in...' : 'Sign In'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </motion.div>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm sm:text-xs text-gray-600">
            <span className="bg-white/80 px-2">or</span>
          </div>
        </div>

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full bg-white text-gray-900 py-2 rounded-full hover:bg-gray-100 transition disabled:opacity-50 flex items-center justify-center gap-2 text-lg sm:text-base font-medium border border-gray-200"
          >
            {loading ? 'Processing...' : 'Continue with Google'}
            <img
              src="https://www.google.com/favicon.ico"
              alt="Google Icon"
              className="w-5 h-5"
            />
          </button>
        </motion.div>

        <p className="mt-4 text-center text-sm sm:text-xs text-gray-600">
          Don’t have an account?{' '}
          <Link href="/auth/sign-up" className="text-indigo-600 font-medium hover:text-indigo-700 transition">
            Sign Up
          </Link>
        </p>
      </motion.div>
    </main>
  );
}