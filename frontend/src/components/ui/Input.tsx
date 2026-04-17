interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export default function Input({ label, error, ...props }: InputProps) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-dark-text mb-2">
          {label}
        </label>
      )}
      <input
        {...props}
        className={`vesper-input ${error ? 'vesper-input-error' : ''}`}
      />
      {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
    </div>
  )
}
