'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function AccountVerify() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [message, setMessage] = useState('Verifying...')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const verifyAccount = async () => {
            const payoutAccountId = searchParams.get('payoutAccountId')
            const userId = searchParams.get('userId')

            if (!payoutAccountId || !userId) {
                setMessage('Could not verify account')
                setLoading(false)
                return
            }

            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/user/verify-payout-account`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ payoutAccountId, userId }),
                    }
                )

                const data = await res.json()

                if (res.status === 200) {
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

        verifyAccount()
    }, [router, searchParams])

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 text-gray-900 px-4">
            <div className="bg-white shadow-xl rounded-3xl p-10 max-w-md w-full text-center space-y-8 transform transition-all duration-300 hover:scale-[1.02]">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                    {message}
                </h1>
                {loading ? (
                    <div className="flex justify-center">
                        <svg
                            className="animate-spin h-8 w-8 text-indigo-600"
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
                            ></circle>
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                        </svg>
                    </div>
                ) : (
                    <p className="text-sm text-gray-500 animate-pulse">
                        You’ll be redirected shortly...
                    </p>
                )}
                <div className="mt-6">
                    <div className="h-1 w-24 bg-indigo-600 rounded-full mx-auto animate-pulse"></div>
                </div>
            </div>
        </div>
    )
}