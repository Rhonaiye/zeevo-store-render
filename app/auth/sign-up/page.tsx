'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Cookies from 'js-cookie';

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/user/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.message || 'Sign-up failed');
      } else {
        Cookies.set('token', data.data.token)
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
      // Example: const provider = new firebase.auth.GoogleAuthProvider();
      // await firebase.auth().signInWithPopup(provider);
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
        <h1 className="text-3xl sm:text-2xl font-extrabold text-gray-900 text-center mb-6">
          Create Your <span className="text-indigo-600">Zeevo</span> Account
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
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:outline-none bg-white text-base sm:text-sm text-gray-900 placeholder-gray-400"
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
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:outline-none bg-white text-base sm:text-sm text-gray-900 placeholder-gray-400"
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
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:outline-none bg-white text-base sm:text-sm text-gray-900 placeholder-gray-400"
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
              className="w-full bg-indigo-600 text-white py-2 rounded-full hover:bg-indigo-700 transition disabled:opacity-50 flex items-center justify-center gap-2 text-lg sm:text-base font-medium"
            >
              {loading ? 'Signing up...' : 'Sign Up'}
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
          Already have an account?{' '}
          <Link href="/auth/login" className="text-indigo-600 font-medium hover:text-indigo-700 transition">
            Sign In
          </Link>
        </p>
      </motion.div>
    </main>
  );
}