interface WithdrawButtonProps {
  streamId: bigint
  claimableAmount: bigint
}

export default function WithdrawButton({ claimableAmount }: WithdrawButtonProps) {
  const stxAmount = (Number(claimableAmount) / 1_000_000).toFixed(2)
  const isDisabled = claimableAmount === 0n

  return (
    <button
      disabled={isDisabled}
      className={`flex-1 vesper-btn font-semibold ${
        isDisabled
          ? 'bg-slate-dark-800 text-dark-text-secondary cursor-not-allowed opacity-50'
          : 'vesper-btn-primary'
      }`}
    >
      Claim {stxAmount} STX
    </button>
  )
}
