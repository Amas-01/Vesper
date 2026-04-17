export default function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  }

  return (
    <div className={`inline-block ${sizeClasses[size]} animate-spin`}>
      <div className="w-full h-full border-3 border-slate-200 border-t-vesper-600 rounded-full" />
    </div>
  )
}
