import { Link } from 'react-router-dom'
import ConnectWallet from '../wallet/ConnectWallet'

export default function Header() {
  return (
    <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="text-2xl font-bold text-vesper-600">Vesper</div>
          <span className="text-sm text-slate-500">Payment Streaming</span>
        </Link>

        <nav className="flex items-center gap-6">
          <Link to="/dashboard" className="text-slate-600 hover:text-vesper-600 font-medium transition">
            Dashboard
          </Link>
          <Link to="/create" className="text-slate-600 hover:text-vesper-600 font-medium transition">
            Create Stream
          </Link>
          <a
            href="https://github.com/Amas-01/Vesper"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-600 hover:text-vesper-600 font-medium transition"
          >
            Docs
          </a>
        </nav>

        <ConnectWallet />
      </div>
    </header>
  )
}
