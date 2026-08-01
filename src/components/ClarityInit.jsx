'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Clarity from '@microsoft/clarity'

const CLARITY_PROJECT_ID = 'xv0yvv94yd'

let clarityInitialized = false

export default function ClarityInit() {
  const pathname = usePathname()

  useEffect(() => {
    if (!clarityInitialized) {
      Clarity.init(CLARITY_PROJECT_ID)
      clarityInitialized = true
    }
  }, [])

  useEffect(() => {
    if (!pathname) return
    Clarity.setTag('page_path', pathname)
  }, [pathname])

  return null
}
