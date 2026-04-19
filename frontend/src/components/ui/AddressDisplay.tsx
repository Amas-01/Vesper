/**
 * AddressDisplay Component
 * Shows Stacks addresses with optional BNS name resolution and copy-to-clipboard
 */

import { useState } from 'react'

interface AddressDisplayProps {
  address: string
  bnsName?: string
  showCopy?: boolean
  truncate?: boolean
  className?: string
}

export default function AddressDisplay({
  address,
  bnsName,
  showCopy = true,
  truncate = true,
  className = '',
}: AddressDisplayProps) {
  const [copied, setCopied] = useState(false)

  const displayText = bnsName || (truncate ? `${address.slice(0, 10)}...${address.slice(-4)}` : address)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <code className="text-sm font-mono text-vesper-300 bg-dark-border/50 px-2 py-1 rounded">
        {displayText}
      </code>
      {showCopy && (
        <button
          onClick={handleCopy}
          className="text-dark-text-secondary hover:text-vesper-400 transition-colors"
          title="Copy to clipboard"
        >
          {copied ? '✓' : '📋'}
        </button>
      )}
    </div>
  )
}
