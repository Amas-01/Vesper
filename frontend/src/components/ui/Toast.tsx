import { useState, useEffect } from 'react'

export interface ToastNotification {
  id: string
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
  duration?: number
}

interface ToastProps extends ToastNotification {
  onClose: (id: string) => void
}

export default function Toast({ id, message, type, duration = 5000, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => onClose(id), duration)
    return () => clearTimeout(timer)
  }, [id, duration, onClose])

  const bgClasses = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    warning: 'bg-yellow-500',
  }

  return (
    <div className={`${bgClasses[type]} text-white px-4 py-3 rounded-lg shadow-lg animate-in fade-in slide-in-from-top-4`}>
      {message}
    </div>
  )
}
