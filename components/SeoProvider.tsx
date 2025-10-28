'use client'

import { useEffect, useState } from 'react'
import { DefaultSeo } from 'next-seo'
import createSEOConfig from '@/next-seo.config'

export default function SeoProvider({ 
  initialStore = {
    name: '',
    description: '',
    domain: '',
    socialLinks: {},
    logo: '',
    heroImage: ''
  } 
}: { 
  initialStore?: any 
}) {
  const [isMounted, setIsMounted] = useState(false)
  const [storeData, setStoreData] = useState(initialStore)

  useEffect(() => {
    setIsMounted(true)
    // Fetch store data on the client side if needed
    const fetchStoreData = async () => {
      try {
        // Get the slug from the URL path
        const pathSegments = window.location.pathname.split('/')
        const storeSlug = pathSegments[2] // Assuming URL pattern is /store/[slug]
        
        if (storeSlug) {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/store/by/${storeSlug}`)
          if (res.ok) {
            const { data } = await res.json()
            setStoreData(data)
          }
        }
      } catch (error) {
        console.error('Error fetching store data:', error)
      }
    }

    fetchStoreData()
  }, [])

  if (!isMounted) return null

  const seoConfig = createSEOConfig(storeData)
  return <DefaultSeo {...seoConfig} />
}
