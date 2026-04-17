interface CancelButtonProps {
  onCancel: () => void
}

export default function CancelButton({ onCancel }: CancelButtonProps) {
  return (
    <button
      onClick={onCancel}
      className="vesper-btn px-4 py-2 bg-red-500/20 text-red-300 border border-red-500/30
                   hover:bg-red-500/30 transition-all"
    >
      Cancel
    </button>
  )
}
