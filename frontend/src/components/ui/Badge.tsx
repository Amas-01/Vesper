interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'primary'
}

export default function Badge({ children, variant = 'default' }: BadgeProps) {
  const variantClasses = {
    default: 'vesper-badge-neutral',
    primary: 'vesper-badge-primary',
    success: 'vesper-badge-success',
    warning: 'vesper-badge-warning',
    error: 'vesper-badge-danger',
    info: 'bg-blue-500/20 text-blue-300',
  }

  return <span className={`vesper-badge ${variantClasses[variant]}`}>{children}</span>
}
