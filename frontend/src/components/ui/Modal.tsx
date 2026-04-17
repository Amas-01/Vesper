interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="vesper-card max-w-md w-full mx-4 p-6">
        <h2 className="text-lg font-bold mb-4">{title}</h2>
        <div className="mb-6">{children}</div>
        <button onClick={onClose} className="w-full vesper-btn bg-slate-200 hover:bg-slate-300">
          Close
        </button>
      </div>
    </div>
  )
}
