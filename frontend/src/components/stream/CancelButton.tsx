interface CancelButtonProps {
  streamId: bigint
  onCancel: () => void
}

export default function CancelButton({ streamId, onCancel }: CancelButtonProps) {
  return (
    <button
      onClick={onCancel}
      className="vesper-btn px-4 py-2 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition"
    >
      Cancel
    </button>
  )
}
