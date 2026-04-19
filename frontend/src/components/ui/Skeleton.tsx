/**
 * Skeleton Loading Component
 * Displays pulsing skeleton loaders for loading states
 */

interface SkeletonProps {
  className?: string
  count?: number
}

export default function Skeleton({ className = 'h-12 w-full', count = 1 }: SkeletonProps) {
  const skeletons = Array.from({ length: count })

  return (
    <>
      {skeletons.map((_, i) => (
        <div
          key={i}
          className={`${className} bg-dark-border/50 rounded-lg animate-pulse`}
        />
      ))}
    </>
  )
}
