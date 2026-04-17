import { useEffect } from 'react'

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
    success: 'vesper-badge-success bg-green-500/20 border border-green-500/30',
    error: 'vesper-badge-danger bg-red-500/20 border border-red-500/30',
    info: 'bg-blue-500/20 border border-blue-500/30 text-blue-300',
    warning: 'vesper-badge-warning bg-yellow-500/20 border border-yellow-500/30',
  }

  return (
    <div className={`${bgClasses[type]} px-4 py-3 rounded-lg shadow-lg animate-fade-in`}>
      <p className="text-sm font-medium">{message}</p>
    </div>
  )
}
