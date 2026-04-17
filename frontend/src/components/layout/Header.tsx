import { Link } from 'react-router-dom'
import ConnectWallet from '../wallet/ConnectWallet'

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-dark-border bg-dark-surface/95 backdrop-blur-md shadow-lg shadow-black/20">
      <div className="container-dark flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 py-4 group">
          <div className="text-2xl font-bold text-gradient">Vesper</div>
          <span className="text-sm text-dark-text-secondary group-hover:text-vesper-400 transition-colors">
            Payment Streaming
          </span>
        </Link>

        <nav className="flex items-center gap-8">
          <Link
            to="/dashboard"
            className="text-dark-text-secondary hover:text-vesper-400 font-medium transition-colors"
          >
            Dashboard
          </Link>
          <Link
            to="/create"
            className="text-dark-text-secondary hover:text-vesper-400 font-medium transition-colors"
          >
            Create Stream
          </Link>
          <a
            href="https://github.com/Amas-01/Vesper"
            target="_blank"
            rel="noopener noreferrer"
            className="text-dark-text-secondary hover:text-vesper-400 font-medium transition-colors"
          >
            Docs
          </a>
        </nav>

        <ConnectWallet />
      </div>
    </header>
  )
}
