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
      // Extract token from URL manually
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
          Cookies.set('token', data.token, { expires: 7 }) // Save token in cookies
          setMessage('Verification successful! Redirecting...')
          setTimeout(() => router.push('/dashboard'), 1500)
        } else {
          setMessage(data.message || 'Verification failed')
        }
      } catch (error) {
        console.error(error)
        setMessage('Something went wrong.')
      } finally {
        setLoading(false)
      }
    }

    verifyToken()
  }, [router])

  return (
    <div style={{ textAlign: 'center', marginTop: '20vh' }}>
      <h1>{loading ? 'Please wait...' : message}</h1>
    </div>
  )
}
