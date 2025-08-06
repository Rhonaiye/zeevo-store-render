'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Cookies from 'js-cookie'

export default function UserVerifyPage() {
  const router = useRouter()
  const [message, setMessage] = useState('Verifying...')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const verifyToken = async () => {
      const urlParams = new URLSearchParams(window.location.search)
      const token = urlParams.get('token')

      if (!token) {
        setMessage('No token provided')
        setLoading(false)
        return
      }

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/user/verify-magic-token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        })

        const data = await res.json()

        if (res.status === 200) {
          Cookies.set('token', data.token, { expires: 7 })
          setMessage('✅ Verification successful! Redirecting...')
          setTimeout(() => router.push('/dashboard'), 1500)
        } else {
          setMessage(data.message || '❌ Verification failed')
        }
      } catch (error) {
        console.error(error)
        setMessage('🚨 Something went wrong.')
      } finally {
        setLoading(false)
      }
    }

    verifyToken()
  }, [router])

  return (
    <div className="min-h-screen text-gray-800 bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white shadow-lg rounded-2xl p-8 max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          {loading ? (
            <svg
              className="animate-spin h-8 w-8 text-blue-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              />
            </svg>
          ) : (
            <svg
              className="h-8 w-8 text-green-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 00-1.414 0L9 11.586 6.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l7-7a1 1 0 000-1.414z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </div>
        <h1 className="text-xl font-semibold text-gray-800">{message}</h1>
        {!loading && (
          <p className="text-sm text-gray-500">You’ll be redirected shortly...</p>
        )}
      </div>
    </div>
  )
}
