'use client'

import { useEffect, useState } from 'react'
import { DefaultSeo } from 'next-seo'
import SEOConfig from '@/next-seo.config'

export default function SeoProvider() {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) return null // avoid SSR errors during build

  return <DefaultSeo {...SEOConfig} />
}
