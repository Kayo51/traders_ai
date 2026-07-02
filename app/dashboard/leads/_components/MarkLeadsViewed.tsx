'use client'
import { useEffect } from 'react'
import { markLeadsViewed } from '../actions'

export function MarkLeadsViewed() {
  useEffect(() => {
    markLeadsViewed()
  }, [])
  return null
}
