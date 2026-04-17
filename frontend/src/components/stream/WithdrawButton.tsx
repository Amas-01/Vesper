interface WithdrawButtonProps {
  streamId: bigint
  claimableAmount: bigint
}

export default function WithdrawButton({ streamId, claimableAmount }: WithdrawButtonProps) {
  const stxAmount = (Number(claimableAmount) / 1_000_000).toFixed(2)
  const isDisabled = claimableAmount === 0n

  return (
    <button
      disabled={isDisabled}
      className={`flex-1 vesper-btn font-semibold ${
        isDisabled
          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
          : 'vesper-btn-primary'
      }`}
    >
      Claim {stxAmount} STX
    </button>
  )
}
