interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="vesper-card max-w-md w-full mx-4 p-6 shadow-xl">
        <h2 className="text-xl font-bold text-dark-text mb-4">{title}</h2>
        <div className="mb-6 text-dark-text-secondary">{children}</div>
        <button onClick={onClose} className="w-full vesper-btn-secondary">
          Close
        </button>
      </div>
    </div>
  )
}
