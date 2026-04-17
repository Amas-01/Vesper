export default function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  }

  return (
    <div className={`inline-block ${sizeClasses[size]} animate-spin`}>
      <div className="w-full h-full border-2 border-slate-dark-700 border-t-vesper-500 rounded-full" />
    </div>
  )
}
